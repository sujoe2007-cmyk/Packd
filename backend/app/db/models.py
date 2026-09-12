import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Float, Integer, Text, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    organization_name = Column(String(255), nullable=True)
    role = Column(String(50), default="MEMBER") # SUPER_ADMIN, ORG_ADMIN, MEMBER, RESEARCHER
    is_active = Column(Boolean, default=True)
    mfa_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    recommendations = relationship("PackagingRecommendation", back_populates="user", cascade="all, delete-orphan")

class FoodCommodity(Base):
    __tablename__ = "food_commodities"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False) 
    # Categories: Fresh Produce, Bakery & Confectionery, Dairy, Meat & Poultry, Grains & Cereals, Snacks & Ready-To-Eat, Beverages, Oils & Fats
    subcategory = Column(String(100), nullable=True)
    
    # Intrinsic parameters
    moisture_content = Column(Float, nullable=False) # % (0 - 100)
    fat_content = Column(Float, default=0.0) # % (0 - 100)
    ph = Column(Float, default=6.5)
    water_activity = Column(Float, default=0.85) # aw (0.1 - 1.0)
    
    # Respiration parameters (for respiring produce)
    is_respiring = Column(Boolean, default=False)
    respiration_rate_o2 = Column(Float, default=0.0) # mg O2 / kg·h at 20°C
    respiration_rate_co2 = Column(Float, default=0.0) # mg CO2 / kg·h at 20°C
    respiration_quotient = Column(Float, default=1.0) # RQ = VCO2 / VO2
    respiration_class = Column(String(50), default="NONE") # VERY_LOW, LOW, MODERATE, HIGH, VERY_HIGH, EXTREMELY_HIGH
    
    # Sensitivity profile
    oxygen_sensitivity = Column(String(50), default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    moisture_sensitivity = Column(String(50), default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    light_sensitivity = Column(String(50), default="LOW") # LOW, MEDIUM, HIGH
    ethylene_sensitivity = Column(String(50), default="LOW") # LOW, MEDIUM, HIGH
    
    # Storage & Shelf life baseline
    optimal_temp_min = Column(Float, default=4.0) # °C
    optimal_temp_max = Column(Float, default=10.0) # °C
    optimal_rh_min = Column(Float, default=85.0) # %
    optimal_rh_max = Column(Float, default=95.0) # %
    baseline_shelf_life_ambient_days = Column(Float, default=3.0)
    baseline_shelf_life_refrigerated_days = Column(Float, default=14.0)
    target_unpacked_shelf_life_days = Column(Float, default=5.0)
    
    # Optimal MAP Gas Composition (if applicable)
    optimal_map_o2_pct = Column(Float, nullable=True) # % (e.g., 3-5%)
    optimal_map_co2_pct = Column(Float, nullable=True) # % (e.g., 5-10%)
    optimal_map_n2_pct = Column(Float, nullable=True) # % (balance)
    
    description = Column(Text, nullable=True)
    degradation_mechanisms = Column(JSON, default=list) # e.g. ["Lipid Oxidation", "Moisture Gain", "Mold Growth"]
    created_at = Column(DateTime, default=datetime.utcnow)

class PackagingMaterial(Base):
    __tablename__ = "packaging_materials"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), unique=True, index=True, nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g., LDPE-01, MET-PET-12, PLA-BIO-01
    category = Column(String(100), index=True, nullable=False) # CONVENTIONAL, HIGH_BARRIER, BIODEGRADABLE_COMPOSTABLE, ACTIVE_INTELLIGENT, BREATHABLE
    base_polymer = Column(String(100), nullable=False) # LDPE, HDPE, LLDPE, BOPP, BOPET, EVOH, PVDC, AL_FOIL, PLA, PBAT, PHA, CELLULOSE
    
    # Barrier & Mechanical properties (Standard normalized at typical gauge)
    typical_thickness_um = Column(Float, default=25.0) # micrometers (microns)
    density_g_cm3 = Column(Float, default=0.92) # g/cm3
    otr_at_23c = Column(Float, nullable=False) # cc / (m² · day · atm) at 23°C, 0% RH
    wvtr_at_38c = Column(Float, nullable=False) # g / (m² · day) at 38°C, 90% RH
    co2tr_at_23c = Column(Float, nullable=True) # cc / (m² · day · atm)
    
    # Mechanical & Thermal
    tensile_strength_mpa = Column(Float, default=30.0) # MPa
    puncture_resistance_n = Column(Float, default=15.0) # Newtons
    seal_initiation_temp_c = Column(Float, default=110.0) # °C
    max_service_temp_c = Column(Float, default=80.0) # °C
    transparency_pct = Column(Float, default=85.0) # % optical clarity
    
    # Sustainability & Eco Profile
    is_biodegradable = Column(Boolean, default=False)
    is_home_compostable = Column(Boolean, default=False)
    is_industrial_compostable = Column(Boolean, default=False)
    is_recyclable = Column(Boolean, default=True)
    recycling_code = Column(Integer, default=4) # 1=PET, 2=HDPE, 3=PVC, 4=LDPE, 5=PP, 6=PS, 7=OTHER/BIOPOLYMER
    carbon_footprint_kg_co2_per_kg = Column(Float, default=2.1) # kg CO2 eq / kg material
    compost_timeline_days = Column(Integer, nullable=True) # Days to 90% degradation in soil/compost
    
    # Economics
    approx_cost_inr_per_kg = Column(Float, default=160.0)
    
    description = Column(Text, nullable=True)
    suitable_applications = Column(JSON, default=list)
    limitations = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class PackagingRecommendation(Base):
    __tablename__ = "packaging_recommendations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    commodity_id = Column(String(36), ForeignKey("food_commodities.id"), nullable=True)
    commodity_name = Column(String(255), nullable=False)
    
    # Input parameters snapshot
    input_parameters = Column(JSON, nullable=False)
    # e.g., { commodity_type, moisture_pct, fat_pct, ph, respiration_rate, desired_shelf_life_days, storage_temp_c, storage_rh_pct, storage_type, package_weight_g, package_surface_area_cm2, eco_priority }
    
    # Computed Physics & Barrier targets
    target_otr = Column(Float, nullable=False)
    target_wvtr = Column(Float, nullable=False)
    target_co2tr = Column(Float, nullable=True)
    
    # Primary Recommendation
    primary_material_name = Column(String(255), nullable=False)
    primary_material_code = Column(String(50), nullable=False)
    recommended_structure_type = Column(String(100), nullable=False) # MONOLAYER, MULTILAYER_LAMINATE, MICRO_PERFORATED, BIODEGRADABLE_POUCH
    recommended_total_thickness_um = Column(Float, nullable=False)
    
    # Multilayer structure details
    laminate_layers = Column(JSON, default=list) 
    # e.g., [ { layer: 1, role: "Print / Outer Protection", material: "BOPET", thickness_um: 12 }, { layer: 2, role: "Gas/Moisture Barrier", material: "Met-PET", thickness_um: 12 }, { layer: 3, role: "Sealant & Food Contact", material: "LLDPE", thickness_um: 40 } ]
    
    # MAP & Produce Specifics
    is_map_recommended = Column(Boolean, default=False)
    map_gas_o2_pct = Column(Float, nullable=True)
    map_gas_co2_pct = Column(Float, nullable=True)
    map_gas_n2_pct = Column(Float, nullable=True)
    is_micro_perforated = Column(Boolean, default=False)
    micro_perforation_spec = Column(JSON, nullable=True) # { pore_diameter_um: 70, pores_per_pack: 8, total_perforation_area_mm2: 0.03 }
    
    # Alternative Recommendations (e.g., Eco-Friendly, Ultra High-Barrier, Budget)
    alternative_options = Column(JSON, default=list)
    
    # Performance & Sustainability Metrics
    predicted_shelf_life_days = Column(Float, nullable=False)
    shelf_life_gain_multiplier = Column(Float, default=1.0) # vs unpackaged
    sustainability_score = Column(Float, default=75.0) # 0 - 100
    recyclability_grade = Column(String(20), default="RECYCLABLE_A")
    carbon_footprint_per_1000_packs_kg = Column(Float, default=1.5)
    cost_estimate_per_1000_packs_inr = Column(Float, default=450.0)
    
    # Key Technical Warnings / Notes
    technical_notes = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="recommendations")
    passports = relationship("TraceabilityPassport", back_populates="recommendation", cascade="all, delete-orphan")

