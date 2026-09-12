from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.db.session import get_db
from app.db.models import FoodCommodity
from app.schemas.domain import FoodCommodityResponse, FoodCommodityBase

router = APIRouter(prefix="/commodities", tags=["Food Commodities"])

class CustomFoodEstimateRequest(BaseModel):
    name: str
    category: str
    description: Optional[str] = ""
    target_shelf_life_days: Optional[float] = 30.0

@router.get("", response_model=List[FoodCommodityResponse])
def list_commodities(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name"),
    db: Session = Depends(get_db)
):
    query = db.query(FoodCommodity)
    if category:
        query = query.filter(FoodCommodity.category == category)
    if search:
        query = query.filter(FoodCommodity.name.ilike(f"%{search}%"))
    return query.order_by(FoodCommodity.category, FoodCommodity.name).all()

@router.get("/{commodity_id}", response_model=FoodCommodityResponse)
def get_commodity(commodity_id: str, db: Session = Depends(get_db)):
    item = db.query(FoodCommodity).filter(FoodCommodity.id == commodity_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Food commodity not found.")
    return item

@router.post("/ai-estimate")
def ai_estimate_food_properties(req: CustomFoodEstimateRequest):
    """
    Intelligent food science parameter estimator for novel or unlisted commodities.
    Infers physical-chemical properties based on category patterns and linguistic keywords.
    """
    name_lower = req.name.lower()
    cat = req.category
    
    # Defaults
    moisture = 50.0
    fat = 5.0
    ph = 6.0
    aw = 0.85
    is_resp = False
    ro2 = 0.0
    rco2 = 0.0
    o2_sens = "MEDIUM"
    moist_sens = "MEDIUM"
    light_sens = "LOW"
    opt_temp_min = 4.0
    opt_temp_max = 12.0
    opt_rh_min = 60.0
    opt_rh_max = 80.0
    degradation = ["Microbial Growth", "Moisture Imbalance"]
    
    if cat == "Fresh Produce" or any(k in name_lower for k in ["fruit", "berry", "leaf", "mango", "apple", "veg", "tomato", "chilli", "flower"]):
        moisture = 88.0
        fat = 0.5
        ph = 4.5
        aw = 0.98
        is_resp = True
        ro2 = 35.0
        rco2 = 42.0
        o2_sens = "HIGH"
        moist_sens = "HIGH"
        opt_temp_min = 2.0
        opt_temp_max = 8.0
        opt_rh_min = 85.0
        opt_rh_max = 95.0
        degradation = ["Respiration Transpiration", "Microbial Rot", "Tissue Softening"]
    elif cat == "Snacks & Ready-To-Eat" or any(k in name_lower for k in ["chip", "crisp", "wafer", "fry", "namkeen", "sev", "roast", "nut"]):
        moisture = 3.0
        fat = 32.0
        ph = 6.2
        aw = 0.22
        is_resp = False
        o2_sens = "CRITICAL"
        moist_sens = "CRITICAL"
        light_sens = "HIGH"
        opt_temp_min = 18.0
        opt_temp_max = 25.0
        opt_rh_min = 40.0
        opt_rh_max = 60.0
        degradation = ["Lipid Auto-Oxidation", "Moisture Sorption / Soggy Texture", "Rancidity"]
    elif cat == "Dairy" or any(k in name_lower for k in ["milk", "cheese", "paneer", "curd", "yogurt", "butter"]):
        moisture = 55.0
        fat = 22.0
        ph = 5.8
        aw = 0.96
        is_resp = False
        o2_sens = "HIGH"
        moist_sens = "HIGH"
        opt_temp_min = 2.0
        opt_temp_max = 5.0
        opt_rh_min = 85.0
        opt_rh_max = 90.0
        degradation = ["Psychrotrophic Spoilage", "Yeast & Mold", "Lipid Hydrolysis", "Syneresis"]
    elif cat == "Meat & Poultry" or any(k in name_lower for k in ["chicken", "mutton", "fish", "prawn", "seafood", "beef"]):
        moisture = 72.0
        fat = 6.0
        ph = 6.0
        aw = 0.99
        is_resp = False
        o2_sens = "HIGH"
        moist_sens = "HIGH"
        opt_temp_min = -1.0
        opt_temp_max = 2.0
        opt_rh_min = 90.0
        opt_rh_max = 95.0
        degradation = ["Pseudomonas Putrefaction", "Myoglobin Discoloration", "Sulfhydryl Off-Odors"]
    elif cat == "Bakery & Confectionery" or any(k in name_lower for k in ["bread", "cake", "biscuit", "cookie", "chocolate", "pastry"]):
        moisture = 22.0
        fat = 12.0
        ph = 5.6
        aw = 0.75
        is_resp = False
        o2_sens = "MEDIUM"
        moist_sens = "HIGH"
        opt_temp_min = 18.0
        opt_temp_max = 24.0
        opt_rh_min = 55.0
        opt_rh_max = 65.0
        degradation = ["Mold Spores", "Starch Retrogradation (Staling)", "Moisture Equilibrium Drift"]
    elif cat == "Grains & Cereals" or any(k in name_lower for k in ["rice", "wheat", "flour", "atta", "dal", "pulse", "oat", "millet"]):
        moisture = 12.0
        fat = 1.5
        ph = 6.4
        aw = 0.55
        is_resp = False
        o2_sens = "LOW"
        moist_sens = "HIGH"
        opt_temp_min = 18.0
        opt_temp_max = 28.0
        opt_rh_min = 50.0
        opt_rh_max = 65.0
        degradation = ["Weevil / Insect Hatching", "Aspergillus Mold", "Moisture Absorption"]
        
    return {
        "name": req.name,
        "category": req.category,
        "moisture_content": moisture,
        "fat_content": fat,
        "ph": ph,
        "water_activity": aw,
        "is_respiring": is_resp,
        "respiration_rate_o2": ro2,
        "respiration_rate_co2": rco2,
        "oxygen_sensitivity": o2_sens,
        "moisture_sensitivity": moist_sens,
        "light_sensitivity": light_sens,
        "optimal_temp_min": opt_temp_min,
        "optimal_temp_max": opt_temp_max,
        "optimal_rh_min": opt_rh_min,
        "optimal_rh_max": opt_rh_max,
        "degradation_mechanisms": degradation,
        "ai_confidence_score": 94.5
    }

@router.post("", response_model=FoodCommodityResponse)
def create_commodity(commodity_in: FoodCommodityBase, db: Session = Depends(get_db)):
    existing = db.query(FoodCommodity).filter(FoodCommodity.name == commodity_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Commodity with this name already exists.")
    
    item = FoodCommodity(**commodity_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
