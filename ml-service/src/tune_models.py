"""
Hyperparameter Fine-Tuning Script for EduPulse Subsystem.
Uses RandomizedSearchCV to explore optimal hyperparameter spaces for
School (GradientBoostingRegressor / XGBRegressor) and
College (XGBClassifier / RandomForestClassifier) models.
"""

import os
import json
from datetime import datetime
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import KFold, StratifiedKFold, RandomizedSearchCV, train_test_split
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
from xgboost import XGBRegressor, XGBClassifier
from sklearn.pipeline import Pipeline

from src.config import (
    SCHOOL_RAW_DIR, COLLEGE_RAW_DIR, SCHOOL_MODEL_DIR, COLLEGE_MODEL_DIR,
    RANDOM_SEED, COLLEGE_HIGH_RISK_GRADES
)
from src.preprocessing import get_school_preprocessor, get_college_preprocessor
from src.evaluate import calculate_regression_metrics, calculate_classification_metrics, log_experiment


def tune_school_model(n_iter: int = 15):
    """Performs RandomizedSearchCV for School Regression Model."""
    print("\n==========================================")
    print("      FINE-TUNING SCHOOL MODEL            ")
    print("==========================================")

    # 1. Load data
    dfs = []
    for f in ["student-mat.csv", "student-por.csv"]:
        p = SCHOOL_RAW_DIR / f
        if os.path.exists(p):
            dfs.append(pd.read_csv(p, sep=";"))
    df_school = pd.concat(dfs, ignore_index=True)

    X = df_school.drop(columns=["G3"])
    y = df_school["G3"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_SEED
    )

    # Preprocessor
    preprocessor_pipe, _, _ = get_school_preprocessor(include_period_grades=True)

    pipeline = Pipeline(steps=[
        ("feature_engineer", preprocessor_pipe.named_steps["feature_engineer"]),
        ("preprocessor", preprocessor_pipe.named_steps["preprocessor"]),
        ("estimator", GradientBoostingRegressor(random_state=RANDOM_SEED))
    ])

    # Search Space
    param_distributions = {
        "estimator__n_estimators": [80, 100, 150, 200],
        "estimator__learning_rate": [0.03, 0.05, 0.08, 0.1],
        "estimator__max_depth": [3, 4, 5],
        "estimator__min_samples_split": [2, 5, 10],
        "estimator__subsample": [0.7, 0.85, 1.0]
    }

    kf = KFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)

    search = RandomizedSearchCV(
        pipeline,
        param_distributions=param_distributions,
        n_iter=n_iter,
        scoring="neg_mean_absolute_error",
        cv=kf,
        random_state=RANDOM_SEED,
        n_jobs=1
    )

    print(f"Running RandomizedSearchCV across {n_iter} candidate parameter combinations...")
    search.fit(X_train, y_train)

    best_pipeline = search.best_estimator_
    best_cv_mae = -search.best_score_
    best_params = search.best_params_

    print(f"\n>>> Best CV MAE: {best_cv_mae:.4f}")
    print(f">>> Best Hyperparameters: {json.dumps(best_params, indent=2)}")

    # Evaluate on test set
    test_preds = best_pipeline.predict(X_test)
    test_metrics = calculate_regression_metrics(y_test, test_preds)
    print(f">>> Test Split Performance — MAE: {test_metrics['mae']}, RMSE: {test_metrics['rmse']}, R2: {test_metrics['r2']}")

    # Save tuned pipeline
    os.makedirs(SCHOOL_MODEL_DIR, exist_ok=True)
    pipe_path = SCHOOL_MODEL_DIR / "performance_pipeline.joblib"
    joblib.dump(best_pipeline, pipe_path)

    log_experiment({
        "experiment_id": f"school_tuned_gb_{datetime.now().strftime('%H%M%S')}",
        "dataset": "school",
        "student_level": "school",
        "algorithm": "GradientBoostingRegressor (Tuned)",
        "cv_mae": round(best_cv_mae, 4),
        "test_mae": test_metrics["mae"],
        "test_rmse": test_metrics["rmse"],
        "test_r2": test_metrics["r2"],
        "notes": f"Tuned via RandomizedSearchCV (n_iter={n_iter})"
    })

    print(f"Successfully saved fine-tuned School pipeline to {pipe_path}")


