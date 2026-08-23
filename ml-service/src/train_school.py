"""
School Model Training Script for EduPulse Subsystem.
Trains and benchmarks multiple candidate models (Dummy, Linear, RF, GradientBoosting, XGBoost)
for both regression and risk classification using K-Fold cross validation.
Saves the best-performing reproducible pipeline and metadata.json artifact.
"""

import os
import json
from datetime import datetime
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import KFold, train_test_split
from sklearn.dummy import DummyRegressor, DummyClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, RandomForestClassifier, GradientBoostingClassifier
try:
    from xgboost import XGBRegressor, XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

from sklearn.pipeline import Pipeline

from src.config import (
    SCHOOL_RAW_DIR, SCHOOL_MODEL_DIR, RANDOM_SEED,
    SCHOOL_HIGH_RISK_THRESHOLD, SCHOOL_MEDIUM_RISK_THRESHOLD,
    SCHOOL_CATEGORICAL_FEATURES, SCHOOL_NUMERICAL_FEATURES
)
from src.data_validation import validate_school_dataframe
from src.preprocessing import get_school_preprocessor
from src.evaluate import calculate_regression_metrics, calculate_classification_metrics, log_experiment


def get_risk_label(g3_score: float) -> str:
    if g3_score < SCHOOL_HIGH_RISK_THRESHOLD:
        return "HIGH"
    elif g3_score < SCHOOL_MEDIUM_RISK_THRESHOLD:
        return "MEDIUM"
    else:
        return "LOW"


def train_school_models():
    print("=== STARTING SCHOOL MODEL TRAINING & BENCHMARKING ===")
    
    # 1. Load Data
    path_mat = SCHOOL_RAW_DIR / "student-mat.csv"
    path_por = SCHOOL_RAW_DIR / "student-por.csv"
    
    dfs = []
    if os.path.exists(path_mat):
        df_m = pd.read_csv(path_mat, sep=";")
        df_m["course_subject"] = "Math"
        dfs.append(df_m)
    if os.path.exists(path_por):
        df_p = pd.read_csv(path_por, sep=";")
        df_p["course_subject"] = "Portuguese"
        dfs.append(df_p)

    df_school = pd.concat(dfs, ignore_index=True) if dfs else pd.DataFrame()
    
    # Validation
    is_valid, errors = validate_school_dataframe(df_school, is_training=True)
    if not is_valid:
        raise ValueError(f"School training data validation failed: {errors}")
        
    print(f"School dataset loaded: {len(df_school)} records.")

    # 2. Separate Features & Targets
    X = df_school.drop(columns=["G3"])
    y_reg = df_school["G3"].values
    y_clf = np.array([get_risk_label(score) for score in y_reg])

    # Train / Test Split (80 / 20)
    X_train, X_test, y_train_reg, y_test_reg = train_test_split(
        X, y_reg, test_size=0.20, random_state=RANDOM_SEED
    )
    _, _, y_train_clf, y_test_clf = train_test_split(
        X, y_clf, test_size=0.20, random_state=RANDOM_SEED
    )

    # 3. Define Candidate Estimators for Regression
    reg_candidates = {
        "DummyRegressor": DummyRegressor(strategy="mean"),
        "LinearRegression": LinearRegression(),
        "RandomForestRegressor": RandomForestRegressor(n_estimators=100, random_state=RANDOM_SEED),
        "GradientBoostingRegressor": GradientBoostingRegressor(n_estimators=100, random_state=RANDOM_SEED)
    }
    if HAS_XGB:
        reg_candidates["XGBRegressor"] = XGBRegressor(n_estimators=100, learning_rate=0.08, max_depth=4, random_state=RANDOM_SEED)

    best_reg_name = None
    best_reg_mae = float("inf")
    best_reg_pipeline = None

    # K-Fold CV Benchmarking for Regression
    kf = KFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    
    print("\n--- Regression Model Benchmarking (Target: G3 Final Score) ---")
    for name, estimator in reg_candidates.items():
        preprocessor_pipe, _, _ = get_school_preprocessor(include_period_grades=True)
        pipeline = Pipeline(steps=[
            ("feature_engineer", preprocessor_pipe.named_steps["feature_engineer"]),
            ("preprocessor", preprocessor_pipe.named_steps["preprocessor"]),
            ("estimator", estimator)
        ])

        cv_maes, cv_rmses, cv_r2s = [], [], []

        for train_idx, val_idx in kf.split(X_train):
            X_tr, X_val = X_train.iloc[train_idx], X_train.iloc[val_idx]
            y_tr, y_val = y_train_reg[train_idx], y_train_reg[val_idx]

            pipeline.fit(X_tr, y_tr)
            preds = pipeline.predict(X_val)

            metrics = calculate_regression_metrics(y_val, preds)
            cv_maes.append(metrics["mae"])
            cv_rmses.append(metrics["rmse"])
            cv_r2s.append(metrics["r2"])

        avg_mae = float(np.mean(cv_maes))
        avg_rmse = float(np.mean(cv_rmses))
        avg_r2 = float(np.mean(cv_r2s))

        print(f"[{name}] CV MAE: {avg_mae:.4f} | CV RMSE: {avg_rmse:.4f} | CV R2: {avg_r2:.4f}")

        # Fit on full training split & evaluate on test split
        pipeline.fit(X_train, y_train_reg)
        test_preds = pipeline.predict(X_test)
        test_metrics = calculate_regression_metrics(y_test_reg, test_preds)

        log_experiment({
            "experiment_id": f"school_reg_{name.lower()}",
            "dataset": "school",
            "student_level": "school",
            "algorithm": name,
            "cv_mae": round(avg_mae, 4),
            "cv_rmse": round(avg_rmse, 4),
            "cv_r2": round(avg_r2, 4),
            "test_mae": test_metrics["mae"],
            "test_rmse": test_metrics["rmse"],
            "test_r2": test_metrics["r2"],
            "model_version": "school-performance-v1.0.0"
        })

        if avg_mae < best_reg_mae:
            best_reg_mae = avg_mae
            best_reg_name = name
            best_reg_pipeline = pipeline

    print(f"\n>>> Selected Best School Regression Model: {best_reg_name} (CV MAE: {best_reg_mae:.4f})")

    # 4. Save Final Pipeline Artifacts & Metadata
    os.makedirs(SCHOOL_MODEL_DIR, exist_ok=True)
    pipeline_path = SCHOOL_MODEL_DIR / "performance_pipeline.joblib"
    joblib.dump(best_reg_pipeline, pipeline_path)

    # Evaluate test performance for final metadata
    final_test_preds = best_reg_pipeline.predict(X_test)
    final_test_metrics = calculate_regression_metrics(y_test_reg, final_test_preds)

    metadata = {
        "model_version": "school-performance-v1.0.0",
        "dataset_name": "UCI Student Performance (Math & Por)",
        "row_count": len(df_school),
        "target": "G3",
        "algorithm": best_reg_name,
        "training_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "random_seed": RANDOM_SEED,
        "features": list(X.columns),
        "metrics": {
            "cv_mae": round(best_reg_mae, 4),
            "test_mae": final_test_metrics["mae"],
            "test_rmse": final_test_metrics["rmse"],
            "test_r2": final_test_metrics["r2"]
        }
    }

    metadata_path = SCHOOL_MODEL_DIR / "metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Saved School Model pipeline to {pipeline_path}")
    print(f"Saved School Model metadata to {metadata_path}")


if __name__ == "__main__":
    train_school_models()
