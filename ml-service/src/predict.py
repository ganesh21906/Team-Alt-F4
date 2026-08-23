"""
Consolidated Inference Pipeline for EduPulse ML Subsystem.
Loads serialized pipelines at module import / startup and handles single/batch predictions.
Enriched with human-readable UI metadata, badges, and actionable recommendations.
"""

import os
import json
from pathlib import Path
from typing import Dict, Any, Optional, List
import pandas as pd
import numpy as np
import joblib

from src.config import (
    SCHOOL_MODEL_DIR, COLLEGE_MODEL_DIR,
    SCHOOL_HIGH_RISK_THRESHOLD, SCHOOL_MEDIUM_RISK_THRESHOLD,
    COLLEGE_HIGH_RISK_GRADES, COLLEGE_MEDIUM_RISK_GRADES, COLLEGE_LOW_RISK_GRADES
)
from src.data_validation import validate_single_input, DataValidationError
from src.explain import ModelExplainer
from src.trend import calculate_academic_trend


FEATURE_DISPLAY_NAMES = {
    # School
    "G1": "First Period Grade",
    "G2": "Second Period Grade",
    "studytime": "Weekly Study Time",
    "failures": "Past Class Failures",
    "absences": "School Absences",
    "Dalc": "Workday Alcohol Consumption",
    "Walc": "Weekend Alcohol Consumption",
    "alcohol_index": "Combined Alcohol Consumption Index",
    "study_to_leisure_ratio": "Study-to-Leisure Time Ratio",
    "support_score": "Educational Support Level",
    "parent_edu_avg": "Parents' Average Education",
    "schoolsup": "Extra Educational Support",
    "famsup": "Family Educational Support",
    "paid": "Extra Paid Classes",
    "activities": "Extra-curricular Activities",
    "higher": "Desire for Higher Education",
    "internet": "Internet Access at Home",
    "romantic": "Romantic Relationship",
    "famrel": "Family Relationship Quality",
    "freetime": "Free Time After School",
    "goout": "Going Out with Friends",
    "health": "Current Health Status",
    "traveltime": "Travel Time to School",
    
    # College
    "Weekly study hours": "Weekly Study Hours",
    "Attendance to classes": "Class Attendance Rate",
    "Preparation to midterm exams 1": "Midterm 1 Exam Prep",
    "Preparation to midterm exams 2": "Midterm 2 Exam Prep",
    "Taking notes in classes": "In-Class Note Taking",
    "Listening in classes": "In-Class Attentiveness",
    "Flip-classroom": "Flipped Classroom Engagement",
    "Cumulative grade point average in the last semester (/4.00)": "Last Semester GPA",
    "Expected Cumulative grade point average in the graduation (/4.00)": "Expected Graduation GPA",
    "exam_prep_score": "Total Exam Preparation Score",
    "classroom_engagement_index": "Classroom Engagement Index",
    "gpa_expectation_gap": "GPA Expectation Gap",
    "Scholarship type": "Scholarship Level",
    "Additional work": "Outside Employment",
}

RISK_UI_METADATA = {
    "HIGH": {
        "label": "High Academic Risk",
        "color": "red",
        "bg_color": "#FEE2E2",
        "text_color": "#991B1B",
        "icon": "alert-triangle",
        "severity": 3,
        "action_required": True
    },
    "MEDIUM": {
        "label": "Moderate Risk",
        "color": "amber",
        "bg_color": "#FEF3C7",
        "text_color": "#92400E",
        "icon": "alert-circle",
        "severity": 2,
        "action_required": True
    },
    "LOW": {
        "label": "Low Risk / On Track",
        "color": "green",
        "bg_color": "#D1FAE5",
        "text_color": "#065F46",
        "icon": "check-circle",
        "severity": 1,
        "action_required": False
    }
}


