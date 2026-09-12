from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    organization_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "MEMBER"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# --- Food Commodity Schemas ---
class FoodCommodityBase(BaseModel):
    name: str
    category: str
    subcategory: Optional[str] = None
    moisture_content: float
    fat_content: float = 0.0
    ph: float = 6.5
    water_activity: float = 0.85
    is_respiring: bool = False
    respiration_rate_o2: float = 0.0
    respiration_rate_co2: float = 0.0
    respiration_quotient: float = 1.0
    respiration_class: str = "NONE"
    oxygen_sensitivity: str = "MEDIUM"
    moisture_sensitivity: str = "MEDIUM"
    light_sensitivity: str = "LOW"
    ethylene_sensitivity: str = "LOW"
    optimal_temp_min: float = 4.0
    optimal_temp_max: float = 10.0
    optimal_rh_min: float = 85.0
    optimal_rh_max: float = 95.0
    baseline_shelf_life_ambient_days: float = 3.0
    baseline_shelf_life_refrigerated_days: float = 14.0
    optimal_map_o2_pct: Optional[float] = None
    optimal_map_co2_pct: Optional[float] = None
    optimal_map_n2_pct: Optional[float] = None
    description: Optional[str] = None
    degradation_mechanisms: List[str] = []

class FoodCommodityResponse(FoodCommodityBase):
    id: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# --- Packaging Material Schemas ---
class PackagingMaterialBase(BaseModel):
    name: str
    code: str
    category: str
    base_polymer: str
    typical_thickness_um: float = 25.0
    density_g_cm3: float = 0.92
    otr_at_23c: float
    wvtr_at_38c: float
    co2tr_at_23c: Optional[float] = None
    tensile_strength_mpa: float = 30.0
    puncture_resistance_n: float = 15.0
    seal_initiation_temp_c: float = 110.0
    transparency_pct: float = 85.0
    is_biodegradable: bool = False
    is_home_compostable: bool = False
    is_industrial_compostable: bool = False
    is_recyclable: bool = True
    recycling_code: int = 4
    carbon_footprint_kg_co2_per_kg: float = 2.1
    compost_timeline_days: Optional[int] = None
    approx_cost_inr_per_kg: float = 160.0
    description: Optional[str] = None
    suitable_applications: List[str] = []
    limitations: List[str] = []

class PackagingMaterialResponse(PackagingMaterialBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Recommendation Request & Response ---
class RecommendationRequest(BaseModel):
    commodity_id: Optional[str] = None
    commodity_name: str
    category: str
    
    # Intrinsic parameters (can override or be custom)
    moisture_content: float = Field(..., ge=0.0, le=100.0, description="Moisture content in %")
    fat_content: float = Field(default=0.0, ge=0.0, le=100.0, description="Oil/Fat content in %")
    ph: float = Field(default=6.5, ge=1.0, le=14.0)
    water_activity: float = Field(default=0.85, ge=0.0, le=1.0)
    
    # Respiration parameters (if fresh produce)
    is_respiring: bool = False
    respiration_rate_o2: Optional[float] = Field(default=0.0, description="mg O2 / kg·h at 20°C")
    respiration_rate_co2: Optional[float] = Field(default=0.0, description="mg CO2 / kg·h at 20°C")
    
    # Logistics & Target environment
    desired_shelf_life_days: float = Field(default=30.0, gt=0)
    storage_type: str = Field(default="AMBIENT", description="AMBIENT, CHILLED, or FROZEN")
    storage_temperature_c: float = Field(default=25.0)
    storage_relative_humidity_pct: float = Field(default=65.0, ge=0.0, le=100.0)
    transportation_stress: str = Field(default="MEDIUM", description="LOW, MEDIUM, HIGH, ROUGH_ROAD")
    
    # Package dimensions & load
    package_weight_grams: float = Field(default=250.0, gt=0)
    package_surface_area_cm2: float = Field(default=400.0, gt=0)
    headspace_volume_cm3: float = Field(default=100.0, ge=0)
    
    # User priorities
    eco_priority: str = Field(default="BALANCED", description="BALANCED, MAX_SUSTAINABILITY, LOWEST_COST, MAXIMUM_BARRIER")

class LaminateLayer(BaseModel):
    layer_number: int
    role: str # e.g. "Outer / Print Layer", "Core Barrier Layer", "Inner Sealant & Food Contact Layer"
    material_name: str
    material_code: str
    thickness_um: float
    barrier_contribution: str

class MicroPerforationSpec(BaseModel):
    is_required: bool
    pore_diameter_um: float
    pores_per_package: int
    perforation_density_pores_m2: float
    total_open_area_mm2: float
    gas_flux_compensation_ratio: float

class RecommendationResponse(BaseModel):
    id: str
    commodity_name: str
    
    # Target calculations
    target_otr: float
    target_wvtr: float
    target_co2tr: Optional[float] = None
    
    # Primary Recommendation
    primary_material_name: str
    primary_material_code: str
    recommended_structure_type: str
    recommended_total_thickness_um: float
    laminate_layers: List[LaminateLayer] = []
    
    # MAP & Produce
    is_map_recommended: bool
    map_gas_o2_pct: Optional[float] = None
    map_gas_co2_pct: Optional[float] = None
    map_gas_n2_pct: Optional[float] = None
    micro_perforation_spec: Optional[MicroPerforationSpec] = None
    
    # Alternatives
    alternative_options: List[Dict[str, Any]] = []
    
    # Predictions
    predicted_shelf_life_days: float
    shelf_life_gain_multiplier: float
    sustainability_score: float # 0 - 100
    recyclability_grade: str
    carbon_footprint_per_1000_packs_kg: float
    cost_estimate_per_1000_packs_inr: float
    
    technical_notes: List[str] = []
    created_at: datetime

# --- Simulation Request & Response ---
class SimulationRequest(BaseModel):
    recommendation_id: Optional[str] = None
    commodity_name: str
    storage_temperature_c: float = 25.0
    relative_humidity_pct: float = 75.0
    duration_days: int = 60
    custom_otr: Optional[float] = None
    custom_wvtr: Optional[float] = None
    is_map_applied: bool = False
    initial_quality_score: float = 100.0

class TimelinePoint(BaseModel):
    day: int
    quality_score: float
    moisture_content_pct: float
    lipid_oxidation_index: float
    microbial_cfu_log: float
    headspace_o2_pct: float
    headspace_co2_pct: float
    status: str # "FRESH", "ACCEPTABLE", "SUB-OPTIMAL", "SPOILED"

class SimulationResponse(BaseModel):
    test_temperature_c: float
    test_relative_humidity_pct: float
    duration_days: int
    timeline_data: List[TimelinePoint]
    spoilage_day: Optional[int]
    final_quality_score: float
    limiting_factor: str
    summary_insight: str

# --- Traceability Passport Schemas ---
class PassportCreateRequest(BaseModel):
    recommendation_id: str
    batch_lot_number: str
    manufacturer_name: str
    facility_location: str
    shelf_life_days_granted: int

class PassportResponse(BaseModel):
    id: str
    passport_code: str
    commodity_name: str
    batch_lot_number: str
    pack_date: datetime
    expiry_date: datetime
    packaging_structure: str
    target_storage_temp_c: float
    target_storage_rh_pct: float
    map_gas_flush: Optional[str]
    qr_code_data_url: str
    manufacturer_info: Dict[str, Any]
    compliance_certifications: List[str]
    is_verified: bool
    created_at: datetime
