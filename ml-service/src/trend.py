"""
Trend Calculation Engine for EduPulse ML Subsystem.
Calculates performance trend trajectory (IMPROVING, STABLE, DECLINING).
"""

from typing import List, Optional, Dict, Any
import numpy as np


def calculate_academic_trend(
    scores: List[float],
    threshold_slope: float = 0.5
) -> Dict[str, Any]:
    """
    Calculates trend trajectory based on sequential academic assessment scores.
    
    Returns:
    - trend: "IMPROVING" | "STABLE" | "DECLINING"
    - slope: float
    - recent_vs_historical_diff: float
    """
    if not scores or len(scores) < 2:
        return {
            "trend": "STABLE",
            "slope": 0.0,
            "recent_vs_historical_diff": 0.0,
            "details": "Insufficient score history for trend estimation"
        }

    x = np.arange(len(scores))
    y = np.array(scores, dtype=float)

    # Linear slope
    slope, _ = np.polyfit(x, y, 1)

    # Recent vs Historical difference
    recent_score = y[-1]
    historical_avg = np.mean(y[:-1])
    diff = recent_score - historical_avg

    if slope > threshold_slope or diff > 1.0:
        trend = "IMPROVING"
    elif slope < -threshold_slope or diff < -1.0:
        trend = "DECLINING"
    else:
        trend = "STABLE"

    return {
        "trend": trend,
        "slope": round(float(slope), 2),
        "recent_vs_historical_diff": round(float(diff), 2),
        "assessment_count": len(scores)
    }
