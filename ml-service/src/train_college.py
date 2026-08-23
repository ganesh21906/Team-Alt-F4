"""
College Model Training Script for EduPulse Subsystem.
Trains and benchmarks candidate multi-class classification models
(Dummy, LogisticRegression, RandomForest, GradientBoosting, XGBoost)
on the UCI Higher Education Students Performance Evaluation dataset.
Saves the best-performing reproducible pipeline and metadata.json artifact.
"""

import os
import json
from datetime import datetime
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

from sklearn.pipeline import Pipeline

from src.config import (
    COLLEGE_RAW_DIR, COLLEGE_MODEL_DIR, RANDOM_SEED,
    COLLEGE_HIGH_RISK_GRADES, COLLEGE_MEDIUM_RISK_GRADES, COLLEGE_LOW_RISK_GRADES
)
from src.data_validation import validate_college_dataframe
from src.preprocessing import get_college_preprocessor
from src.evaluate import calculate_classification_metrics, log_experiment


def get_college_risk_label(grade: int) -> str:
    if grade in COLLEGE_HIGH_RISK_GRADES:
        return "HIGH"
    elif grade in COLLEGE_MEDIUM_RISK_GRADES:
        return "MEDIUM"
    else:
        return "LOW"


def train_college_models():
    print("=== STARTING COLLEGE MODEL TRAINING & BENCHMARKING ===")

    # 1. Load Data
    path_college = COLLEGE_RAW_DIR / "higher_ed_students.csv"
    if not os.path.exists(path_college):
        raise FileNotFoundError(f"College dataset not found at {path_college}")

    df_college = pd.read_csv(path_college)
    if "Student ID" in df_college.columns:
        df_college = df_college.drop(columns=["Student ID"])

    is_valid, errors = validate_college_dataframe(df_college, is_training=True)
    if not is_valid:
        raise ValueError(f"College dataset validation failed: {errors}")

    print(f"College dataset loaded: {len(df_college)} records.")

    # 2. Separate Features & Target
    X = df_college.drop(columns=["OUTPUT Grade"])
    y = df_college["OUTPUT Grade"].values

    # Train / Test Split (80 / 20) with Stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_SEED, stratify=y
    )

    # 3. Define Candidate Estimators for Classification
    clf_candidates = {
        "DummyClassifier": DummyClassifier(strategy="prior"),
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=RANDOM_SEED),
        "RandomForestClassifier": RandomForestClassifier(n_estimators=100, max_depth=5, random_state=RANDOM_SEED),
        "GradientBoostingClassifier": GradientBoostingClassifier(n_estimators=100, learning_rate=0.05, max_depth=3, random_state=RANDOM_SEED)
    }
    if HAS_XGB:
        clf_candidates["XGBClassifier"] = XGBClassifier(
            n_estimators=100, learning_rate=0.05, max_depth=3,
            eval_metric="mlogloss", random_state=RANDOM_SEED
        )

    best_clf_name = None
    best_clf_f1 = -1.0
    best_clf_pipeline = None

    # Stratified K-Fold CV
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)

    print("\n--- Classification Model Benchmarking (Target: OUTPUT Grade 0-7) ---")
    for name, estimator in clf_candidates.items():
        preprocessor_pipe, _, _ = get_college_preprocessor()
        pipeline = Pipeline(steps=[
            ("feature_engineer", preprocessor_pipe.named_steps["feature_engineer"]),
            ("preprocessor", preprocessor_pipe.named_steps["preprocessor"]),
            ("estimator", estimator)
        ])

        cv_f1s, cv_accs = [], []

        for train_idx, val_idx in skf.split(X_train, y_train):
            X_tr, X_val = X_train.iloc[train_idx], X_train.iloc[val_idx]
            y_tr, y_val = y_train[train_idx], y_train[val_idx]

            pipeline.fit(X_tr, y_tr)
            preds = pipeline.predict(X_val)

            metrics = calculate_classification_metrics(y_val, preds)
            cv_f1s.append(metrics["f1"])
            cv_accs.append(metrics["accuracy"])

        avg_f1 = float(np.mean(cv_f1s))
        avg_acc = float(np.mean(cv_accs))

        print(f"[{name}] CV F1-Score: {avg_f1:.4f} | CV Accuracy: {avg_acc:.4f}")

        pipeline.fit(X_train, y_train)
        test_preds = pipeline.predict(X_test)
        test_metrics = calculate_classification_metrics(
            y_test, test_preds, high_risk_label=COLLEGE_HIGH_RISK_GRADES
        )

        log_experiment({
            "experiment_id": f"college_clf_{name.lower()}",
            "dataset": "higher_ed_students",
            "student_level": "college",
            "algorithm": name,
            "cv_f1": round(avg_f1, 4),
            "cv_accuracy": round(avg_acc, 4),
            "test_f1": test_metrics["f1"],
            "test_accuracy": test_metrics["accuracy"],
            "high_risk_recall": test_metrics["high_risk_recall"],
            "model_version": "college-performance-v1.0.0"
        })

        if avg_f1 > best_clf_f1:
            best_clf_f1 = avg_f1
            best_clf_name = name
            best_clf_pipeline = pipeline

    print(f"\n>>> Selected Best College Classification Model: {best_clf_name} (CV F1: {best_clf_f1:.4f})")

    # 4. Save Pipeline & Metadata
    os.makedirs(COLLEGE_MODEL_DIR, exist_ok=True)
    pipeline_path = COLLEGE_MODEL_DIR / "performance_pipeline.joblib"
    joblib.dump(best_clf_pipeline, pipeline_path)

    final_test_preds = best_clf_pipeline.predict(X_test)
    final_test_metrics = calculate_classification_metrics(
        y_test, final_test_preds, high_risk_label=COLLEGE_HIGH_RISK_GRADES
    )

    metadata = {
        "model_version": "college-performance-v1.0.0",
        "dataset_name": "UCI Higher Education Students Performance Evaluation",
        "row_count": len(df_college),
        "target": "OUTPUT Grade",
        "algorithm": best_clf_name,
        "training_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "random_seed": RANDOM_SEED,
        "features": list(X.columns),
        "metrics": {
            "cv_f1": round(best_clf_f1, 4),
            "test_accuracy": final_test_metrics["accuracy"],
            "test_f1": final_test_metrics["f1"],
            "high_risk_recall": final_test_metrics["high_risk_recall"]
        }
    }

    metadata_path = COLLEGE_MODEL_DIR / "metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Saved College Model pipeline to {pipeline_path}")
    print(f"Saved College Model metadata to {metadata_path}")


if __name__ == "__main__":
    train_college_models()
