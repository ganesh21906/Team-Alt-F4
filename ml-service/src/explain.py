"""
SHAP Explainability module for EduPulse ML Subsystem.
Calculates global and local feature importance and impact values.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np
import shap


class ModelExplainer:
    """
    SHAP Explainer wrapper for trained Scikit-Learn / XGBoost pipelines.
    Extracts preprocessed feature names and returns top contributing factors.
    """

    def __init__(self, model_pipeline, feature_names: List[str]):
        self.pipeline = model_pipeline
        self.preprocessor = model_pipeline.named_steps.get("preprocessor")
        self.estimator = model_pipeline.named_steps.get("estimator")
        self.raw_feature_names = feature_names

        # Build explainer
        self.explainer = None
        self._initialize_explainer()

    def _get_transformed_feature_names(self, sample_df: pd.DataFrame) -> List[str]:
        """Gets transformed feature names from ColumnTransformer."""
        if hasattr(self.preprocessor, "get_feature_names_out"):
            try:
                return list(self.preprocessor.get_feature_names_out())
            except Exception:
                pass
        return [f"feature_{i}" for i in range(100)]

    def _initialize_explainer(self):
        """Initializes TreeExplainer or KernelExplainer based on estimator type."""
        try:
            self.explainer = shap.TreeExplainer(self.estimator)
        except Exception:
            try:
                self.explainer = shap.Explainer(self.estimator)
            except Exception:
                self.explainer = None

    def explain_instance(self, sample_df: pd.DataFrame, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Generates local explanation for a single student profile.
        Returns top_k factors with magnitude, direction, and original raw values.
        """
        # Step 1: Feature engineer & preprocess input
        feat_engineer = self.pipeline.named_steps.get("feature_engineer")
        df_engineered = feat_engineer.transform(sample_df) if feat_engineer else sample_df
        X_trans = self.preprocessor.transform(df_engineered)

        transformed_cols = self._get_transformed_feature_names(sample_df)

        # Step 2: Compute SHAP values
        if self.explainer is None:
            # Fallback to feature importance if SHAP explainer fails
            return self._fallback_explanation(df_engineered, top_k)

        try:
            shap_values = self.explainer.shap_values(X_trans)
            
            if isinstance(shap_values, list):
                # Multi-class classification: take highest probability class or first class
                shap_vals_single = shap_values[0][0] if len(shap_values[0].shape) > 1 else shap_values[0]
            elif len(shap_values.shape) == 3:
                shap_vals_single = shap_values[0, :, 0]
            elif len(shap_values.shape) == 2:
                shap_vals_single = shap_values[0]
            else:
                shap_vals_single = shap_values

            # Map transformed SHAP values back to human-readable features
            factor_impacts = []
            for i, col_name in enumerate(transformed_cols[:len(shap_vals_single)]):
                impact = float(shap_vals_single[i])
                clean_name = col_name.split("__")[-1] if "__" in col_name else col_name
                
                # Get raw value if available
                raw_val = sample_df[clean_name].values[0] if clean_name in sample_df.columns else None
                if raw_val is not None and isinstance(raw_val, (np.integer, np.floating)):
                    raw_val = round(float(raw_val), 2)
                elif raw_val is not None:
                    raw_val = str(raw_val)

                factor_impacts.append({
                    "feature": clean_name,
                    "value": raw_val,
                    "impact": round(impact, 4),
                    "direction": "positive" if impact > 0 else "negative",
                    "abs_impact": abs(impact)
                })

            # Sort by absolute impact descending
            factor_impacts.sort(key=lambda x: x["abs_impact"], reverse=True)
            
            # Format output without internal sorting key
            result = []
            for item in factor_impacts[:top_k]:
                result.append({
                    "feature": item["feature"],
                    "value": item["value"],
                    "impact": item["impact"],
                    "direction": item["direction"]
                })

            return result

        except Exception as e:
            print(f"SHAP local explanation error: {e}")
            return self._fallback_explanation(df_engineered, top_k)

    def _fallback_explanation(self, sample_df: pd.DataFrame, top_k: int) -> List[Dict[str, Any]]:
        """Fallback feature importance calculation if SHAP fails."""
        if hasattr(self.estimator, "feature_importances_"):
            importances = self.estimator.feature_importances_
            transformed_cols = self._get_transformed_feature_names(sample_df)
            items = []
            for i in range(min(len(importances), len(transformed_cols))):
                col = transformed_cols[i].split("__")[-1]
                val = sample_df[col].values[0] if col in sample_df.columns else None
                items.append({
                    "feature": col,
                    "value": val,
                    "impact": round(float(importances[i]), 4),
                    "direction": "positive"
                })
            items.sort(key=lambda x: x["impact"], reverse=True)
            return items[:top_k]
        return []
