from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import PackagingRecommendation, FoodCommodity
from app.schemas.domain import SimulationRequest, SimulationResponse
from app.engine.physics import PackagingPhysicsEngine

router = APIRouter(prefix="/simulate", tags=["Shelf-Life & Kinetic Simulation"])

@router.post("", response_model=SimulationResponse)
def run_shelf_life_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    # Look up base commodity or recommendation
    moisture = 20.0
    fat = 5.0
    is_resp = False
    film_otr = req.custom_otr or 25.0
    film_wvtr = req.custom_wvtr or 1.5
    
    if req.recommendation_id:
        rec = db.query(PackagingRecommendation).filter(PackagingRecommendation.id == req.recommendation_id).first()
        if rec and rec.input_parameters:
            moisture = rec.input_parameters.get("moisture_content", 20.0)
            fat = rec.input_parameters.get("fat_content", 5.0)
            is_resp = rec.input_parameters.get("is_respiring", False)
            film_otr = req.custom_otr or rec.target_otr
            film_wvtr = req.custom_wvtr or rec.target_wvtr
    else:
        commodity = db.query(FoodCommodity).filter(FoodCommodity.name == req.commodity_name).first()
        if commodity:
            moisture = commodity.moisture_content
            fat = commodity.fat_content
            is_resp = commodity.is_respiring
            
    sim_result = PackagingPhysicsEngine.simulate_degradation_kinetics(
        commodity_name=req.commodity_name,
        initial_moisture_pct=moisture,
        fat_pct=fat,
        is_respiring=is_resp,
        duration_days=req.duration_days,
        storage_temp_c=req.storage_temperature_c,
        storage_rh_pct=req.relative_humidity_pct,
        film_otr=film_otr,
        film_wvtr=film_wvtr,
        is_map_active=req.is_map_applied
    )
    
    return SimulationResponse(
        test_temperature_c=sim_result["test_temperature_c"],
        test_relative_humidity_pct=sim_result["test_relative_humidity_pct"],
        duration_days=sim_result["duration_days"],
        timeline_data=sim_result["timeline_data"],
        spoilage_day=sim_result["spoilage_day"],
        final_quality_score=sim_result["final_quality_score"],
        limiting_factor=sim_result["limiting_factor"],
        summary_insight=sim_result["summary_insight"]
    )
