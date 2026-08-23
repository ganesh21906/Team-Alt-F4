"""
Preprocessing module for EduPulse ML Subsystem.
Constructs ColumnTransformers and Scikit-Learn pipelines.
"""

from typing import Tuple, List
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler, OrdinalEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

from src.config import (
    SCHOOL_CATEGORICAL_FEATURES,
    SCHOOL_NUMERICAL_FEATURES,
    COLLEGE_CATEGORICAL_FEATURES,
    COLLEGE_NUMERICAL_FEATURES
)
from src.features import SchoolFeatureEngineer, CollegeFeatureEngineer


def get_school_preprocessor(include_period_grades: bool = True) -> Tuple[Pipeline, List[str], List[str]]:
    """
    Returns full preprocessing pipeline for School dataset.
    """
    cat_cols = list(SCHOOL_CATEGORICAL_FEATURES)
    num_cols = list(SCHOOL_NUMERICAL_FEATURES)
    
    # Engineered features added by SchoolFeatureEngineer
    engineered_num_cols = [
        "alcohol_index", "study_to_leisure_ratio", "parent_edu_avg",
        "support_score", "absences_per_study_hour"
    ]
    
    all_num_cols = num_cols + engineered_num_cols
    if include_period_grades:
        all_num_cols.append("G1")

    num_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    col_preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_transformer, all_num_cols),
            ("cat", cat_transformer, cat_cols)
        ],
        remainder="drop"
    )

    full_pipeline = Pipeline(steps=[
        ("feature_engineer", SchoolFeatureEngineer(include_period_grades=include_period_grades)),
        ("preprocessor", col_preprocessor)
    ])

    return full_pipeline, all_num_cols, cat_cols


def get_college_preprocessor() -> Tuple[Pipeline, List[str], List[str]]:
    """
    Returns full preprocessing pipeline for College dataset.
    """
    cat_cols = list(COLLEGE_CATEGORICAL_FEATURES)
    num_cols = list(COLLEGE_NUMERICAL_FEATURES)

    engineered_num_cols = [
        "exam_prep_score", "classroom_engagement_index", 
        "gpa_expectation_gap", "parent_edu_total"
    ]
    all_num_cols = num_cols + engineered_num_cols

    num_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("ordinal", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1))
    ])

    col_preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_transformer, all_num_cols),
            ("cat", cat_transformer, cat_cols)
        ],
        remainder="drop"
    )

    full_pipeline = Pipeline(steps=[
        ("feature_engineer", CollegeFeatureEngineer()),
        ("preprocessor", col_preprocessor)
    ])

    return full_pipeline, all_num_cols, cat_cols
