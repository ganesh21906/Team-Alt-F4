"""
What-If Scenario Simulation Engine for EduPulse ML Subsystem.
Runs baseline and hypothetical counterfactual profiles through the exact production pipeline.
Enriched with human-readable comparative metadata for frontend UI components.
"""

from typing import Dict, Any
import pandas as pd
import numpy as np


def run_what_if_simulation(
    predict_fn,
    baseline_payload: Dict[str, Any],
    scenario_payload: Dict[str, Any],
    student_level: str
) -> Dict[str, Any]:
    """
    Executes model-based scenario simulation comparing baseline and modified feature profiles.
    
    Returns UI-friendly structure ready for frontend display.
    """
    full_scenario_payload = baseline_payload.copy()
    full_scenario_payload.update(scenario_payload)

    baseline_res = predict_fn(baseline_payload, student_level)
    scenario_res = predict_fn(full_scenario_payload, student_level)

    curr_score = baseline_res["predicted_score"]
    scen_score = scenario_res["predicted_score"]
    score_diff = round(float(scen_score - curr_score), 2)

    curr_risk = baseline_res["risk_level"]
    scen_risk = scenario_res["risk_level"]

    risk_severity_map = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
    is_improved = risk_severity_map[scen_risk] < risk_severity_map[curr_risk]

    diff_str = f"+{score_diff}" if score_diff > 0 else f"{score_diff}"
    unit = "/20" if student_level.lower() == "school" else "%"

    summary = (
        f"Under this hypothetical scenario, the predicted score moves from {curr_score}{unit} to {scen_score}{unit} "
        f"({diff_str} pts). Risk level transitions from {curr_risk} to {scen_risk}."
    )

    return {
        "student_level": student_level,
        "current_predicted_score": curr_score,
        "scenario_predicted_score": scen_score,
        "current_score_formatted": baseline_res["formatted_score"],
        "scenario_score_formatted": scenario_res["formatted_score"],
        "score_difference": score_diff,
        "score_difference_formatted": f"{diff_str} pts",
        "current_risk_level": curr_risk,
        "scenario_risk_level": scen_risk,
        "risk_transition": {
            "from_risk": curr_risk,
            "to_risk": scen_risk,
            "is_improved": is_improved,
            "risk_changed": curr_risk != scen_risk
        },
        "current_ui_badge": baseline_res.get("ui_risk_badge"),
        "scenario_ui_badge": scenario_res.get("ui_risk_badge"),
        "current_top_factors": baseline_res.get("top_factors", []),
        "scenario_top_factors": scenario_res.get("top_factors", []),
        "recommended_interventions": scenario_res.get("recommended_interventions", []),
        "summary": summary,
        "disclaimer": "This scenario prediction is model-based decision support and does not imply causal guarantee."
    }
