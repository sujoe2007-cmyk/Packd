import io
import base64
import uuid
from datetime import datetime, timedelta
import qrcode
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import TraceabilityPassport, PackagingRecommendation
from app.schemas.domain import PassportCreateRequest, PassportResponse

router = APIRouter(prefix="/passports", tags=["Smart QR Traceability & Digital Passports"])

def generate_qr_data_url(data_str: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(data_str)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_str}"

@router.post("", response_model=PassportResponse)
def create_passport(req: PassportCreateRequest, db: Session = Depends(get_db)):
    rec = db.query(PackagingRecommendation).filter(PackagingRecommendation.id == req.recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation record not found.")
        
    code_suffix = uuid.uuid4().hex[:6].upper()
    passport_code = f"PK-2026-{code_suffix}"
    pack_date = datetime.utcnow()
    expiry_date = pack_date + timedelta(days=req.shelf_life_days_granted)
    
    # QR verification payload URL or data
    verification_payload = f"https://packd.ai/verify/{passport_code}?batch={req.batch_lot_number}&exp={expiry_date.strftime('%Y-%m-%d')}"
    qr_data_url = generate_qr_data_url(verification_payload)
    
    map_str = f"MAP ({rec.map_gas_n2_pct or 0}% N2 / {rec.map_gas_co2_pct or 0}% CO2 / {rec.map_gas_o2_pct or 0}% O2)" if rec.is_map_recommended else "Hermetic Seal"
    
    passport = TraceabilityPassport(
        id=str(uuid.uuid4()),
        passport_code=passport_code,
        recommendation_id=rec.id,
        commodity_name=rec.commodity_name,
        batch_lot_number=req.batch_lot_number,
        pack_date=pack_date,
        expiry_date=expiry_date,
        packaging_structure=rec.primary_material_name,
        target_storage_temp_c=rec.input_parameters.get("storage_temperature_c", 4.0),
        target_storage_rh_pct=rec.input_parameters.get("storage_relative_humidity_pct", 85.0),
        map_gas_flush=map_str,
        qr_code_data_url=qr_data_url,
        manufacturer_info={
            "name": req.manufacturer_name,
            "facility": req.facility_location,
            "system": "PACKD AI Verified"
        },
        compliance_certifications=["FSSAI Compliant", "IS 9845 Migration Pass", "ASTM D6400 / EN 13432", "ISO 22000"],
        is_verified=True
    )
    
    db.add(passport)
    db.commit()
    db.refresh(passport)
    return passport

@router.get("/{passport_code}", response_model=PassportResponse)
def get_passport_by_code(passport_code: str, db: Session = Depends(get_db)):
    item = db.query(TraceabilityPassport).filter(TraceabilityPassport.passport_code == passport_code).first()
    if not item:
        raise HTTPException(status_code=404, detail="Digital packaging passport not found.")
    return item

@router.get("", response_model=list[PassportResponse])
def list_passports(db: Session = Depends(get_db)):
    return db.query(TraceabilityPassport).order_by(TraceabilityPassport.created_at.desc()).limit(20).all()
