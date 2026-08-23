"""
Unit tests for What-If scenario simulation and FastAPI endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from api.main import app
from src.predict import get_inference_engine
from src.what_if import run_what_if_simulation

client = TestClient(app)


def test_what_if_simulation_calculation():
    engine = get_inference_engine()
    baseline = {
        "school": "GP", "sex": "F", "age": 17, "address": "U", "famsize": "GT3", "Pstatus": "T",
        "Medu": 4, "Fedu": 4, "Mjob": "health", "Fjob": "teacher", "reason": "home", "guardian": "mother",
        "traveltime": 1, "studytime": 1, "failures": 2, "schoolsup": "no", "famsup": "no", "paid": "no",
        "activities": "no", "nursery": "yes", "higher": "yes", "internet": "yes", "romantic": "no",
        "famrel": 2, "freetime": 4, "goout": 5, "Dalc": 3, "Walc": 4, "health": 2, "absences": 18, "G1": 8
    }

    scenario = {
        "studytime": 4,
        "absences": 2,
        "Dalc": 1,
        "Walc": 1
    }

    res = run_what_if_simulation(
        predict_fn=engine.predict,
        baseline_payload=baseline,
        scenario_payload=scenario,
        student_level="school"
    )

    assert res["student_level"] == "school"
    assert "current_predicted_score" in res
    assert "scenario_predicted_score" in res
    assert "score_difference" in res
    assert res["summary"] is not None


def test_api_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["school_model_loaded"] is True
    assert data["college_model_loaded"] is True


def test_api_predict_school_endpoint():
    payload = {
        "student_level": "school",
        "payload": {
            "school": "GP", "sex": "F", "age": 17, "address": "U", "famsize": "GT3", "Pstatus": "T",
            "Medu": 4, "Fedu": 4, "Mjob": "health", "Fjob": "teacher", "reason": "home", "guardian": "mother",
            "traveltime": 1, "studytime": 3, "failures": 0, "schoolsup": "no", "famsup": "yes", "paid": "no",
            "activities": "yes", "nursery": "yes", "higher": "yes", "internet": "yes", "romantic": "no",
            "famrel": 4, "freetime": 3, "goout": 3, "Dalc": 1, "Walc": 1, "health": 5, "absences": 2, "G1": 15
        }
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["student_level"] == "school"
    assert "predicted_score" in data
    assert "risk_level" in data
    assert "top_factors" in data


def test_api_what_if_endpoint():
    payload = {
        "student_level": "school",
        "baseline_payload": {
            "school": "GP", "sex": "F", "age": 17, "address": "U", "famsize": "GT3", "Pstatus": "T",
            "Medu": 4, "Fedu": 4, "Mjob": "health", "Fjob": "teacher", "reason": "home", "guardian": "mother",
            "traveltime": 1, "studytime": 1, "failures": 2, "schoolsup": "no", "famsup": "no", "paid": "no",
            "activities": "no", "nursery": "yes", "higher": "yes", "internet": "yes", "romantic": "no",
            "famrel": 2, "freetime": 4, "goout": 5, "Dalc": 3, "Walc": 4, "health": 2, "absences": 18, "G1": 8
        },
        "scenario_payload": {
            "studytime": 4,
            "absences": 2
        }
    }
    response = client.post("/what-if", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "current_predicted_score" in data
    assert "scenario_predicted_score" in data
