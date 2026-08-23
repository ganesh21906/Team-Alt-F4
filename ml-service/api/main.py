"""
FastAPI Inference Service for EduPulse ML Subsystem.
Exposes REST endpoints for performance prediction, risk classification,
SHAP explainability, and What-If scenario simulation.
"""

import sys
from pathlib import Path

# Ensure ml-service root directory is in PYTHONPATH
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from api.schemas import (
    PredictionRequest, PredictionResponse,
    WhatIfRequest, WhatIfResponse,
    ExplainRequest, ExplainResponse,
    HealthResponse, ModelInfoResponse
)
from src.predict import get_inference_engine, EduPulseInferenceEngine
from src.what_if import run_what_if_simulation
from src.data_validation import DataValidationError


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Loads ML pipelines ONCE at server startup."""
    print("Initializing EduPulse ML Service models...")
    engine = get_inference_engine()
    yield
    print("Shutting down EduPulse ML Service.")


app = FastAPI(
    title="EduPulse ML Subsystem API",
    description="Production ML service for student academic performance prediction, risk assessment, explainability, and counterfactual simulation.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend / backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    """Health check endpoint confirming model pipeline readiness."""
    engine = get_inference_engine()
    return {
        "status": "healthy",
        "service": "EduPulse ML Subsystem",
        "version": "1.0.0",
        "school_model_loaded": engine.school_pipeline is not None,
        "college_model_loaded": engine.college_pipeline is not None
    }


@app.get("/model-info", response_model=ModelInfoResponse, tags=["System"])
def model_info():
    """Returns versioning, feature lists, and benchmark metrics for active models."""
    engine = get_inference_engine()
    return {
        "school_model": engine.school_metadata,
        "college_model": engine.college_metadata
    }


@app.post("/predict", response_model=PredictionResponse, tags=["Inference"])
def predict(request: PredictionRequest):
    """
    Predicts student performance outcome score, risk classification level,
    risk probabilities, academic trend, and top SHAP contributing factors.
    """
    engine = get_inference_engine()
    try:
        res = engine.predict(request.payload, request.student_level)
        return res
    except DataValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )


@app.post("/what-if", response_model=WhatIfResponse, tags=["Simulation"])
def what_if_simulation(request: WhatIfRequest):
    """
    Runs model-based What-If scenario simulation comparing baseline profile
    against hypothetical feature modifications.
    """
    engine = get_inference_engine()
    try:
        res = run_what_if_simulation(
            predict_fn=engine.predict,
            baseline_payload=request.baseline_payload,
            scenario_payload=request.scenario_payload,
            student_level=request.student_level
        )
        return res
    except DataValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"What-If simulation error: {str(e)}"
        )


@app.post("/explain", response_model=ExplainResponse, tags=["Explainability"])
def explain_prediction(request: ExplainRequest):
    """
    Returns SHAP local feature importance breakdown for a student profile.
    """
    engine = get_inference_engine()
    try:
        res = engine.predict(request.payload, request.student_level)
        version = res["model_version"]
        return {
            "student_level": request.student_level,
            "top_factors": res["top_factors"][:request.top_k],
            "model_version": version
        }
    except DataValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Explainability error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
