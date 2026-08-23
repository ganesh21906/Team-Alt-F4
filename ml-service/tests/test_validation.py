"""
Unit tests for EduPulse Data Validation module.
"""

import pytest
import pandas as pd
from src.data_validation import (
    validate_school_dataframe,
    validate_college_dataframe,
    validate_single_input,
    DataValidationError
)


def test_school_validation_valid():
    sample = {
        "school": "GP", "sex": "F", "age": 17, "address": "U", "famsize": "GT3", "Pstatus": "T",
        "Medu": 4, "Fedu": 4, "Mjob": "health", "Fjob": "teacher", "reason": "home", "guardian": "mother",
        "traveltime": 1, "studytime": 3, "failures": 0, "schoolsup": "no", "famsup": "yes", "paid": "no",
        "activities": "yes", "nursery": "yes", "higher": "yes", "internet": "yes", "romantic": "no",
        "famrel": 4, "freetime": 3, "goout": 3, "Dalc": 1, "Walc": 1, "health": 5, "absences": 4, "G1": 15, "G2": 16, "G3": 17
    }
    df = pd.DataFrame([sample])
    valid, errors = validate_school_dataframe(df, is_training=True)
    assert valid is True
    assert len(errors) == 0


def test_school_validation_invalid_bounds():
    sample = {
        "school": "GP", "sex": "F", "age": 35,  # Out of range (>30)
        "address": "U", "famsize": "GT3", "Pstatus": "T",
        "Medu": 4, "Fedu": 4, "Mjob": "health", "Fjob": "teacher", "reason": "home", "guardian": "mother",
        "traveltime": 1, "studytime": 3, "failures": 0, "schoolsup": "no", "famsup": "yes", "paid": "no",
        "activities": "yes", "nursery": "yes", "higher": "yes", "internet": "yes", "romantic": "no",
        "famrel": 4, "freetime": 3, "goout": 3, "Dalc": 1, "Walc": 1, "health": 5, "absences": -5  # Negative
    }
    df = pd.DataFrame([sample])
    valid, errors = validate_school_dataframe(df, is_training=False)
    assert valid is False
    assert any("age" in err.lower() for err in errors)
    assert any("absences" in err.lower() for err in errors)


def test_college_validation_valid():
    sample = {
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
        "Expected Cumulative grade point average in the graduation (/4.00)": 3, "Course ID": 1, "Student Age": 2, "OUTPUT Grade": 4
    }
    df = pd.DataFrame([sample])
    valid, errors = validate_college_dataframe(df, is_training=True)
    assert valid is True


def test_single_input_raises_exception():
    with pytest.raises(DataValidationError):
        validate_single_input({"invalid": "payload"}, student_level="school")