class SimulationRun(Base):
    __tablename__ = "simulation_runs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    recommendation_id = Column(String(36), ForeignKey("packaging_recommendations.id"), nullable=True)
    
    # Simulation environment parameters
    test_temperature_c = Column(Float, nullable=False)
    test_relative_humidity_pct = Column(Float, nullable=False)
    duration_days = Column(Integer, nullable=False)
    
    # Dynamic time-series data
    # [ { day: 0, quality_score: 100, moisture_pct: 12.0, oxidation_index: 0.0, microbial_cfu_log: 1.0, o2_headspace_pct: 3.0, co2_headspace_pct: 7.0 }, ... ]
    timeline_data = Column(JSON, nullable=False)
    
    final_quality_score = Column(Float, nullable=False) # 0 - 100
    spoilage_day = Column(Integer, nullable=True) # Day when quality drops < 60
    limiting_factor = Column(String(100), default="Moisture Gain") # Moisture Gain, Oxidation, Respiration Spoilage, Microbial Growth
    created_at = Column(DateTime, default=datetime.utcnow)

class TraceabilityPassport(Base):
    __tablename__ = "traceability_passports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    passport_code = Column(String(64), unique=True, index=True, nullable=False) # e.g., PK-2026-X9A21
    recommendation_id = Column(String(36), ForeignKey("packaging_recommendations.id"), nullable=False)
    
    commodity_name = Column(String(255), nullable=False)
    batch_lot_number = Column(String(100), nullable=False)
    pack_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=False)
    packaging_structure = Column(String(255), nullable=False)
    
    target_storage_temp_c = Column(Float, default=4.0)
    target_storage_rh_pct = Column(Float, default=90.0)
    map_gas_flush = Column(String(100), nullable=True)
    
    qr_code_svg = Column(Text, nullable=True)
    qr_code_data_url = Column(Text, nullable=True)
    
    manufacturer_info = Column(JSON, default=dict)
    compliance_certifications = Column(JSON, default=list) # e.g. ["FSSAI", "FDA 21 CFR", "ISO 22000", "EN 13432"]
    
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    recommendation = relationship("PackagingRecommendation", back_populates="passports")
