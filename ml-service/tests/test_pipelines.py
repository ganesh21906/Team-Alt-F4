"""
Unit tests for EduPulse Inference Pipelines, UI Enriched Metadata, and SHAP Explainability.
"""

import pytest
from src.predict import get_inference_engine


@pytest.fixture(scope="module")
def engine():
    return get_inference_engine()


def test_school_prediction(engine):
    school_payload = {
        "school": "GP", "sex": "F", "age": 17, "address": "U", "famsize": "GT3", "Pstatus": "T",
        "Medu": 4, "Fedu": 4, "Mjob": "health", "Fjob": "teacher", "reason": "home", "guardian": "mother",
        "traveltime": 1, "studytime": 3, "failures": 0, "schoolsup": "no", "famsup": "yes", "paid": "no",
        "activities": "yes", "nursery": "yes", "higher": "yes", "internet": "yes", "romantic": "no",
        "famrel": 4, "freetime": 3, "goout": 3, "Dalc": 1, "Walc": 1, "health": 5, "absences": 2, "G1": 14
    }

    res = engine.predict(school_payload, student_level="school")

    assert res["student_level"] == "school"
    assert 0.0 <= res["predicted_score"] <= 20.0
    assert "formatted_score" in res
    assert res["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert "ui_risk_badge" in res
    assert "label" in res["ui_risk_badge"]
    assert "color" in res["ui_risk_badge"]
    assert "LOW" in res["risk_probabilities"]
    assert "LOW" in res["risk_probability_percentages"]
    
    probs = res["risk_probabilities"]
    total_p = probs["LOW"] + probs["MEDIUM"] + probs["HIGH"]
    assert abs(total_p - 1.0) < 0.05
    assert isinstance(res["top_factors"], list)
    assert isinstance(res["recommended_interventions"], list)
    if len(res["top_factors"]) > 0:
        assert "feature_display_name" in res["top_factors"][0]
        assert "description" in res["top_factors"][0]


def test_college_prediction(engine):
    college_payload = {
        "Sex": 1, "Graduated high-school type": 1, "Scholarship type": 2, "Additional work": 1,
        "Regular artistic or sports activity": 2, "Do you have a partner": 2, "Total salary if available": 1,
        "Transportation to the university": 1, "Accomodation type in Cyprus": 1, "Mother's education": 3,
        "Father's education": 3, "Number of sisters/brothers (if available)": 2, "Parental status": 1,
        "Mother's occupation": 2, "Father's occupation": 2, "Weekly study hours": 3,
        "Reading frequency (non-scientific books/journals)": 2, "Reading frequency (scientific books/journals)": 2,
        "Attendance to the seminars/conferences related to the department": 1,
        "Impact of your projects/activities on your success": 1, "Attendance to classes": 1,
        "Preparation to midterm exams 1": 1, "Preparation to midterm exams 2": 1,
        "Taking notes in classes": 1, "Listening in classes": 1,
        "Discussion improves my interest and success in the course": 1, "Flip-classroom": 1,
        "Cumulative grade point average in the last semester (/4.00)": 3,
        "Expected Cumulative grade point average in the graduation (/4.00)": 3, "Course ID": 1, "Student Age": 2
    }

    res = engine.predict(college_payload, student_level="college")

    assert res["student_level"] == "college"
    assert 0.0 <= res["predicted_score"] <= 100.0
    assert "formatted_score" in res
    assert res["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert "ui_risk_badge" in res
    assert isinstance(res["top_factors"], list)
    assert isinstance(res["recommended_interventions"], list)
