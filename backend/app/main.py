from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.seed_data import seed_database
from app.api.v1.auth import router as auth_router
from app.api.v1.commodities import router as commodities_router
from app.api.v1.materials import router as materials_router
from app.api.v1.recommend import router as recommend_router
from app.api.v1.simulate import router as simulate_router
from app.api.v1.passports import router as passports_router
from app.api.v1.sustainability import router as sustainability_router
from app.api.v1.vision import router as vision_router
from app.api.v1.logistics import router as logistics_router
from app.api.v1.compliance import router as compliance_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="PACKD AI - Intelligent Food Packaging Recommendation Engine",
    description="Physics-informed AI recommendation, shelf-life simulation, barrier modeling, MAP kinetics, vision scanner, and traceability platform for Smart India Hackathon.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(commodities_router, prefix=settings.API_V1_STR)
app.include_router(materials_router, prefix=settings.API_V1_STR)
app.include_router(recommend_router, prefix=settings.API_V1_STR)
app.include_router(simulate_router, prefix=settings.API_V1_STR)
app.include_router(passports_router, prefix=settings.API_V1_STR)
app.include_router(sustainability_router, prefix=settings.API_V1_STR)
app.include_router(vision_router, prefix=settings.API_V1_STR)
app.include_router(logistics_router, prefix=settings.API_V1_STR)
app.include_router(compliance_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PACKD AI Backend",
        "version": settings.VERSION
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to PACKD AI: Intelligent Food Packaging Recommendation System",
        "documentation": "/docs",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
