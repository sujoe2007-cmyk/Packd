import math
from typing import Dict, Any, List, Tuple, Optional

class PackagingPhysicsEngine:
    """
    Physics-informed food packaging, barrier, MAP, and shelf-life calculation engine.
    Implements validated food science formulations, Arrhenius kinetics, gas diffusion,
    and multilayer permeation synthesis.
    """

    @staticmethod
    def calculate_saturated_vapor_pressure_kpa(temp_c: float) -> float:
        """Tetens equation for saturation water vapor pressure in kPa."""
        return 0.61078 * math.exp((17.27 * temp_c) / (temp_c + 237.3))

    @staticmethod
    def calculate_target_wvtr(
        moisture_pct: float,
        water_activity: float,
        package_weight_g: float,
        package_surface_area_cm2: float,
        desired_shelf_life_days: float,
        storage_temp_c: float,
        storage_rh_pct: float,
        moisture_sensitivity: str = "MEDIUM"
    ) -> float:
        """
        Calculates maximum permissible Water Vapor Transmission Rate (WVTR in g / m² · day)
        normalized to standard test conditions (38°C, 90% RH).
        """
        # Critical moisture change threshold before quality loss (%)
        sensitivity_map = {
            "CRITICAL": 1.0,  # Crisps, wafers, hygroscopic powders
            "HIGH": 2.5,      # Biscuits, dried fruits, roasted nuts
            "MEDIUM": 5.0,    # Grains, pulses, baked goods
            "LOW": 10.0       # Fresh produce, high moisture foods
        }
        allowable_delta_m_pct = sensitivity_map.get(moisture_sensitivity.upper(), 4.0)
        
        # Max allowable water mass gain or loss (grams)
        delta_water_g = (allowable_delta_m_pct / 100.0) * package_weight_g
        surface_area_m2 = package_surface_area_cm2 / 10000.0
        
        # Driving force under target storage conditions (vapor pressure difference in kPa)
        p_sat_storage = PackagingPhysicsEngine.calculate_saturated_vapor_pressure_kpa(storage_temp_c)
        rh_ext_fraction = storage_rh_pct / 100.0
        dp_storage = max(0.01, abs(p_sat_storage * (rh_ext_fraction - water_activity)))
        
        # WVTR required at actual storage conditions
        wvtr_storage = delta_water_g / max(0.1, (surface_area_m2 * desired_shelf_life_days))
        
        # Normalize to ASTM E96 standard (38°C, 90% RH vs 0% internal -> dp_std ≈ 5.96 kPa)
        p_sat_38c = PackagingPhysicsEngine.calculate_saturated_vapor_pressure_kpa(38.0) # ≈ 6.63 kPa
        dp_standard = p_sat_38c * 0.90 # ≈ 5.96 kPa
        
        # Temperature correction via Arrhenius activation energy for water vapor permeation (Ea ~ 35 kJ/mol)
        r_const = 8.314 # J/(mol·K)
        ea_w = 35000.0 # J/mol
        temp_k_storage = storage_temp_c + 273.15
        temp_k_std = 38.0 + 273.15
        temp_factor = math.exp((ea_w / r_const) * ((1.0 / temp_k_storage) - (1.0 / temp_k_std)))
        
        # Standard normalized WVTR target (g / m² · day)
        std_wvtr = wvtr_storage * (dp_standard / dp_storage) * temp_factor
        return max(0.05, round(std_wvtr, 2))

    @staticmethod
    def calculate_target_otr(
        fat_pct: float,
        package_weight_g: float,
        package_surface_area_cm2: float,
        headspace_volume_cm3: float,
        desired_shelf_life_days: float,
        oxygen_sensitivity: str = "MEDIUM",
        is_respiring: bool = False
    ) -> float:
        """
        Calculates maximum permissible Oxygen Transmission Rate (OTR in cc / m² · day · atm)
        at 23°C, 0% RH.
        """
        if is_respiring:
            # Respiring produce requires oxygen permeability to prevent anaerobic fermentation!
            # Returns target film OTR before perforation
            return 3000.0

        # Permissible oxygen consumption (cc O2 / g fat or g product)
        sensitivity_levels = {
            "CRITICAL": 0.05,  # Infant formula, active oils, roasted coffee
            "HIGH": 0.20,      # Potato chips, nuts, cured meats
            "MEDIUM": 0.80,    # Bakery, cheese, pulses
            "LOW": 2.50        # Low-fat dry cereals, sugar, confectionery
        }
        max_o2_uptake_cc_per_g = sensitivity_levels.get(oxygen_sensitivity.upper(), 0.50)
        
        # Scale with fat content if fat > 5%
        if fat_pct > 5.0:
            total_allowable_o2_cc = (fat_pct / 100.0) * package_weight_g * max_o2_uptake_cc_per_g
        else:
            total_allowable_o2_cc = package_weight_g * (max_o2_uptake_cc_per_g * 0.2)
            
        surface_area_m2 = package_surface_area_cm2 / 10000.0
        delta_p_o2_atm = 0.209 # Atmospheric O2 partial pressure
        
        target_otr = total_allowable_o2_cc / max(0.1, (surface_area_m2 * desired_shelf_life_days * delta_p_o2_atm))
        return max(0.1, round(target_otr, 2))

    @staticmethod
    def calculate_produce_map_and_perforation(
        respiration_rate_o2_20c: float, # mg O2 / kg·h
        respiration_quotient: float,   # RQ = VCO2 / VO2
        package_weight_g: float,
        package_surface_area_cm2: float,
        storage_temp_c: float,
        optimal_o2_pct: float = 3.5,
        optimal_co2_pct: float = 6.0,
        film_base_otr: float = 1500.0 # cc / m²·day·atm
    ) -> Dict[str, Any]:
        """
        Computes respiration rate at target temperature (Q10 rule),
        equilibrium gas flux, and micro-perforation specifications (pore count & diameter).
        """
        # Temperature adjustment of respiration rate via Q10 model
        q10 = 2.2 # standard for fresh horticultural produce
        temp_diff = storage_temp_c - 20.0
        ro2_temp = respiration_rate_o2_20c * math.pow(q10, temp_diff / 10.0)
        ro2_temp = max(1.0, ro2_temp)
        
        # Convert mg O2 / kg·h to cc O2 / kg·day (1 mol O2 = 32000 mg = 24000 cc at STP)
        # Factor: 24.0 h/day * (24000 cc / 32000 mg) = 18.0 cc·day / (mg·h)
        ro2_cc_per_kg_day = ro2_temp * 18.0
        weight_kg = package_weight_g / 1000.0
        total_produce_o2_demand_cc_per_day = ro2_cc_per_kg_day * weight_kg
        
        surface_area_m2 = package_surface_area_cm2 / 10000.0
        
        # O2 supplied by baseline film without holes (cc / day)
        # driving force = (0.209 - optimal_o2/100) atm
        driving_force_o2 = max(0.02, 0.209 - (optimal_o2_pct / 100.0))
        film_o2_supply = film_base_otr * surface_area_m2 * driving_force_o2
        
        o2_deficit_cc_per_day = total_produce_o2_demand_cc_per_day - film_o2_supply
        
        if o2_deficit_cc_per_day <= 0:
            # Baseline high-permeability film is sufficient without perforations
            return {
                "is_required": False,
                "pore_diameter_um": 0.0,
                "pores_per_package": 0,
                "perforation_density_pores_m2": 0.0,
                "total_open_area_mm2": 0.0,
                "gas_flux_compensation_ratio": 1.0,
                "ro2_at_storage_temp_mg_kg_h": round(ro2_temp, 2),
                "map_flush_recommended": f"Target Equilibrium: {optimal_o2_pct}% O2, {optimal_co2_pct}% CO2, Balance N2"
            }
        
        # Standard laser micro-perforation diameter (60 - 80 um typical)
        pore_diameter_um = 70.0
        pore_radius_m = (pore_diameter_um / 2.0) * 1e-6
        pore_area_m2 = math.pi * (pore_radius_m ** 2)
        
        # Gas flux through micro-pore (Fick's diffusion + Stefan-Maxwell correction)
        # Diffusion coefficient of O2 in air D ≈ 0.20 cm²/s = 1728 m²/day
        # Effective pore length ~ film thickness (30 um) + end correction (1.6 * radius)
        l_eff_m = (30e-6) + (1.6 * pore_radius_m)
        d_o2_air = 0.20e-4 * 86400.0 # m²/day
        
        # Flux per pore (cc O2 / day)
        o2_conc_diff_fraction = driving_force_o2
        flux_per_pore_cc_day = (d_o2_air * pore_area_m2 / l_eff_m) * o2_conc_diff_fraction * 1e6
        flux_per_pore_cc_day = max(0.5, flux_per_pore_cc_day)
        
        pores_needed = math.ceil(o2_deficit_cc_per_day / flux_per_pore_cc_day)
        pores_needed = max(2, min(48, pores_needed)) # Practical packaging limits
        
        total_open_area_mm2 = pores_needed * (math.pi * ((pore_diameter_um / 2.0 / 1000.0) ** 2))
        density_pores_m2 = pores_needed / surface_area_m2
        
        return {
            "is_required": True,
            "pore_diameter_um": pore_diameter_um,
            "pores_per_package": pores_needed,
            "perforation_density_pores_m2": round(density_pores_m2, 1),
            "total_open_area_mm2": round(total_open_area_mm2, 4),
            "gas_flux_compensation_ratio": round(o2_deficit_cc_per_day / total_produce_o2_demand_cc_per_day, 2),
            "ro2_at_storage_temp_mg_kg_h": round(ro2_temp, 2),
            "map_flush_recommended": f"Target Equilibrium: {optimal_o2_pct}% O2, {optimal_co2_pct}% CO2, Balance N2"
        }

    @staticmethod
    def synthesize_multilayer_laminate(
        target_otr: float,
        target_wvtr: float,
        food_category: str,
        transportation_stress: str = "MEDIUM",
        eco_priority: str = "BALANCED"
    ) -> Dict[str, Any]:
        """
        Synthesizes an optimal multilayer laminate structure engineered for barrier,
        puncture resistance, seal integrity, and eco-profile.
        """
        layers = []
        notes = []
        structure_type = "MULTILAYER_LAMINATE"
        
        is_high_moisture_barrier = target_wvtr < 2.0
        is_ultra_high_gas_barrier = target_otr < 2.0
        is_compostable_req = eco_priority == "MAX_SUSTAINABILITY"
        
        if is_compostable_req:
            structure_type = "COMPOSTABLE_BIO_LAMINATE"
            layers = [
                {
                    "layer_number": 1,
                    "role": "Outer Printable / Bio-Barrier",
                    "material_name": "Bio-Oriented PLA (BOPLA)",
                    "material_code": "PLA-BIO-01",
                    "thickness_um": 20.0,
                    "barrier_contribution": "High clarity, mechanical protection, printable outer face"
                },
                {
                    "layer_number": 2,
                    "role": "High-Barrier Bio-Layer",
                    "material_name": "Cellulose Nanocrystal / Metallized PLA",
                    "material_code": "MET-PLA-01",
                    "thickness_um": 15.0,
                    "barrier_contribution": "Substantially blocks O2 permeation (<5 cc/m²·day)"
                },
                {
                    "layer_number": 3,
                    "role": "Inner Sealant & Toughness",
                    "material_name": "PBAT / Starch Bio-Polymer Blend",
                    "material_code": "PBAT-TPS-01",
                    "thickness_um": 45.0,
                    "barrier_contribution": "Hermetic heat-seal at 105°C, high puncture resistance, 100% compostable"
                }
            ]
            notes.append("100% Industrially & Home Compostable under ASTM D6400 / EN 13432 certification.")
            notes.append("Shelf life optimized for 6-9 months without micro-plastic persistence.")
            primary_name = "BOPLA 20µm / Met-PLA 15µm / PBAT-TPS 45µm"
            primary_code = "BIO-TRIPLE-80"
            total_thickness = 80.0

        elif is_ultra_high_gas_barrier or is_high_moisture_barrier:
            if target_otr < 0.5:
                # Aluminum Foil Laminate (True zero-barrier / hermetic packaging)
                structure_type = "ALUMINUM_FOIL_TRIPLEX"
                layers = [
                    {
                        "layer_number": 1,
                        "role": "Outer Print & Abrasion Layer",
                        "material_name": "Biaxially Oriented PET (BOPET)",
                        "material_code": "BOPET-12",
                        "thickness_um": 12.0,
                        "barrier_contribution": "Dimensional stability, heat resistance during sealing, high gloss"
                    },
                    {
                        "layer_number": 2,
                        "role": "Absolute Gas & Moisture Barrier",
                        "material_name": "Pure Aluminum Foil (AluFoil)",
                        "material_code": "ALU-FOIL-09",
                        "thickness_um": 9.0,
                        "barrier_contribution": "Zero light transmission, OTR < 0.05 cc, WVTR < 0.05 g/m²·day"
                    },
                    {
                        "layer_number": 3,
                        "role": "Inner Sealant & Food Contact",
                        "material_name": "Metallocene Linear Low-Density PE (mLLDPE)",
                        "material_code": "mLLDPE-50",
                        "thickness_um": 50.0,
                        "barrier_contribution": "High hot-tack strength, contamination sealing, tear resistance"
                    }
                ]
                primary_name = "PET 12µm / AluFoil 9µm / mLLDPE 50µm Triplex"
                primary_code = "PET-ALU-PE-71"
                total_thickness = 71.0
                notes.append("Provides near-absolute barrier against oxygen, moisture, and light.")
                notes.append("Recommended for high-oil snacks, ground coffee, milk powder, or shelf-stable MREs.")
            else:
                # Metallized Barrier Laminate
                structure_type = "METALLIZED_BARRIER_DUPLEX_TRIPLEX"
                layers = [
                    {
                        "layer_number": 1,
                        "role": "Outer Reverse Print Layer",
                        "material_name": "Biaxially Oriented Polypropylene (BOPP)",
                        "material_code": "BOPP-20",
                        "thickness_um": 20.0,
                        "barrier_contribution": "Good moisture barrier, crisp optics, reverse rotogravure printing"
                    },
                    {
                        "layer_number": 2,
                        "role": "Metallized Barrier & Core",
                        "material_name": "Metallized BOPP (Met-BOPP)",
                        "material_code": "MET-BOPP-15",
                        "thickness_um": 15.0,
                        "barrier_contribution": "Vacuum-deposited Aluminum layer provides OTR < 15 cc, WVTR < 0.8 g"
                    },
                    {
                        "layer_number": 3,
                        "role": "Inner Sealant",
                        "material_name": "Cast Polypropylene (CPP) or LLDPE",
                        "material_code": "LLDPE-35",
                        "thickness_um": 35.0,
                        "barrier_contribution": "Hermetic seal integrity, puncture protection"
                    }
                ]
                primary_name = "BOPP 20µm / Met-BOPP 15µm / LLDPE 35µm"
                primary_code = "BOPP-MET-PE-70"
                total_thickness = 70.0
                notes.append("Gold standard packaging for potato chips, extruded snacks, and biscuits.")
        elif food_category in ["Fresh Produce"]:
            structure_type = "BREATHABLE_ANTI_FOG_FILM"
            layers = [
                {
                    "layer_number": 1,
                    "role": "Active Respiration Film",
                    "material_name": "Anti-Fog Oriented Polypropylene (BOPP-AF) / LDPE",
                    "material_code": "BOPP-AF-30",
                    "thickness_um": 30.0,
                    "barrier_contribution": "Prevents condensation water droplet formation, engineered gas permeability"
                }
            ]
            primary_name = "Anti-Fog BOPP 30µm (Laser Micro-Perforated)"
            primary_code = "BOPP-AF-PERF-30"
            total_thickness = 30.0
            notes.append("Incorporates food-grade anti-fog surfactant to maintain optical clarity and prevent mold growth.")
        else:
            # Standard High-Yield Duplex (Bakery, Cereals, Dry Legumes)
            structure_type = "DUPLEX_LAMINATE"
            layers = [
                {
                    "layer_number": 1,
                    "role": "Outer Face",
                    "material_name": "BOPP / PET",
                    "material_code": "BOPP-20",
                    "thickness_um": 20.0,
                    "barrier_contribution": "Abrasion protection, moisture barrier"
                },
                {
                    "layer_number": 2,
                    "role": "Inner Food Contact & Sealant",
                    "material_name": "Food Grade LLDPE",
                    "material_code": "LLDPE-40",
                    "thickness_um": 40.0,
                    "barrier_contribution": "Heat sealing, low migration"
                }
            ]
            primary_name = "BOPP 20µm / LLDPE 40µm Duplex"
            primary_code = "BOPP-PE-60"
            total_thickness = 60.0
            notes.append("Cost-effective, highly recyclable (Polyolefin mono-material compatible stream).")

        return {
            "primary_name": primary_name,
            "primary_code": primary_code,
            "structure_type": structure_type,
            "total_thickness_um": total_thickness,
            "layers": layers,
            "notes": notes
        }

    @staticmethod
    def simulate_degradation_kinetics(
        commodity_name: str,
        initial_moisture_pct: float,
        fat_pct: float,
        is_respiring: bool,
        duration_days: int,
        storage_temp_c: float,
        storage_rh_pct: float,
        film_otr: float,
        film_wvtr: float,
        is_map_active: bool = False
    ) -> Dict[str, Any]:
        """
        Simulates dynamic daily deterioration curves for quality, moisture gain/loss,
        lipid oxidation, and microbial/respiratory deterioration over time.
        """
        timeline = []
        spoilage_day = None
        limiting_factor = "Quality Depletion"
        
        # Arrhenius temperature acceleration factor (Q10 = 2.0 baseline)
        temp_factor = math.pow(2.0, (storage_temp_c - 20.0) / 10.0)
        rh_factor = (storage_rh_pct / 65.0)
        
        current_moisture = initial_moisture_pct
        current_oxidation = 0.0
        current_cfu_log = 1.2
        headspace_o2 = 3.0 if is_map_active else 20.9
        headspace_co2 = 6.0 if is_map_active else 0.04
        
        # Step increment per day
        moisture_rate = (film_wvtr / 20.0) * (rh_factor - 0.5) * 0.05
        oxidation_rate = (film_otr / 150.0) * (fat_pct / 10.0) * temp_factor * 0.08
        microbial_growth_rate = 0.05 * temp_factor * (current_moisture / 20.0)
        
        for day in range(0, duration_days + 1):
            if day > 0:
                # Update moisture
                current_moisture += moisture_rate
                current_moisture = max(0.5, min(98.0, current_moisture))
                
                # Update oxidation
                current_oxidation += oxidation_rate * (headspace_o2 / 20.9)
                current_oxidation = min(100.0, current_oxidation)
                
                # Update microbial load
                current_cfu_log += microbial_growth_rate
                current_cfu_log = min(9.5, current_cfu_log)
                
                # Respiration headspace drift if produce
                if is_respiring:
                    headspace_o2 = max(1.5, headspace_o2 - (0.02 * temp_factor))
                    headspace_co2 = min(12.0, headspace_co2 + (0.03 * temp_factor))
            
            # Composite quality score (100 = Factory Fresh, <60 = Spoilage Threshold)
            moisture_penalty = abs(current_moisture - initial_moisture_pct) * 6.0
            oxidation_penalty = current_oxidation * 0.8
            microbial_penalty = max(0.0, (current_cfu_log - 4.5) * 18.0)
            
            quality = 100.0 - (moisture_penalty + oxidation_penalty + microbial_penalty)
            quality = max(5.0, min(100.0, round(quality, 1)))
            
            if quality >= 85:
                status = "FRESH"
            elif quality >= 70:
                status = "ACCEPTABLE"
            elif quality >= 50:
                status = "SUB-OPTIMAL"
            else:
                status = "SPOILED"
                
            if quality < 50 and spoilage_day is None:
                spoilage_day = day
                if microbial_penalty > oxidation_penalty and microbial_penalty > moisture_penalty:
                    limiting_factor = "Microbial Activity"
                elif oxidation_penalty > moisture_penalty:
                    limiting_factor = "Lipid Oxidation & Rancidity"
                else:
                    limiting_factor = "Moisture Absorption / Texture Loss"
            
            timeline.append({
                "day": day,
                "quality_score": quality,
                "moisture_content_pct": round(current_moisture, 2),
                "lipid_oxidation_index": round(current_oxidation, 2),
                "microbial_cfu_log": round(current_cfu_log, 2),
                "headspace_o2_pct": round(headspace_o2, 1),
                "headspace_co2_pct": round(headspace_co2, 1),
                "status": status
            })
            
        summary = (
            f"Product maintains acceptable commercial shelf-life for {spoilage_day or duration_days} days. "
            f"Primary limiting factor identified as '{limiting_factor}' under {storage_temp_c}°C / {storage_rh_pct}% RH."
        )
        
        return {
            "test_temperature_c": storage_temp_c,
            "test_relative_humidity_pct": storage_rh_pct,
            "duration_days": duration_days,
            "timeline_data": timeline,
            "spoilage_day": spoilage_day,
            "final_quality_score": timeline[-1]["quality_score"],
            "limiting_factor": limiting_factor,
            "summary_insight": summary
        }
