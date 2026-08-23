"""
EduPulse ML Subsystem Configuration.
Contains global paths, random seeds, schema definitions, and model parameters.
"""

import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

SCHOOL_RAW_DIR = DATA_DIR / "raw" / "school"
COLLEGE_RAW_DIR = DATA_DIR / "raw" / "college"

SCHOOL_MODEL_DIR = MODELS_DIR / "school"
COLLEGE_MODEL_DIR = MODELS_DIR / "college"

EXPERIMENTS_CSV = REPORTS_DIR / "experiments.csv"

# Global Random State
RANDOM_SEED = 42

# School Risk Thresholds (0-20 scale for G3)
# HIGH Risk: G3 < 10 (Failing / Immediate intervention)
# MEDIUM Risk: 10 <= G3 < 14 (Pass low / Moderate risk)
# LOW Risk: G3 >= 14 (Good / Low risk)
SCHOOL_HIGH_RISK_THRESHOLD = 10.0
SCHOOL_MEDIUM_RISK_THRESHOLD = 14.0

# College Risk Grade Mapping (0-7 grade scale)
# 0: Fail, 1: DD -> HIGH RISK
# 2: DC, 3: CC -> MEDIUM RISK
# 4: CB, 5: BB, 6: BA, 7: AA -> LOW RISK
COLLEGE_HIGH_RISK_GRADES = [0, 1]
COLLEGE_MEDIUM_RISK_GRADES = [2, 3]
COLLEGE_LOW_RISK_GRADES = [4, 5, 6, 7]

# Features for School Models
SCHOOL_CATEGORICAL_FEATURES = [
    "school", "sex", "address", "famsize", "Pstatus", "Mjob", "Fjob", 
    "reason", "guardian", "schoolsup", "famsup", "paid", "activities", 
    "nursery", "higher", "internet", "romantic"
]

SCHOOL_NUMERICAL_FEATURES = [
    "age", "Medu", "Fedu", "traveltime", "studytime", "failures",
    "famrel", "freetime", "goout", "Dalc", "Walc", "health", "absences"
]

# Intermediate Grades (evaluated separately to prevent leakage)
SCHOOL_PERIOD_1_GRADE = "G1"
SCHOOL_PERIOD_2_GRADE = "G2"
SCHOOL_TARGET = "G3"

# Features for College Models
COLLEGE_CATEGORICAL_FEATURES = [
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

COLLEGE_NUMERICAL_FEATURES = [
    "Student Age"
]

COLLEGE_TARGET = "OUTPUT Grade"
