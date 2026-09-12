from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.db.session import get_db
from app.db.models import PackagingMaterial
from app.schemas.domain import PackagingMaterialResponse, PackagingMaterialBase

router = APIRouter(prefix="/materials", tags=["Packaging Materials Database"])

class MaterialComparisonRequest(BaseModel):
    material_ids: List[str]

@router.get("", response_model=List[PackagingMaterialResponse])
def list_materials(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name or code"),
    db: Session = Depends(get_db)
):
    query = db.query(PackagingMaterial)
    if category:
        query = query.filter(PackagingMaterial.category == category)
    if search:
        query = query.filter(
            (PackagingMaterial.name.ilike(f"%{search}%")) |
            (PackagingMaterial.code.ilike(f"%{search}%")) |
            (PackagingMaterial.base_polymer.ilike(f"%{search}%"))
        )
    return query.order_by(PackagingMaterial.category, PackagingMaterial.name).all()

@router.get("/{material_id}", response_model=PackagingMaterialResponse)
def get_material(material_id: str, db: Session = Depends(get_db)):
    item = db.query(PackagingMaterial).filter(PackagingMaterial.id == material_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Packaging material not found.")
    return item

import math

@router.post("/compare")
def compare_materials(req: MaterialComparisonRequest, db: Session = Depends(get_db)):
    items = db.query(PackagingMaterial).filter(PackagingMaterial.id.in_(req.material_ids)).all()
    if not items:
        raise HTTPException(status_code=404, detail="No matching materials found for comparison.")
    return {
        "count": len(items),
        "materials": items,
        "metrics_radar": [
            {
                "metric": "Oxygen Barrier (Inverse Log OTR)",
                **{m.code: round(max(1.0, min(10.0, 8.5 - 1.5 * math.log10(max(0.01, m.otr_at_23c)))), 1) for m in items}
            },
            {
                "metric": "Moisture Barrier (Inverse Log WVTR)",
                **{m.code: round(max(1.0, min(10.0, 7.5 - 3.5 * math.log10(max(0.01, m.wvtr_at_38c)))), 1) for m in items}
            },
            {
                "metric": "Tensile Strength",
                **{m.code: round(min(10.0, m.tensile_strength_mpa / 25.0), 1) for m in items}
            },
            {
                "metric": "Eco Sustainability",
                **{m.code: 9.5 if m.is_biodegradable else (8.0 if m.is_recyclable else 4.0) for m in items}
            },
            {
                "metric": "Cost Competitiveness",
                **{m.code: round(max(2.0, min(10.0, 10.0 - (m.approx_cost_inr_per_kg / 50.0))), 1) for m in items}
            }
        ]
    }
