# 🌿 PACKD AI: Intelligent Food Packaging Material Recommendation & Shelf-Life Simulation Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.111+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_+_TypeScript-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS_+_Shadcn-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Orchestration-Docker_Compose-2496ED.svg?style=flat&logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Smart India Hackathon (SIH 2026)**
> **Problem Statement Title**: AI-Based Intelligent Food Packaging Material Recommendation System for Food Commodities

---

## 📌 1. Executive Summary & Problem Solved

Improper food packaging causes massive post-harvest loss, lipid rancidity, microbial rot, texture collapse, and shelf-life depletion. Small food processors, farmers, FPOs, MSMEs, and startups often lack technical knowledge regarding barrier properties, gas transmission rates (OTR, WVTR), storage dynamics, and Modified Atmosphere Packaging (MAP).

**PACKD AI** is an enterprise-grade, physics-informed decision-support platform that automates packaging formulation. It takes biochemical parameters (moisture, oil/fat, pH, $a_w$, respiration rate) and environmental targets (temperature, RH, logistics stress) and outputs:
1. **Multilayer Laminate Structure**: (e.g. *BOPET 12µm / Met-PET 12µm / mLLDPE 40µm*).
2. **Critical Barrier Thresholds**: Standardized OTR ($cc/m^2\cdot day\cdot atm$) and WVTR ($g/m^2\cdot day$).
3. **Produce Respiration & Laser Micro-Perforations**: Pore diameter, pore count, open area $mm^2$, and $O_2/CO_2$ equilibrium.
4. **Modified Atmosphere Packaging (MAP)**: Recommended gas flush ratios ($\% N_2, \% CO_2, \% O_2$).
5. **Dynamic Shelf-Life Kinetics**: Arrhenius temperature-abuse degradation trajectories.
6. **Sustainability & Plastic Waste Management (PWM)**: MoEFCC EPR obligations, carbon footprint, and circular biopolymer alternatives.
7. **Digital Product Passport (DPP)**: Cryptographic QR verification code with batch certificate.

---

## 🏗️ 2. System Architecture

```
                                  [ USER / CLIENT ]
                   Next.js 14 / React 18 + TypeScript + Tailwind CSS
                                          │
                                   (HTTP REST / JSON)
                                          ▼
                   ┌──────────────────────────────────────────────┐
                   │           FastAPI Gateway (:8000)            │
                   ├──────────────────────────────────────────────┤
                   │  • /api/v1/recommend     • /api/v1/simulate   │
                   │  • /api/v1/commodities   • /api/v1/materials  │
                   │  • /api/v1/passports     • /api/v1/sustainability │
                   └──────────────────────┬───────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     [ Physics-Informed Engine ]                     [ Database & Storage ]
  • Arrhenius Shelf-Life Kinetics                 • SQLite / PostgreSQL 16+
  • Michaelis-Menten Produce Respiration          • 50+ Food Commodities
  • Multilayer Laminate Synthesizer               • 30+ Polymers & Biopolymers
  • ASTM E96 & D3985 Barrier Calculations         • Redis 7.2 Cache / Queue
```

---

## 🧪 3. Mathematical & Physics Models

### 3.1 Water Vapor Transmission Rate (WVTR Target)
$$\text{WVTR}_{req} = \frac{W_s \cdot (M_{crit} - M_0)}{A_{pack} \cdot \theta \cdot (p_{sat}(T) \cdot (RH_{ext} - a_w))}$$

### 3.2 Oxygen Transmission Rate (OTR Target)
$$\text{OTR}_{target} = \frac{V_{head} \cdot \Delta [O_2]_{crit} + m_{food} \cdot \Omega_{ox}}{A_{pack} \cdot \theta \cdot \Delta P_{O_2}}$$

