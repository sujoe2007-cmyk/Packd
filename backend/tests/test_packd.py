import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import engine, Base, SessionLocal
from app.seed_data import seed_database
from app.engine.physics import PackagingPhysicsEngine
from app.engine.sustainability import SustainabilityEngine

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_physics_wvtr_calculation():
    wvtr = PackagingPhysicsEngine.calculate_target_wvtr(
        moisture_pct=2.0,
        water_activity=0.18,
        package_weight_g=100.0,
        package_surface_area_cm2=400.0,
        desired_shelf_life_days=180.0,
        storage_temp_c=30.0,
        storage_rh_pct=80.0,
        moisture_sensitivity="CRITICAL"
    )
    assert wvtr > 0.0
    assert isinstance(wvtr, float)

def test_physics_otr_calculation():
    otr = PackagingPhysicsEngine.calculate_target_otr(
        fat_pct=34.0,
        package_weight_g=100.0,
        package_surface_area_cm2=400.0,
        headspace_volume_cm3=150.0,
        desired_shelf_life_days=180.0,
        oxygen_sensitivity="HIGH",
        is_respiring=False
    )
    assert otr > 0.0
    assert isinstance(otr, float)

def test_produce_respiration_map_and_perforation():
    perf_data = PackagingPhysicsEngine.calculate_produce_map_and_perforation(
        respiration_rate_o2_20c=65.0, # Fresh strawberries
        respiration_quotient=1.2,
        package_weight_g=250.0,
        package_surface_area_cm2=350.0,
        storage_temp_c=4.0,
        optimal_o2_pct=5.0,
        optimal_co2_pct=12.0
    )
    assert "is_required" in perf_data
    assert perf_data["ro2_at_storage_temp_mg_kg_h"] > 0

def test_sustainability_metrics():
    metrics = SustainabilityEngine.calculate_metrics(
        primary_material_code="BIO-TRIPLE-80",
        total_thickness_um=80.0,
        surface_area_cm2=400.0,
        is_biodegradable=True,
        is_recyclable=False,
        recycling_code=7
    )
    assert metrics["sustainability_score"] > 70.0
    assert "Compostable" in metrics["pwm_category"]

def test_get_commodities_api():
    response = client.get("/api/v1/commodities")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    mango = next((c for c in data if "Mango" in c["name"]), None)
    assert mango is not None
    assert mango["is_respiring"] is True

def test_get_materials_api():
    response = client.get("/api/v1/materials")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5

def test_ai_estimate_food_properties():
    response = client.post("/api/v1/commodities/ai-estimate", json={
        "name": "Spicy Banana Chips",
        "category": "Snacks & Ready-To-Eat",
        "description": "Deep fried banana chips with chilli powder",
        "target_shelf_life_days": 60
    })
    assert response.status_code == 200
    data = response.json()
    assert data["fat_content"] > 15.0
    assert data["oxygen_sensitivity"] in ["HIGH", "CRITICAL"]

def test_recommendation_flow_potato_chips():
    payload = {
        "commodity_name": "Crispy Potato Wafers",
        "category": "Snacks & Ready-To-Eat",
        "moisture_content": 2.0,
        "fat_content": 34.0,
        "ph": 6.0,
        "water_activity": 0.18,
        "is_respiring": False,
        "desired_shelf_life_days": 180.0,
        "storage_type": "AMBIENT",
        "storage_temperature_c": 30.0,
        "storage_relative_humidity_pct": 75.0,
        "transportation_stress": "HIGH",
        "package_weight_grams": 50.0,
        "package_surface_area_cm2": 320.0,
        "headspace_volume_cm3": 120.0,
        "eco_priority": "BALANCED"
    }
    response = client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["target_wvtr"] > 0
    assert data["target_otr"] > 0
    assert len(data["laminate_layers"]) >= 2
    assert data["is_map_recommended"] is True

