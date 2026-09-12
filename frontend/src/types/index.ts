export interface FoodCommodity {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  moisture_content: number;
  fat_content: number;
  ph: number;
  water_activity: number;
  is_respiring: boolean;
  respiration_rate_o2: number;
  respiration_rate_co2: number;
  respiration_quotient: number;
  respiration_class: string;
  oxygen_sensitivity: string;
  moisture_sensitivity: string;
  light_sensitivity: string;
  ethylene_sensitivity: string;
  optimal_temp_min: number;
  optimal_temp_max: number;
  optimal_rh_min: number;
  optimal_rh_max: number;
  baseline_shelf_life_ambient_days: number;
  baseline_shelf_life_refrigerated_days: number;
  optimal_map_o2_pct?: number;
  optimal_map_co2_pct?: number;
  optimal_map_n2_pct?: number;
  description?: string;
  degradation_mechanisms: string[];
}

export interface PackagingMaterial {
  id: string;
  name: string;
  code: string;
  category: string;
  base_polymer: string;
  typical_thickness_um: number;
  density_g_cm3: number;
  otr_at_23c: number;
  wvtr_at_38c: number;
  co2tr_at_23c?: number;
  tensile_strength_mpa: number;
  puncture_resistance_n: number;
  seal_initiation_temp_c: number;
  transparency_pct: number;
  is_biodegradable: boolean;
  is_home_compostable: boolean;
  is_industrial_compostable: boolean;
  is_recyclable: boolean;
  recycling_code: number;
  carbon_footprint_kg_co2_per_kg: number;
  compost_timeline_days?: number;
  approx_cost_inr_per_kg: number;
  description?: string;
  suitable_applications: string[];
  limitations: string[];
}

export interface LaminateLayer {
  layer_number: number;
  role: string;
  material_name: string;
  material_code: string;
  thickness_um: number;
  barrier_contribution: string;
}

export interface MicroPerforationSpec {
  is_required: boolean;
  pore_diameter_um: number;
  pores_per_package: number;
  perforation_density_pores_m2: number;
  total_open_area_mm2: number;
  gas_flux_compensation_ratio: number;
}

export interface AlternativeOption {
  tier_name: string;
  structure_name: string;
  code: string;
  thickness_um: number;
  sustainability_score: number;
  carbon_footprint_1000_kg: number;
  cost_1000_inr: number;
  badge: string;
  highlight: string;
}

export interface RecommendationResult {
  id: string;
  commodity_name: string;
  target_otr: number;
  target_wvtr: number;
  target_co2tr?: number;
  primary_material_name: string;
  primary_material_code: string;
  recommended_structure_type: string;
  recommended_total_thickness_um: number;
  laminate_layers: LaminateLayer[];
  is_map_recommended: boolean;
  map_gas_o2_pct?: number;
  map_gas_co2_pct?: number;
  map_gas_n2_pct?: number;
  micro_perforation_spec?: MicroPerforationSpec;
  alternative_options: AlternativeOption[];
  predicted_shelf_life_days: number;
  shelf_life_gain_multiplier: number;
  sustainability_score: number;
  recyclability_grade: string;
  carbon_footprint_per_1000_packs_kg: number;
  cost_estimate_per_1000_packs_inr: number;
  technical_notes: string[];
  created_at: string;
}

export interface SimulationTimelinePoint {
  day: number;
  quality_score: number;
  moisture_content_pct: number;
  lipid_oxidation_index: number;
  microbial_cfu_log: number;
  headspace_o2_pct: number;
  headspace_co2_pct: number;
  status: 'FRESH' | 'ACCEPTABLE' | 'SUB-OPTIMAL' | 'SPOILED';
}

export interface SimulationResult {
  test_temperature_c: number;
  test_relative_humidity_pct: number;
  duration_days: number;
  timeline_data: SimulationTimelinePoint[];
  spoilage_day?: number;
  final_quality_score: number;
  limiting_factor: string;
  summary_insight: string;
}

export interface TraceabilityPassport {
  id: string;
  passport_code: string;
  commodity_name: string;
  batch_lot_number: string;
  pack_date: string;
  expiry_date: string;
  packaging_structure: string;
  target_storage_temp_c: number;
  target_storage_rh_pct: number;
  map_gas_flush?: string;
  qr_code_data_url: string;
  manufacturer_info: {
    name: string;
    facility: string;
    system: string;
  };
  compliance_certifications: string[];
  is_verified: boolean;
  created_at: string;
}