### 3.3 Fresh Horticultural Produce Respiration & Micro-Perforation Sizing
$$R_{O_2}(T) = R_{O_2, 20^\circ C} \cdot Q_{10}^{\frac{T - 20}{10}}$$
$$F_{pore} = \frac{D \cdot \pi d^2 \cdot \Delta C}{4 L_{film}}$$
$$\text{Pores Required} = \left\lceil \frac{R_{O_2}(T) \cdot W_{produce} - \text{OTR}_{film} \cdot A \cdot \Delta P_{O_2}}{F_{pore}} \right\rceil$$

---

## 🚀 4. Quickstart Guide (Run in 1 Minute)

### Option A: Direct Local Launcher (Recommended)
Make sure Python 3.10+ and Node.js 18+ are installed.

```bash
# 1. Run the unified dev launcher
python run_dev.py
```
- **Frontend Application**: [http://127.0.0.1:3000](http://127.0.0.1:3000)
- **FastAPI Interactive Docs (Swagger)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **FastAPI Redoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Option B: Docker Compose (Zero-Setup Containerization)
```bash
docker compose up --build -d
```

---

## 🧪 5. Automated Verification & Testing

Run the comprehensive physics, barrier modeling, and API test suite:

```bash
.\backend\venv\Scripts\pytest.exe -o pythonpath=backend backend/tests/test_packd.py -v
```

All 11 unit & integration test suites pass with 100% success rate:
- `test_health_check` ✅
- `test_physics_wvtr_calculation` ✅
- `test_physics_otr_calculation` ✅
- `test_produce_respiration_map_and_perforation` ✅
- `test_sustainability_metrics` ✅
- `test_get_commodities_api` ✅
- `test_get_materials_api` ✅
- `test_ai_estimate_food_properties` ✅
- `test_recommendation_flow_potato_chips` ✅
- `test_shelf_life_simulation` ✅
- `test_digital_passport_creation` ✅

---

## 📋 6. API Endpoint Matrix

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check |
| `POST` | `/api/v1/auth/register` | Register new organization / researcher |
| `POST` | `/api/v1/auth/login` | Authenticate & issue JWT bearer token |
| `GET` | `/api/v1/commodities` | List 50+ pre-seeded commodities with filters |
| `POST` | `/api/v1/commodities/ai-estimate` | AI Wizard: auto-infer biochemical parameters for any custom food |
| `GET` | `/api/v1/materials` | Packaging material database (OTR, WVTR, tensile, eco-scores) |
| `POST` | `/api/v1/materials/compare` | Side-by-side comparison of 2-4 packaging polymers |
| `POST` | `/api/v1/recommend` | **Core AI Engine**: Multilayer laminate formulation, barrier targets & MAP |
| `POST` | `/api/v1/simulate` | **Shelf-Life Simulator**: Dynamic Arrhenius quality degradation curve |
| `POST` | `/api/v1/passports` | Generate Digital Product Passport (DPP) with scannable QR Code |
| `GET` | `/api/v1/passports/{code}` | Retrieve and verify cryptographic passport |
| `POST` | `/api/v1/sustainability/calculate` | Plastic Waste Management (PWM) & EPR calculation |

---

## 🏆 SIH Problem Statement Compliance Checklist

- [x] Input parameters: commodity type, moisture, fat/oil, pH, respiration rate, shelf life, temp, RH, transport stress, storage mode.
- [x] Comprehensive material database (LDPE, HDPE, PET, Met-PET, Met-BOPP, Alu Foil, EVOH, PLA, PBAT, PHA, Anti-fog BOPP).
- [x] Oxygen Transmission Rate (OTR) and Water Vapor Transmission Rate (WVTR) computation.
- [x] Multilayer laminate structure synthesis and total thickness optimization.
- [x] Modified Atmosphere Packaging (MAP) gas composition ($O_2/CO_2/N_2$).
- [x] Fresh produce respiration compensation with laser micro-perforation sizing ($70\mu m$).
- [x] Shelf-life prediction and Arrhenius kinetic degradation simulation.
- [x] Sustainability, recyclability grading, and Plastic Waste Management (PWM) EPR calculation.
- [x] Cost estimation per 1,000 units.
- [x] Smart QR-based Digital Product Passport & traceability certificates.
