from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.db.models import PackagingRecommendation, PackagingMaterial, User
from app.schemas.domain import RecommendationRequest, RecommendationResponse
from app.engine.recommender import PackagingRecommender
from app.core.security import get_current_user_optional

router = APIRouter(prefix="/recommend", tags=["AI Packaging Recommendation Engine"])

@router.post("", response_model=RecommendationResponse)
def create_recommendation(
    req: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # Fetch packaging materials
    materials = db.query(PackagingMaterial).all()
    
    # Generate recommendation via physics & AI engine
    result = PackagingRecommender.generate_recommendation(req, db_materials=materials)
    
    # Save recommendation to DB
    rec_record = PackagingRecommendation(
        id=result.id,
        user_id=current_user.id if current_user else None,
        commodity_id=req.commodity_id,
        commodity_name=result.commodity_name,
        input_parameters=req.model_dump(),
        target_otr=result.target_otr,
        target_wvtr=result.target_wvtr,
        target_co2tr=result.target_co2tr,
        primary_material_name=result.primary_material_name,
        primary_material_code=result.primary_material_code,
        recommended_structure_type=result.recommended_structure_type,
        recommended_total_thickness_um=result.recommended_total_thickness_um,
        laminate_layers=[l.model_dump() for l in result.laminate_layers],
        is_map_recommended=result.is_map_recommended,
        map_gas_o2_pct=result.map_gas_o2_pct,
        map_gas_co2_pct=result.map_gas_co2_pct,
        map_gas_n2_pct=result.map_gas_n2_pct,
        is_micro_perforated=result.micro_perforation_spec.is_required if result.micro_perforation_spec else False,
        micro_perforation_spec=result.micro_perforation_spec.model_dump() if result.micro_perforation_spec else None,
        alternative_options=result.alternative_options,
        predicted_shelf_life_days=result.predicted_shelf_life_days,
        shelf_life_gain_multiplier=result.shelf_life_gain_multiplier,
        sustainability_score=result.sustainability_score,
        recyclability_grade=result.recyclability_grade,
        carbon_footprint_per_1000_packs_kg=result.carbon_footprint_per_1000_packs_kg,
        cost_estimate_per_1000_packs_inr=result.cost_estimate_per_1000_packs_inr,
        technical_notes=result.technical_notes
    )
    
    db.add(rec_record)
    db.commit()
    db.refresh(rec_record)
    
    return result

@router.get("/history")
def get_recommendation_history(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = db.query(PackagingRecommendation)
    if current_user:
        query = query.filter(PackagingRecommendation.user_id == current_user.id)
    return query.order_by(PackagingRecommendation.created_at.desc()).limit(20).all()

@router.get("/{rec_id}")
def get_recommendation_by_id(rec_id: str, db: Session = Depends(get_db)):
    rec = db.query(PackagingRecommendation).filter(PackagingRecommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation record not found.")
    return rec
