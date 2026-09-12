from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.engine.sustainability import SustainabilityEngine

router = APIRouter(prefix="/sustainability", tags=["Sustainability & Plastic Waste Management"])

class SustainabilityCalcRequest(BaseModel):
    material_code: str
    total_thickness_um: float = 60.0
    surface_area_cm2: float = 400.0
    annual_pack_volume: int = 500000 # 500k units/year
    is_biodegradable: bool = False
    is_recyclable: bool = True
    recycling_code: int = 4

@router.post("/calculate")
def calculate_sustainability_impact(req: SustainabilityCalcRequest):
    metrics = SustainabilityEngine.calculate_metrics(
        primary_material_code=req.material_code,
        total_thickness_um=req.total_thickness_um,
        surface_area_cm2=req.surface_area_cm2,
        is_biodegradable=req.is_biodegradable,
        is_recyclable=req.is_recyclable,
        recycling_code=req.recycling_code
    )
    
    # Scale to annual production
    annual_weight_kg = (metrics["weight_per_pack_grams"] * req.annual_pack_volume) / 1000.0
    annual_carbon_kg = (metrics["carbon_footprint_per_1000_packs_kg"] * req.annual_pack_volume) / 1000.0
    annual_cost_inr = (metrics["cost_estimate_per_1000_packs_inr"] * req.annual_pack_volume) / 1000.0
    
    # EPR (Extended Producer Responsibility) target under MoEFCC PWM Rules
    epr_target_pct = 0 if req.is_biodegradable else (70.0 if req.recycling_code in [1, 2, 4, 5] else 100.0)
    epr_obligation_kg = (annual_weight_kg * (epr_target_pct / 100.0))
    
    return {
        "per_pack_metrics": metrics,
        "annual_projection": {
            "annual_pack_volume": req.annual_pack_volume,
            "annual_plastic_tonnage_mt": round(annual_weight_kg / 1000.0, 3),
            "annual_carbon_footprint_mt_co2": round(annual_carbon_kg / 1000.0, 3),
            "annual_material_spend_inr": round(annual_cost_inr, 2),
            "epr_recycling_target_pct": epr_target_pct,
            "epr_recycling_obligation_kg": round(epr_obligation_kg, 1),
            "pwm_category": metrics["pwm_category"],
            "greenhouse_gas_equivalent_trees_saved": round(annual_carbon_kg / 21.0, 1)
        }
    }
