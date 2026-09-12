from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import math

router = APIRouter(prefix="/logistics", tags=["Supply Chain Logistics & IoT Cold Chain"])

class IoTLogPoint(BaseModel):
    timestamp_hour: int
    temperature_c: float
    relative_humidity_pct: float
    vibration_g: float

class IoTAnalysisRequest(BaseModel):
    commodity_name: str
    baseline_shelf_life_days: float
    ideal_storage_temp_c: float
    actual_logs: List[IoTLogPoint]

class RouteStressRequest(BaseModel):
    origin: str
    destination: str
    transport_mode: str # "HIGHWAY_TRUCK", "REEFER_CONTAINER", "MARITIME_CARGO", "AIR_FREIGHT"
    distance_km: float
    transit_days: float
    ambient_avg_temp_c: float
    ambient_avg_rh_pct: float

@router.post("/iot-sync")
def analyze_iot_cold_chain(req: IoTAnalysisRequest):
    """
    Ingests live time-series temperature/humidity logs from reefer trucks/cold rooms.
    Computes accumulated Arrhenius thermal abuse and updates dynamic remaining shelf-life.
    """
    total_abuse_hours = 0.0
    accumulated_thermal_stress = 0.0
    max_temp = -999.0
    min_temp = 999.0
    
    # Baseline decay rate per hour at ideal temp = 1.0
    # Arrhenius Q10 = 2.2
    q10 = 2.2
    
    equivalent_ideal_hours_consumed = 0.0
    
    for point in req.actual_logs:
        max_temp = max(max_temp, point.temperature_c)
        min_temp = min(min_temp, point.temperature_c)
        
        delta_t = point.temperature_c - req.ideal_storage_temp_c
        if delta_t > 2.0:
            total_abuse_hours += 1.0
            
        acceleration_factor = math.pow(q10, delta_t / 10.0)
        accumulated_thermal_stress += max(0.0, delta_t)
        equivalent_ideal_hours_consumed += 1.0 * acceleration_factor
        
    hours_logged = len(req.actual_logs) or 1
    baseline_total_hours = req.baseline_shelf_life_days * 24.0
    
    remaining_hours = max(0.0, baseline_total_hours - equivalent_ideal_hours_consumed)
    remaining_days = round(remaining_hours / 24.0, 1)
    
    quality_loss_penalty_pct = min(85.0, (equivalent_ideal_hours_consumed - hours_logged) / baseline_total_hours * 100.0)
    current_health_score = max(10.0, round(100.0 - quality_loss_penalty_pct, 1))
    
    status = "OPTIMAL_COLD_CHAIN"
    if max_temp > req.ideal_storage_temp_c + 8.0:
        status = "CRITICAL_TEMPERATURE_ABUSE"
    elif max_temp > req.ideal_storage_temp_c + 3.0:
        status = "MODERATE_THERMAL_DRIFT"

    return {
        "status": status,
        "hours_logged": hours_logged,
        "total_abuse_hours": total_abuse_hours,
        "max_temperature_observed_c": max_temp,
        "min_temperature_observed_c": min_temp,
        "original_shelf_life_days": req.baseline_shelf_life_days,
        "adjusted_remaining_shelf_life_days": remaining_days,
        "current_health_score": current_health_score,
        "quality_loss_from_abuse_pct": round(max(0.0, quality_loss_penalty_pct), 1),
        "recommendation": (
            "Cold chain maintained within safe parameters."
            if status == "OPTIMAL_COLD_CHAIN"
            else f"Significant temperature breach observed ({max_temp}°C). Accelerated spoilage detected; prioritize immediate retail distribution."
        )
    }

@router.post("/route-stress")
def calculate_route_packaging_stress(req: RouteStressRequest):
    """
    Evaluates maritime and highway supply chain transit conditions and recommends
    specialized packaging protective upgrades (e.g. Desiccant, O2 scavengers, increased seal gauge).
    """
    vibration_index = "LOW"
    desiccant_required = False
    o2_scavenger_recommended = False
    recommended_film_upgrade = []

    if req.transport_mode == "HIGHWAY_TRUCK":
        vibration_index = "HIGH (Indian Highway & State Road Corrugation)"
        recommended_film_upgrade.append("Increase inner sealant layer thickness by +10µm (mLLDPE 50µm) to prevent flex-crack leaks.")
    elif req.transport_mode == "MARITIME_CARGO":
        vibration_index = "MODERATE (Ocean Waves & Engine Resonance)"
        if req.ambient_avg_rh_pct > 80.0:
            desiccant_required = True
            recommended_film_upgrade.append("Add Clay/Silica Gel Desiccant strip to absorb container rain condensation.")
        if req.transit_days > 14.0:
            o2_scavenger_recommended = True
            recommended_film_upgrade.append("Incorporate Iron-based Active Oxygen Scavenger sachet (< 0.05% residual O2).")

    return {
        "route_summary": f"{req.origin} → {req.destination} ({req.distance_km} km, {req.transit_days} days via {req.transport_mode})",
        "vibration_severity": vibration_index,
        "container_rain_risk": "HIGH" if req.ambient_avg_rh_pct > 75.0 else "LOW",
        "desiccant_sachet_required": desiccant_required,
        "active_oxygen_scavenger_recommended": o2_scavenger_recommended,
        "protective_upgrades": recommended_film_upgrade,
        "recommended_outer_carton": "5-Ply Heavy-Duty Corrugated Flute B/C Box with Moisture-Resistant Coating"
    }
