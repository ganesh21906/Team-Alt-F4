"""
Pydantic API Schemas for EduPulse ML Subsystem.
Strictly validates input payloads and formats rich, UI-ready output contracts.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, field_validator


class FactorImpact(BaseModel):
    feature: str = Field(..., description="Raw column name of feature")
    feature_display_name: str = Field(..., description="Human-readable title for UI rendering")
    value: Optional[Any] = Field(None, description="Current feature value")
    impact: float = Field(..., description="SHAP or importance impact score")
    direction: str = Field(..., description="Direction of impact ('positive' or 'negative')")
    description: str = Field(..., description="Natural language explanation of feature impact")


class RiskBadge(BaseModel):
    label: str = Field(..., description="Display label e.g. 'High Academic Risk'")
    color: str = Field(..., description="UI theme color e.g. 'red', 'amber', 'green'")
    bg_color: str = Field(..., description="Hex code for background badge container")
    text_color: str = Field(..., description="Hex code for badge text")
    icon: str = Field(..., description="Icon identifier e.g. 'alert-triangle'")
    severity: int = Field(..., description="Numeric severity rank (1=Low, 2=Medium, 3=High)")
    action_required: bool = Field(..., description="Flag indicating if intervention is recommended")


class RiskProbabilities(BaseModel):
    LOW: float = Field(..., ge=0.0, le=1.0)
    MEDIUM: float = Field(..., ge=0.0, le=1.0)
    HIGH: float = Field(..., ge=0.0, le=1.0)


class RiskProbabilityPercentages(BaseModel):
    LOW: str = Field(..., description="Percentage string e.g. '5%'")
    MEDIUM: str = Field(..., description="Percentage string e.g. '20%'")
    HIGH: str = Field(..., description="Percentage string e.g. '75%'")


class PredictionRequest(BaseModel):
    student_level: str = Field(..., description="'school' or 'college'")
    payload: Dict[str, Any] = Field(..., description="Student demographic and academic feature key-value pairs")

    @field_validator("student_level")
    @classmethod
    def validate_level(cls, v: str) -> str:
        if v.lower() not in ["school", "college"]:
            raise ValueError("student_level must be 'school' or 'college'")
        return v.lower()


class PredictionResponse(BaseModel):
    student_level: str
    predicted_score: float
    formatted_score: str
    score_scale: str
    risk_level: str
    ui_risk_badge: RiskBadge
    risk_probabilities: RiskProbabilities
    risk_probability_percentages: RiskProbabilityPercentages
    trend: str
    top_factors: List[FactorImpact]
    recommended_interventions: List[str]
    model_version: str


class RiskTransition(BaseModel):
    from_risk: str
    to_risk: str
    is_improved: bool
    risk_changed: bool


class WhatIfRequest(BaseModel):
    student_level: str = Field(..., description="'school' or 'college'")
    baseline_payload: Optional[Dict[str, Any]] = Field(default=None, description="Current baseline student features")
    scenario_payload: Dict[str, Any] = Field(..., description="Hypothetical feature changes to evaluate")
    student_id: Optional[str] = Field(default=None, description="Optional target student ID to load baseline features")

    @field_validator("student_level")
    @classmethod
    def validate_level(cls, v: str) -> str:
        if v.lower() not in ["school", "college"]:
            raise ValueError("student_level must be 'school' or 'college'")
        return v.lower()


class WhatIfResponse(BaseModel):
    student_level: str
    current_predicted_score: float
    scenario_predicted_score: float
    current_score_formatted: str
    scenario_score_formatted: str
    score_difference: float
    score_difference_formatted: str
    current_risk_level: str
    scenario_risk_level: str
    risk_transition: RiskTransition
    current_ui_badge: Optional[RiskBadge] = None
    scenario_ui_badge: Optional[RiskBadge] = None
    current_top_factors: List[FactorImpact]
    scenario_top_factors: List[FactorImpact]
    recommended_interventions: List[str]
    summary: str
    disclaimer: str


class ExplainRequest(BaseModel):
    student_level: str
    payload: Dict[str, Any]
    top_k: int = Field(default=5, ge=1, le=15)


class ExplainResponse(BaseModel):
    student_level: str
    top_factors: List[FactorImpact]
    model_version: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    school_model_loaded: bool
    college_model_loaded: bool


class ModelInfoResponse(BaseModel):
    school_model: Optional[Dict[str, Any]] = None
    college_model: Optional[Dict[str, Any]] = None


class TaskCreateRequest(BaseModel):
    text: str


class TaskUpdateRequest(BaseModel):
    task_id: str
    status: str


class InterventionCreateRequest(BaseModel):
    title: str
    priority: str
    text: str
    action: str


class ThresholdsUpdateRequest(BaseModel):
    school_high: float
    school_medium: float
    college_high: float
    college_medium: float

