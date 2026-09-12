import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.schemas.domain import RecommendationRequest, RecommendationResponse, LaminateLayer, MicroPerforationSpec
from app.engine.physics import PackagingPhysicsEngine
from app.engine.sustainability import SustainabilityEngine

class PackagingRecommender:
    """
    Intelligent recommendation orchestrator combining physics modeling,
    material barrier matching, laminate synthesis, MAP design, and sustainability scoring.
    """
    
    @staticmethod
    def generate_recommendation(
        request: RecommendationRequest,
        db_materials: Optional[List[Any]] = None
    ) -> RecommendationResponse:
        
        # 1. Determine sensitivity classifications
        moisture_sens = "HIGH" if request.moisture_content < 15.0 and request.category in ["Snacks & Ready-To-Eat", "Bakery & Confectionery"] else "MEDIUM"
        if request.water_activity < 0.3:
            moisture_sens = "CRITICAL"
            
        oxygen_sens = "HIGH" if request.fat_content > 15.0 else ("CRITICAL" if request.fat_content > 30.0 else "MEDIUM")
        if request.category in ["Meat & Poultry", "Dairy", "Oils & Fats"]:
            oxygen_sens = "HIGH"
            
        # 2. Physics-calculated target barrier requirements
        target_wvtr = PackagingPhysicsEngine.calculate_target_wvtr(
            moisture_pct=request.moisture_content,
            water_activity=request.water_activity,
            package_weight_g=request.package_weight_grams,
            package_surface_area_cm2=request.package_surface_area_cm2,
            desired_shelf_life_days=request.desired_shelf_life_days,
            storage_temp_c=request.storage_temperature_c,
            storage_rh_pct=request.storage_relative_humidity_pct,
            moisture_sensitivity=moisture_sens
        )
        
        target_otr = PackagingPhysicsEngine.calculate_target_otr(
            fat_pct=request.fat_content,
            package_weight_g=request.package_weight_grams,
            package_surface_area_cm2=request.package_surface_area_cm2,
            headspace_volume_cm3=request.headspace_volume_cm3,
            desired_shelf_life_days=request.desired_shelf_life_days,
            oxygen_sensitivity=oxygen_sens,
            is_respiring=request.is_respiring
        )
        
        # 3. Produce & MAP kinetics
        is_map_rec = False
        map_o2 = None
        map_co2 = None
        map_n2 = None
        micro_perf = None
        
        if request.is_respiring or request.category == "Fresh Produce":
            is_map_rec = True
            map_o2 = 4.0
            map_co2 = 6.0
            map_n2 = 90.0
            
            perf_data = PackagingPhysicsEngine.calculate_produce_map_and_perforation(
                respiration_rate_o2_20c=request.respiration_rate_o2 or 25.0,
                respiration_quotient=1.0,
                package_weight_g=request.package_weight_grams,
                package_surface_area_cm2=request.package_surface_area_cm2,
                storage_temp_c=request.storage_temperature_c,
                optimal_o2_pct=map_o2,
                optimal_co2_pct=map_co2
            )
            
            micro_perf = MicroPerforationSpec(
                is_required=perf_data["is_required"],
                pore_diameter_um=perf_data["pore_diameter_um"],
                pores_per_package=perf_data["pores_per_package"],
                perforation_density_pores_m2=perf_data["perforation_density_pores_m2"],
                total_open_area_mm2=perf_data["total_open_area_mm2"],
                gas_flux_compensation_ratio=perf_data["gas_flux_compensation_ratio"]
            )
        elif request.category in ["Snacks & Ready-To-Eat", "Bakery & Confectionery", "Meat & Poultry", "Dairy"]:
            # Nitrogen gas flush recommended for oxidation and pillow-cushioning
            is_map_rec = True
            map_o2 = 0.5
            map_co2 = 20.0 if request.category in ["Meat & Poultry", "Dairy"] else 0.0
            map_n2 = 79.5 if request.category in ["Meat & Poultry", "Dairy"] else 99.5
            
        # 4. Multilayer Laminate Synthesis
        laminate_synthesis = PackagingPhysicsEngine.synthesize_multilayer_laminate(
            target_otr=target_otr,
            target_wvtr=target_wvtr,
            food_category=request.category,
            transportation_stress=request.transportation_stress,
            eco_priority=request.eco_priority
        )
        
        layers = [
            LaminateLayer(
                layer_number=l["layer_number"],
                role=l["role"],
                material_name=l["material_name"],
                material_code=l["material_code"],
                thickness_um=l["thickness_um"],
                barrier_contribution=l["barrier_contribution"]
            ) for l in laminate_synthesis["layers"]
        ]
        
        # 5. Sustainability & Cost metrics
        is_bio = request.eco_priority == "MAX_SUSTAINABILITY" or "BIO" in laminate_synthesis["primary_code"]
        eco_metrics = SustainabilityEngine.calculate_metrics(
            primary_material_code=laminate_synthesis["primary_code"],
            total_thickness_um=laminate_synthesis["total_thickness_um"],
            surface_area_cm2=request.package_surface_area_cm2,
            is_biodegradable=is_bio,
            is_recyclable=not is_bio,
            recycling_code=7 if is_bio else 4,
            base_carbon_factor_kg_co2_kg=1.4 if is_bio else (3.2 if "ALU" in laminate_synthesis["primary_code"] else 2.1),
            base_cost_per_kg_inr=240.0 if is_bio else (310.0 if "ALU" in laminate_synthesis["primary_code"] else 170.0)
        )
        
        # 6. Predicted shelf-life & multiplier
        baseline_days = 3.0 if request.category == "Fresh Produce" else (14.0 if request.category in ["Bakery & Confectionery", "Dairy"] else 30.0)
        predicted_shelf_life = request.desired_shelf_life_days * 1.15 # 15% safety buffer
        gain_multiplier = round(predicted_shelf_life / baseline_days, 1)
        
        # 7. Alternative Recommendations (3 distinct options for industry decision support)
        alternatives = [
            {
                "tier_name": "Eco-Compostable Alternative",
                "structure_name": "BOPLA 20µm / Cellulose 15µm / PBAT 40µm",
                "code": "BIO-ECO-75",
                "thickness_um": 75.0,
                "sustainability_score": 96.0,
                "carbon_footprint_1000_kg": round(eco_metrics["carbon_footprint_per_1000_packs_kg"] * 0.65, 2),
                "cost_1000_inr": round(eco_metrics["cost_estimate_per_1000_packs_inr"] * 1.35, 2),
                "badge": "100% Biodegradable & Compostable",
                "highlight": "Meets ASTM D6400 / EN 13432 compostability standards, 0% microplastics."
            },
            {
                "tier_name": "Mono-Material High Recyclability",
                "structure_name": "BOPE 25µm / Barrier-PE 15µm / MDO-PE 35µm",
                "code": "MONO-PE-75",
                "thickness_um": 75.0,
                "sustainability_score": 88.0,
                "carbon_footprint_1000_kg": round(eco_metrics["carbon_footprint_per_1000_packs_kg"] * 0.85, 2),
                "cost_1000_inr": round(eco_metrics["cost_estimate_per_1000_packs_inr"] * 0.92, 2),
                "badge": "Circular Economy Ready (RIC #4 PE)",
                "highlight": "Single-polymer all-PE pouch with 100% curbside recyclability."
            },
            {
                "tier_name": "Ultra-Extended Shelf Life (Export Grade)",
                "structure_name": "PET 12µm / AluFoil 9µm / mLLDPE 50µm",
                "code": "ALU-EXPORT-71",
                "thickness_um": 71.0,
                "sustainability_score": 58.0,
                "carbon_footprint_1000_kg": round(eco_metrics["carbon_footprint_per_1000_packs_kg"] * 1.45, 2),
                "cost_1000_inr": round(eco_metrics["cost_estimate_per_1000_packs_inr"] * 1.25, 2),
                "badge": "Hermetic Zero-Permeability",
                "highlight": "Maximum protection for long-distance maritime export and tropical humidity."
            }
        ]
        
        # 8. Technical Notes & Guidelines
        tech_notes = [
            f"Calculated critical barrier boundary: Target OTR ≤ {target_otr} cc/m²·day·atm, WVTR ≤ {target_wvtr} g/m²·day.",
            f"Seal integrity: Minimum heat seal strength required is ≥ 20 N/15mm to resist transportation vibration ({request.transportation_stress} stress).",
            "Food safety compliance: Polymers must comply with FSSAI / FDA 21 CFR 177.1520 overall migration limits (< 60 mg/kg food simulant)."
        ]
        if is_map_rec and map_n2:
            tech_notes.append(f"MAP recommendation: Gas flushing with {map_n2}% N2 / {map_co2 or 0}% CO2 / {map_o2 or 0}% O2 to retard rancidity and microbial growth.")
        if micro_perf and micro_perf.is_required:
            tech_notes.append(f"Fresh produce respiration control: {micro_perf.pores_per_package} laser micro-pores ({micro_perf.pore_diameter_um} µm) engineered to prevent anaerobic fermentation.")
            
        tech_notes.extend(laminate_synthesis["notes"])
        
        return RecommendationResponse(
            id=str(uuid.uuid4()),
            commodity_name=request.commodity_name,
            target_otr=target_otr,
            target_wvtr=target_wvtr,
            target_co2tr=round(target_otr * 3.5, 2) if target_otr else None,
            primary_material_name=laminate_synthesis["primary_name"],
            primary_material_code=laminate_synthesis["primary_code"],
            recommended_structure_type=laminate_synthesis["structure_type"],
            recommended_total_thickness_um=laminate_synthesis["total_thickness_um"],
            laminate_layers=layers,
            is_map_recommended=is_map_rec,
            map_gas_o2_pct=map_o2,
            map_gas_co2_pct=map_co2,
            map_gas_n2_pct=map_n2,
            micro_perforation_spec=micro_perf,
            alternative_options=alternatives,
            predicted_shelf_life_days=predicted_shelf_life,
            shelf_life_gain_multiplier=gain_multiplier,
            sustainability_score=eco_metrics["sustainability_score"],
            recyclability_grade=eco_metrics["recyclability_grade"],
            carbon_footprint_per_1000_packs_kg=eco_metrics["carbon_footprint_per_1000_packs_kg"],
            cost_estimate_per_1000_packs_inr=eco_metrics["cost_estimate_per_1000_packs_inr"],
            technical_notes=tech_notes,
            created_at=datetime.utcnow()
        )
