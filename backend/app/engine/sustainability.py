from typing import Dict, Any, List

class SustainabilityEngine:
    """
    Life Cycle Assessment (LCA), Plastic Waste Management (PWM) compliance,
    carbon footprint, and cost-benefit estimation engine.
    """
    
    @staticmethod
    def calculate_metrics(
        primary_material_code: str,
        total_thickness_um: float,
        surface_area_cm2: float,
        is_biodegradable: bool,
        is_recyclable: bool,
        recycling_code: int,
        base_carbon_factor_kg_co2_kg: float = 2.1,
        base_cost_per_kg_inr: float = 160.0
    ) -> Dict[str, Any]:
        """
        Calculates carbon footprint per 1,000 packs, recyclability score (0-100),
        PWM categorization, and material cost estimate in INR.
        """
        # Package area in m²
        area_m2_per_pack = surface_area_cm2 / 10000.0
        
        # Approximate density ~ 0.95 g/cm³ = 950 kg/m³
        density_kg_m3 = 950.0
        thickness_m = total_thickness_um * 1e-6
        weight_kg_per_pack = area_m2_per_pack * thickness_m * density_kg_m3
        weight_kg_per_1000_packs = weight_kg_per_pack * 1000.0
        
        # Carbon footprint for 1000 packages (kg CO2 eq)
        carbon_footprint_1000 = weight_kg_per_1000_packs * base_carbon_factor_kg_co2_kg
        
        # Material cost for 1000 packages (INR)
        cost_inr_1000 = weight_kg_per_1000_packs * base_cost_per_kg_inr
        
        # Sustainability Scoring (0 - 100)
        score = 50.0
        if is_biodegradable:
            score += 35.0
            grade = "A+ (CIRCULAR BIO)"
            pwm_category = "Category IV: Compostable / Bio-plastics"
        elif is_recyclable and recycling_code in [1, 2, 4, 5]:
            score += 25.0
            grade = "A (MONO-POLYOLEFIN RECYCLABLE)"
            pwm_category = "Category I: Rigid / Mono-layer Flexible Recyclable"
        elif "ALU" in primary_material_code or "MET" in primary_material_code:
            score += 5.0
            grade = "B (MULTI-MATERIAL BARRIER)"
            pwm_category = "Category III: Multi-layered Plastic (MLP)"
        else:
            score += 10.0
            grade = "B- (STANDARD RECYCLABLE)"
            pwm_category = "Category II: Flexible Plastic Packaging"
            
        if total_thickness_um <= 40.0:
            score += 10.0 # Source reduction bonus
        elif total_thickness_um > 80.0:
            score -= 5.0
            
        score = max(10.0, min(98.0, round(score, 1)))
        
        return {
            "sustainability_score": score,
            "recyclability_grade": grade,
            "pwm_category": pwm_category,
            "carbon_footprint_per_1000_packs_kg": round(carbon_footprint_1000, 2),
            "cost_estimate_per_1000_packs_inr": round(cost_inr_1000, 2),
            "weight_per_pack_grams": round(weight_kg_per_pack * 1000.0, 2)
        }