def test_shelf_life_simulation():
    payload = {
        "commodity_name": "Fresh Paneer",
        "storage_temperature_c": 4.0,
        "relative_humidity_pct": 85.0,
        "duration_days": 30,
        "custom_otr": 1.5,
        "custom_wvtr": 2.0,
        "is_map_applied": True
    }
    response = client.post("/api/v1/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["timeline_data"]) == 31
    assert "quality_score" in data["timeline_data"][0]

def test_digital_passport_creation():
    rec_resp = client.post("/api/v1/recommend", json={
        "commodity_name": "Basmati Rice",
        "category": "Grains & Cereals",
        "moisture_content": 12.0,
        "fat_content": 0.8,
        "ph": 6.5,
        "water_activity": 0.58,
        "is_respiring": False,
        "desired_shelf_life_days": 365.0,
        "storage_type": "AMBIENT",
        "storage_temperature_c": 25.0,
        "storage_relative_humidity_pct": 65.0,
        "package_weight_grams": 1000.0,
        "package_surface_area_cm2": 800.0,
        "headspace_volume_cm3": 200.0
    })
    rec_id = rec_resp.json()["id"]
    
    passport_resp = client.post("/api/v1/passports", json={
        "recommendation_id": rec_id,
        "batch_lot_number": "LOT-2026-BR-09",
        "manufacturer_name": "AgroHeritage Exports Ltd",
        "facility_location": "Karnal, Haryana",
        "shelf_life_days_granted": 365
    })
    assert passport_resp.status_code == 200
    p_data = passport_resp.json()
    assert p_data["passport_code"].startswith("PK-2026-")
    assert p_data["qr_code_data_url"].startswith("data:image/png;base64,")

def test_materials_compare_api():
    mats = client.get("/api/v1/materials").json()
    assert len(mats) >= 2
    mat_ids = [mats[0]["id"], mats[1]["id"]]
    compare_resp = client.post("/api/v1/materials/compare", json={"material_ids": mat_ids})
    assert compare_resp.status_code == 200
    data = compare_resp.json()
    assert data["count"] == 2
    assert len(data["metrics_radar"]) == 5
    for metric in data["metrics_radar"]:
        assert "metric" in metric

def test_sustainability_calculate_api():
    resp = client.post("/api/v1/sustainability/calculate", json={
        "material_code": "BOPP-PE-60",
        "total_thickness_um": 60.0,
        "surface_area_cm2": 400.0,
        "annual_pack_volume": 500000,
        "is_biodegradable": False,
        "is_recyclable": True,
        "recycling_code": 4
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "per_pack_metrics" in data
    assert "annual_projection" in data
    assert data["annual_projection"]["annual_pack_volume"] == 500000

def test_iot_cold_chain_api():
    logs = [
        {"timestamp_hour": 1, "temperature_c": 12.2, "relative_humidity_pct": 89.0, "vibration_g": 0.2},
        {"timestamp_hour": 2, "temperature_c": 19.5, "relative_humidity_pct": 85.0, "vibration_g": 0.4},
        {"timestamp_hour": 3, "temperature_c": 21.0, "relative_humidity_pct": 84.0, "vibration_g": 0.5},
    ]
    resp = client.post("/api/v1/logistics/iot-sync", json={
        "commodity_name": "Alphonso Mango",
        "baseline_shelf_life_days": 21.0,
        "ideal_storage_temp_c": 12.0,
        "actual_logs": logs
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_abuse_hours"] >= 2.0
    assert "adjusted_remaining_shelf_life_days" in data

def test_compliance_check_api():
    resp = client.post("/api/v1/compliance/check", json={
        "material_code": "BOPP-PE-60",
        "food_category": "Snacks & Ready-To-Eat",
        "contact_temperature_c": 25.0,
        "intended_shelf_life_days": 180.0
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["overall_compliance_status"] == "CERTIFIED_FOOD_GRADE"
    assert data["is_safe_for_direct_contact"] is True
    assert len(data["simulant_test_matrix"]) == 3

def test_vision_scan_api():
    import io
    from PIL import Image
    # Create simple in-memory test image
    img = Image.new("RGB", (64, 64), color=(240, 180, 40))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    
    files = {"file": ("test_mango.png", buf, "image/png")}
    data = {"food_hint": "Alphonso Mango"}
    resp = client.post("/api/v1/vision/scan", files=files, data=data)
    assert resp.status_code == 200
    res_json = resp.json()
    assert res_json["detected_food_name"] == "Alphonso Mango"
    assert res_json["category"] == "Fresh Produce"
    assert res_json["estimated_respiration_rate_o2"] > 0