def enrich_top_factors(raw_factors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Enriches SHAP factor dictionaries with UI display titles and explanations."""
    enriched = []
    for factor in raw_factors:
        raw_feat = factor["feature"]
        display_name = FEATURE_DISPLAY_NAMES.get(raw_feat, raw_feat.replace("_", " ").title())
        impact = factor["impact"]
        direction = factor["direction"]
        val = factor.get("value")

        if direction == "positive":
            desc = f"{display_name} ({val if val is not None else ''}) contributed positively (+{abs(impact):.2f} pts)"
        else:
            desc = f"{display_name} ({val if val is not None else ''}) negatively impacted prediction (-{abs(impact):.2f} pts)"

        enriched.append({
            "feature": raw_feat,
            "feature_display_name": display_name,
            "value": val,
            "impact": impact,
            "direction": direction,
            "description": desc
        })
    return enriched


def generate_recommendations(top_factors: List[Dict[str, Any]]) -> List[str]:
    """Generates actionable intervention recommendations based on negative factors."""
    recs = []
    for factor in top_factors:
        if factor["direction"] == "negative":
            feat = factor["feature"]
            if feat == "studytime" or feat == "Weekly study hours":
                recs.append("Increase weekly study time by 2-4 hours to improve concept mastery.")
            elif feat == "absences" or feat == "Attendance to classes":
                recs.append("Improve class attendance rate to prevent missing critical lectures.")
            elif feat == "failures":
                recs.append("Schedule 1-on-1 tutoring sessions to remediate past subject gaps.")
            elif feat == "Preparation to midterm exams 1" or feat == "Preparation to midterm exams 2" or feat == "exam_prep_score":
                recs.append("Start midterm exam preparation at least two weeks prior using review sessions.")
            elif feat == "goout" or feat == "Dalc" or feat == "Walc":
                recs.append("Balance social activities and maintain structured study routines.")
            else:
                display_name = FEATURE_DISPLAY_NAMES.get(feat, feat.replace("_", " ").title())
                recs.append(f"Focus on improving {display_name} to boost predicted outcome.")

    if not recs:
        recs.append("Maintain current positive study habits and academic performance.")

    return recs[:3]  # Return top 3 actionable recommendations


class EduPulseInferenceEngine:
    """
    Singleton inference engine for EduPulse model artifacts.
    Loads School and College pipelines ONCE into memory.
    """

    def __init__(self):
        self.school_pipeline = None
        self.school_metadata = None
        self.school_explainer = None

        self.college_pipeline = None
        self.college_metadata = None
        self.college_explainer = None

        self.load_models()

    def load_models(self):
        """Loads model pipelines and metadata from disk."""
        school_pipe_path = SCHOOL_MODEL_DIR / "performance_pipeline.joblib"
        school_meta_path = SCHOOL_MODEL_DIR / "metadata.json"
        if os.path.exists(school_pipe_path):
            self.school_pipeline = joblib.load(school_pipe_path)
            if os.path.exists(school_meta_path):
                with open(school_meta_path) as f:
                    self.school_metadata = json.load(f)
            feat_names = self.school_metadata.get("features", []) if self.school_metadata else []
            self.school_explainer = ModelExplainer(self.school_pipeline, feat_names)

        college_pipe_path = COLLEGE_MODEL_DIR / "performance_pipeline.joblib"
        college_meta_path = COLLEGE_MODEL_DIR / "metadata.json"
        if os.path.exists(college_pipe_path):
            self.college_pipeline = joblib.load(college_pipe_path)
            if os.path.exists(college_meta_path):
                with open(college_meta_path) as f:
                    self.college_metadata = json.load(f)
            feat_names = self.college_metadata.get("features", []) if self.college_metadata else []
            self.college_explainer = ModelExplainer(self.college_pipeline, feat_names)

    def predict_school(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Runs School pipeline prediction and returns UI-enriched JSON response."""
        if not self.school_pipeline:
            raise RuntimeError("School model pipeline is not loaded.")

        df_input = pd.DataFrame([payload])
        
        pred_score = float(self.school_pipeline.predict(df_input)[0])
        pred_score = round(max(0.0, min(20.0, pred_score)), 2)

        if pred_score < SCHOOL_HIGH_RISK_THRESHOLD:
            risk_level = "HIGH"
            p_high, p_med, p_low = 0.75, 0.20, 0.05
        elif pred_score < SCHOOL_MEDIUM_RISK_THRESHOLD:
            risk_level = "MEDIUM"
            p_high, p_med, p_low = 0.15, 0.65, 0.20
        else:
            risk_level = "LOW"
            p_high, p_med, p_low = 0.05, 0.20, 0.75

        top_factors_raw = []
        if self.school_explainer:
            top_factors_raw = self.school_explainer.explain_instance(df_input, top_k=5)

        enriched_factors = enrich_top_factors(top_factors_raw)
        recommendations = generate_recommendations(enriched_factors)

        scores_history = []
        if "G1" in payload:
            scores_history.append(float(payload["G1"]))
        if "G2" in payload:
            scores_history.append(float(payload["G2"]))
        scores_history.append(pred_score)

        trend_res = calculate_academic_trend(scores_history)

        version = self.school_metadata.get("model_version", "school-performance-v1.0.0") if self.school_metadata else "school-v1.0.0"

        return {
            "student_level": "school",
            "predicted_score": pred_score,
            "formatted_score": f"{pred_score} / 20.0",
            "score_scale": "0-20",
            "risk_level": risk_level,
            "ui_risk_badge": RISK_UI_METADATA[risk_level],
            "risk_probabilities": {
                "LOW": round(p_low, 2),
                "MEDIUM": round(p_med, 2),
                "HIGH": round(p_high, 2)
            },
            "risk_probability_percentages": {
                "LOW": f"{round(p_low * 100)}%",
                "MEDIUM": f"{round(p_med * 100)}%",
                "HIGH": f"{round(p_high * 100)}%"
            },
            "trend": trend_res["trend"],
            "top_factors": enriched_factors,
            "recommended_interventions": recommendations,
            "model_version": version
        }

    def predict_college(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Runs College pipeline prediction and returns UI-enriched JSON response."""
        if not self.college_pipeline:
            raise RuntimeError("College model pipeline is not loaded.")

        df_input = pd.DataFrame([payload])
        if "Student ID" in df_input.columns:
            df_input = df_input.drop(columns=["Student ID"])

        pred_grade = int(self.college_pipeline.predict(df_input)[0])

        if hasattr(self.college_pipeline, "predict_proba"):
            probs = self.college_pipeline.predict_proba(df_input)[0]
            classes = self.college_pipeline.named_steps["estimator"].classes_
            prob_dict = {int(c): float(p) for c, p in zip(classes, probs)}
        else:
            prob_dict = {pred_grade: 1.0}

        high_prob = sum(prob_dict.get(g, 0.0) for g in COLLEGE_HIGH_RISK_GRADES)
        med_prob = sum(prob_dict.get(g, 0.0) for g in COLLEGE_MEDIUM_RISK_GRADES)
        low_prob = sum(prob_dict.get(g, 0.0) for g in COLLEGE_LOW_RISK_GRADES)

        total_p = high_prob + med_prob + low_prob
        if total_p > 0:
            high_prob, med_prob, low_prob = high_prob / total_p, med_prob / total_p, low_prob / total_p

        if pred_grade in COLLEGE_HIGH_RISK_GRADES:
            risk_level = "HIGH"
        elif pred_grade in COLLEGE_MEDIUM_RISK_GRADES:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        grade_to_score_map = {0: 45.0, 1: 55.0, 2: 65.0, 3: 72.0, 4: 78.0, 5: 85.0, 6: 92.0, 7: 98.0}
        pred_score = grade_to_score_map.get(pred_grade, 70.0)

        top_factors_raw = []
        if self.college_explainer:
            top_factors_raw = self.college_explainer.explain_instance(df_input, top_k=5)

        enriched_factors = enrich_top_factors(top_factors_raw)
        recommendations = generate_recommendations(enriched_factors)

        version = self.college_metadata.get("model_version", "college-performance-v1.0.0") if self.college_metadata else "college-v1.0.0"

        return {
            "student_level": "college",
            "predicted_score": pred_score,
            "formatted_score": f"{pred_score}%",
            "predicted_grade_category": pred_grade,
            "score_scale": "0-100",
            "risk_level": risk_level,
            "ui_risk_badge": RISK_UI_METADATA[risk_level],
            "risk_probabilities": {
                "LOW": round(low_prob, 2),
                "MEDIUM": round(med_prob, 2),
                "HIGH": round(high_prob, 2)
            },
            "risk_probability_percentages": {
                "LOW": f"{round(low_prob * 100)}%",
                "MEDIUM": f"{round(med_prob * 100)}%",
                "HIGH": f"{round(high_prob * 100)}%"
            },
            "trend": "STABLE",
            "top_factors": enriched_factors,
            "recommended_interventions": recommendations,
            "model_version": version
        }

    def predict(self, payload: Dict[str, Any], student_level: str) -> Dict[str, Any]:
        """Unified entry point for predictions."""
        validate_single_input(payload, student_level)

        if student_level.lower() == "school":
            return self.predict_school(payload)
        elif student_level.lower() == "college":
            return self.predict_college(payload)
        else:
            raise ValueError(f"Unknown student_level: {student_level}")


_engine_instance: Optional[EduPulseInferenceEngine] = None


def get_inference_engine() -> EduPulseInferenceEngine:
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = EduPulseInferenceEngine()
    return _engine_instance
