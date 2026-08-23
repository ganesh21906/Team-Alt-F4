"""
Data Validation module for EduPulse ML Subsystem.
Validates input DataFrames and dictionaries against domain schema constraints.
"""

from typing import Dict, Any, Tuple, List, Optional
import pandas as pd
import numpy as np


class DataValidationError(ValueError):
    """Custom exception raised when input data fails schema or domain validation rules."""
    pass


def validate_school_dataframe(df: pd.DataFrame, is_training: bool = False) -> Tuple[bool, List[str]]:
    """
    Validates a School dataset DataFrame.
    
    Checks:
    - Required columns present
    - Age between 10 and 30
    - Absences non-negative
    - Dalc, Walc, famrel, freetime, goout, health between 1 and 5
    - G1, G2, G3 (if present) between 0 and 20
    """
    errors = []
    
    required_features = [
        "school", "sex", "age", "address", "famsize", "Pstatus", "Medu", "Fedu",
        "Mjob", "Fjob", "reason", "guardian", "traveltime", "studytime", "failures",
        "schoolsup", "famsup", "paid", "activities", "nursery", "higher", "internet",
        "romantic", "famrel", "freetime", "goout", "Dalc", "Walc", "health", "absences"
    ]
    
    if is_training:
        required_features.append("G3")

    for col in required_features:
        if col not in df.columns:
            errors.append(f"Missing required column: {col}")
            
    if errors:
        return False, errors

    # Check numeric bounds
    if (df["age"] < 10).any() or (df["age"] > 30).any():
        errors.append("Invalid age range (expected 10-30)")

    if (df["absences"] < 0).any() or (df["absences"] > 150).any():
        errors.append("Invalid absences value (expected 0-150)")

    for col in ["famrel", "freetime", "goout", "Dalc", "Walc", "health"]:
        if (df[col] < 1).any() or (df[col] > 5).any():
            errors.append(f"Invalid range for {col} (expected 1-5)")

    for grade_col in ["G1", "G2", "G3"]:
        if grade_col in df.columns:
            if (df[grade_col] < 0).any() or (df[grade_col] > 20).any():
                errors.append(f"Invalid grade for {grade_col} (expected 0-20)")

    return len(errors) == 0, errors


def validate_college_dataframe(df: pd.DataFrame, is_training: bool = False) -> Tuple[bool, List[str]]:
    """
    Validates a College dataset DataFrame.
    
    Checks:
    - Required columns present
    - Numeric bound constraints for categorical codes
    - OUTPUT Grade between 0 and 7 if training
    """
    errors = []
    
    required_cols = [
        "Sex", "Graduated high-school type", "Scholarship type", "Additional work",
        "Regular artistic or sports activity", "Do you have a partner", "Total salary if available",
        "Transportation to the university", "Accomodation type in Cyprus", "Mother's education",
        "Father's education", "Number of sisters/brothers (if available)", "Parental status",
        "Mother's occupation", "Father's occupation", "Weekly study hours",
        "Reading frequency (non-scientific books/journals)", "Reading frequency (scientific books/journals)",
        "Attendance to the seminars/conferences related to the department",
        "Impact of your projects/activities on your success", "Attendance to classes",
        "Preparation to midterm exams 1", "Preparation to midterm exams 2",
        "Taking notes in classes", "Listening in classes",
        "Discussion improves my interest and success in the course", "Flip-classroom",
        "Cumulative grade point average in the last semester (/4.00)",
        "Expected Cumulative grade point average in the graduation (/4.00)", "Course ID"
    ]
    
    if is_training:
        required_cols.append("OUTPUT Grade")

    for col in required_cols:
        if col not in df.columns:
            errors.append(f"Missing required college feature column: {col}")

    if errors:
        return False, errors

    if is_training and "OUTPUT Grade" in df.columns:
        if (df["OUTPUT Grade"] < 0).any() or (df["OUTPUT Grade"] > 7).any():
            errors.append("Invalid OUTPUT Grade value (expected integer 0-7)")

    return len(errors) == 0, errors


def validate_single_input(data: Dict[str, Any], student_level: str) -> None:
    """
    Validates single API dictionary payload. Raises DataValidationError on failure.
    """
    if student_level.lower() == "school":
        df = pd.DataFrame([data])
        is_valid, errors = validate_school_dataframe(df, is_training=False)
        if not is_valid:
            raise DataValidationError(f"School payload validation failed: {'; '.join(errors)}")
    elif student_level.lower() == "college":
        df = pd.DataFrame([data])
        is_valid, errors = validate_college_dataframe(df, is_training=False)
        if not is_valid:
            raise DataValidationError(f"College payload validation failed: {'; '.join(errors)}")
    else:
        raise DataValidationError(f"Unsupported student level: {student_level}")