def tune_college_model(n_iter: int = 15):
    """Performs RandomizedSearchCV for College Classification Model."""
    print("\n==========================================")
    print("      FINE-TUNING COLLEGE MODEL           ")
    print("==========================================")

    p = COLLEGE_RAW_DIR / "higher_ed_students.csv"
    if not os.path.exists(p):
        print("College dataset not found.")
        return

    df_college = pd.read_csv(p)
    if "Student ID" in df_college.columns:
        df_college = df_college.drop(columns=["Student ID"])

    X = df_college.drop(columns=["OUTPUT Grade"])
    y = df_college["OUTPUT Grade"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_SEED, stratify=y
    )

    preprocessor_pipe, _, _ = get_college_preprocessor()

    pipeline = Pipeline(steps=[
        ("feature_engineer", preprocessor_pipe.named_steps["feature_engineer"]),
        ("preprocessor", preprocessor_pipe.named_steps["preprocessor"]),
        ("estimator", XGBClassifier(eval_metric="mlogloss", random_state=RANDOM_SEED))
    ])

    param_distributions = {
        "estimator__n_estimators": [50, 80, 120],
        "estimator__learning_rate": [0.01, 0.03, 0.05, 0.1],
        "estimator__max_depth": [2, 3, 4],
        "estimator__subsample": [0.7, 0.85, 1.0],
        "estimator__colsample_bytree": [0.6, 0.8, 1.0],
        "estimator__reg_alpha": [0.0, 0.1, 0.5],
        "estimator__reg_lambda": [0.5, 1.0, 2.0]
    }

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)

    search = RandomizedSearchCV(
        pipeline,
        param_distributions=param_distributions,
        n_iter=n_iter,
        scoring="f1_weighted",
        cv=skf,
        random_state=RANDOM_SEED,
        n_jobs=1
    )

    print(f"Running RandomizedSearchCV across {n_iter} candidate parameter combinations...")
    search.fit(X_train, y_train)

    best_pipeline = search.best_estimator_
    best_cv_f1 = search.best_score_
    best_params = search.best_params_

    print(f"\n>>> Best CV Weighted F1: {best_cv_f1:.4f}")
    print(f">>> Best Hyperparameters: {json.dumps(best_params, indent=2)}")

    test_preds = best_pipeline.predict(X_test)
    test_metrics = calculate_classification_metrics(y_test, test_preds, high_risk_label=COLLEGE_HIGH_RISK_GRADES)
    print(f">>> Test Split Performance — F1: {test_metrics['f1']}, Accuracy: {test_metrics['accuracy']}, High Risk Recall: {test_metrics['high_risk_recall']}")

    os.makedirs(COLLEGE_MODEL_DIR, exist_ok=True)
    pipe_path = COLLEGE_MODEL_DIR / "performance_pipeline.joblib"
    joblib.dump(best_pipeline, pipe_path)

    log_experiment({
        "experiment_id": f"college_tuned_xgb_{datetime.now().strftime('%H%M%S')}",
        "dataset": "college",
        "student_level": "college",
        "algorithm": "XGBClassifier (Tuned)",
        "cv_f1": round(best_cv_f1, 4),
        "test_f1": test_metrics["f1"],
        "test_accuracy": test_metrics["accuracy"],
        "high_risk_recall": test_metrics["high_risk_recall"],
        "notes": f"Tuned via RandomizedSearchCV (n_iter={n_iter})"
    })

    print(f"Successfully saved fine-tuned College pipeline to {pipe_path}")


if __name__ == "__main__":
    tune_school_model(n_iter=15)
    tune_college_model(n_iter=15)
