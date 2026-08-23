"""
Evaluation and Experiment Tracking module for EduPulse ML Subsystem.
Calculates metrics and logs experiment records into reports/experiments.csv.
"""

import os
from datetime import datetime
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
)

from src.config import EXPERIMENTS_CSV


def calculate_regression_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Calculates MAE, RMSE, and R2 for regression models."""
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    return {
        "mae": round(float(mae), 4),
        "rmse": round(float(rmse), 4),
        "r2": round(float(r2), 4)
    }


def calculate_classification_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: Optional[np.ndarray] = None,
    high_risk_label: Optional[Any] = None
) -> Dict[str, float]:
    """Calculates Accuracy, Precision, Recall, F1, and High-Risk Recall for classification models."""
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_true, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)

    high_risk_rec = 0.0
    if high_risk_label is not None:
        if isinstance(high_risk_label, (list, tuple, np.ndarray)):
            mask_true = np.isin(y_true, high_risk_label)
            mask_pred = np.isin(y_pred, high_risk_label)
        else:
            mask_true = (y_true == high_risk_label)
            mask_pred = (y_pred == high_risk_label)
            
        if np.sum(mask_true) > 0:
            high_risk_rec = float(np.sum(mask_true & mask_pred) / np.sum(mask_true))

    metrics = {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1": round(float(f1), 4),
        "high_risk_recall": round(float(high_risk_rec), 4)
    }

    if y_prob is not None:
        try:
            if y_prob.ndim == 2 and y_prob.shape[1] > 2:
                auc = roc_auc_score(y_true, y_prob, multi_class="ovr", average="weighted")
            else:
                prob_col = y_prob[:, 1] if y_prob.ndim == 2 else y_prob
                auc = roc_auc_score(y_true, prob_col)
            metrics["roc_auc"] = round(float(auc), 4)
        except Exception:
            metrics["roc_auc"] = None

    return metrics


def log_experiment(experiment_data: Dict[str, Any]) -> None:
    """Logs an experiment run into reports/experiments.csv."""
    os.makedirs(EXPERIMENTS_CSV.parent, exist_ok=True)
    
    experiment_data["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    df_new = pd.DataFrame([experiment_data])

    if os.path.exists(EXPERIMENTS_CSV):
        df_existing = pd.read_csv(EXPERIMENTS_CSV)
        df_combined = pd.concat([df_existing, df_new], ignore_index=True)
    else:
        df_combined = df_new

    df_combined.to_csv(EXPERIMENTS_CSV, index=False)
    print(f"Logged experiment {experiment_data.get('experiment_id')} to {EXPERIMENTS_CSV}")
