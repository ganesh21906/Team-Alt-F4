"""
Domain Feature Engineering Transformers for EduPulse ML Subsystem.
Implements custom Scikit-Learn transformers for School and College feature calculation.
"""

import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin


class SchoolFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Scikit-learn compatible transformer for School feature engineering.
    Calculates derived behavioral and academic features.
    """
    def __init__(self, include_period_grades: bool = True):
        self.include_period_grades = include_period_grades

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        df = X.copy()
        
        # 1. Alcohol index (weighted: weekday x 5 + weekend x 2) / 7
        if "Dalc" in df.columns and "Walc" in df.columns:
            df["alcohol_index"] = (df["Dalc"] * 5 + df["Walc"] * 2) / 7.0

        # 2. Study to leisure ratio
        if "studytime" in df.columns and "freetime" in df.columns and "goout" in df.columns:
            df["study_to_leisure_ratio"] = df["studytime"] / (df["freetime"] + df["goout"] + 1e-5)

        # 3. Parent education average
        if "Medu" in df.columns and "Fedu" in df.columns:
            df["parent_edu_avg"] = (df["Medu"] + df["Fedu"]) / 2.0

        # 4. Support score
        support_cols = ["schoolsup", "famsup", "paid", "internet"]
        binary_map = {"yes": 1, "no": 0, 1: 1, 0: 0, "1": 1, "0": 0}
        
        support_sum = 0
        for col in support_cols:
            if col in df.columns:
                support_sum = support_sum + df[col].map(lambda v: binary_map.get(str(v).lower(), 0))
        df["support_score"] = support_sum

        # 5. Absences to study ratio
        if "absences" in df.columns and "studytime" in df.columns:
            df["absences_per_study_hour"] = df["absences"] / (df["studytime"] * 2.5 + 1.0)

        # Drop G2 strictly to prevent temporal data leakage
        if "G2" in df.columns:
            df = df.drop(columns=["G2"])

        if not self.include_period_grades and "G1" in df.columns:
            df = df.drop(columns=["G1"])

        return df


class CollegeFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Scikit-learn compatible transformer for College feature engineering.
    Calculates composite academic habits and GPA gap indices.
    """
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        df = X.copy()

        # 1. Exam preparation composite
        p1 = df["Preparation to midterm exams 1"] if "Preparation to midterm exams 1" in df.columns else 0
        p2 = df["Preparation to midterm exams 2"] if "Preparation to midterm exams 2" in df.columns else 0
        df["exam_prep_score"] = p1 + p2

        # 2. Classroom engagement index
        att = df["Attendance to classes"] if "Attendance to classes" in df.columns else 0
        note = df["Taking notes in classes"] if "Taking notes in classes" in df.columns else 0
        listen = df["Listening in classes"] if "Listening in classes" in df.columns else 0
        flip = df["Flip-classroom"] if "Flip-classroom" in df.columns else 0
        df["classroom_engagement_index"] = att + note + listen + flip

        # 3. GPA expectation gap
        if ("Expected Cumulative grade point average in the graduation (/4.00)" in df.columns and 
            "Cumulative grade point average in the last semester (/4.00)" in df.columns):
            df["gpa_expectation_gap"] = (
                df["Expected Cumulative grade point average in the graduation (/4.00)"] - 
                df["Cumulative grade point average in the last semester (/4.00)"]
            )

        # 4. Parent education total
        if "Mother's education" in df.columns and "Father's education" in df.columns:
            df["parent_edu_total"] = df["Mother's education"] + df["Father's education"]

        return df
