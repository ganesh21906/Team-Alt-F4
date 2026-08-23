import os
import json
import random
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

from src.config import SCHOOL_RAW_DIR, COLLEGE_RAW_DIR
from src.predict import get_inference_engine

# Seed for deterministic generation
random.seed(42)
np.random.seed(42)

FEMALE_NAMES = ["Aanya", "Meera", "Priya", "Sneha", "Divya", "Anjali", "Riya", "Neha", "Isha", "Aditi", "Tanvi", "Kavya", "Deepika", "Kriti", "Shreya"]
MALE_NAMES = ["Kabir", "Rohan", "Amit", "Vikram", "Arjun", "Aditya", "Yash", "Kunal", "Rahul", "Sanjay", "Deepak", "Gaurav", "Manish", "Rithvik", "Pranav"]
SURNAMES = ["Sharma", "Iyer", "Patel", "Singh", "Nair", "Reddy", "Verma", "Rao", "Joshi", "Gupta", "Mehta", "Kumar", "Choudhury", "Pillai", "Das"]

AVATARS_FEMALE = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80"
]

AVATARS_MALE = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"
]

def generate_profile_meta(index: int, sex: str) -> Dict[str, str]:
    """Generates deterministic name, email, and avatar based on gender and row index."""
    sex_is_female = sex.upper() in ["F", "1"]
    
    # Deterministic choices via index modulo
    first_name_list = FEMALE_NAMES if sex_is_female else MALE_NAMES
    avatar_list = AVATARS_FEMALE if sex_is_female else AVATARS_MALE
    
    first_name = first_name_list[index % len(first_name_list)]
    last_name = SURNAMES[(index * 3 + 7) % len(SURNAMES)]
    name = f"{first_name} {last_name}"
    
    email = f"{first_name.lower()}.{last_name.lower()}{index % 100}@edupulse.ai"
    avatar = avatar_list[index % len(avatar_list)]
    
    return {
        "name": name,
        "email": email,
        "avatarUrl": avatar
    }


class StudentDatabase:
    """Manages parsing of school & college data, mapping to standard frontend schemas."""
    
    def __init__(self):
        self.students: Dict[str, Dict[str, Any]] = {}
        self.initialized = False
        self.db_path = Path(__file__).resolve().parent / "db.json"
        self.persistent_data = {
            "tasks": {},
            "interventions": {},
            "thresholds": {
                "school_high": 10.0,
                "school_medium": 14.0,
                "college_high": 60.0,
                "college_medium": 80.0
            }
        }

    def load_persistent_store(self):
        try:
            if self.db_path.exists():
                with open(self.db_path, "r") as f:
                    self.persistent_data = json.load(f)
            else:
                self.save_persistent_store()
        except Exception as e:
            print(f"Error loading persistent database: {e}")

    def save_persistent_store(self):
        try:
            with open(self.db_path, "w") as f:
                json.dump(self.persistent_data, f, indent=2)
        except Exception as e:
            print(f"Error saving persistent database: {e}")

    def initialize(self):
        if self.initialized:
            return
            
        print("Loading student datasets and pre-generating ML evaluations...")
        self.load_persistent_store()
        engine = get_inference_engine()
        
        # 1. Parse School Dataset (combine Math and Portuguese)
        path_mat = SCHOOL_RAW_DIR / "student-mat.csv"
        path_por = SCHOOL_RAW_DIR / "student-por.csv"
        
        school_records = []
        if os.path.exists(path_mat):
            df_mat = pd.read_csv(path_mat, sep=";")
            df_mat["course_subject"] = "Math"
            school_records.append(df_mat)
        if os.path.exists(path_por):
            df_por = pd.read_csv(path_por, sep=";")
            df_por["course_subject"] = "Portuguese"
            school_records.append(df_por)
            
        if school_records:
            df_school = pd.concat(school_records, ignore_index=True)
            for idx, row in df_school.iterrows():
                # Convert row to dictionary
                raw_payload = row.to_dict()
                student_id = f"ST-SCH-{idx:04d}"
                
                # Exclude G3 from inference inputs
                inference_payload = raw_payload.copy()
                if "G3" in inference_payload:
                    del inference_payload["G3"]
                
                # Fetch ML Prediction
                try:
                    pred_res = engine.predict(inference_payload, "school")
                except Exception as e:
                    print(f"Error predicting school student {student_id}: {e}")
                    continue
                
                # Extract meta
                meta = generate_profile_meta(idx, str(raw_payload["sex"]))
                
                # GPA is G3 / 2 (since G3 is 0-20 scale)
                g3_score = float(raw_payload["G3"])
                gpa = round(g3_score / 2.0, 2)
                
                # Attendance: absences mapped to percentage.
                # max absences in dataset is around 93. Map typical range to 40%-100-max
                absences = int(raw_payload["absences"])
                attendance = max(40, round(100 - (absences / 30.0) * 40))
                
                # Map subjects: split grades into logical subjects
                subjects = [
                    {"subject": "Mathematics", "currentScore": int(row["G1"] * 5) if raw_payload["course_subject"] == "Math" else int(max(40, row["G1"] * 4.2)), "trend": "up" if row["G2"] >= row["G1"] else "down"},
                    {"subject": "Physics", "currentScore": int(row["G2"] * 5) if raw_payload["course_subject"] == "Math" else int(max(45, row["G2"] * 4.4)), "trend": "flat"},
                    {"subject": "Chemistry", "currentScore": int(max(30, (row["G1"]+row["G2"])/2 * 4.8)), "trend": "up" if row["G2"] >= row["G1"] else "down"},
                    {"subject": "English", "currentScore": int(max(40, row["G2"] * 4.5)) if raw_payload["course_subject"] == "Portuguese" else 75, "trend": "up"},
                    {"subject": "Biology", "currentScore": int(max(35, row["G3"] * 4.6)), "trend": "flat"}
                ]
                
                # Risk Score computed from ML probabilities
                probs = pred_res["risk_probabilities"]
                risk_score = int(round((probs["MEDIUM"] * 50) + (probs["HIGH"] * 100)))
                
                # Weekly trend
                g1_pct = int(row["G1"] * 5)
                g2_pct = int(row["G2"] * 5)
                g3_pred_pct = int(pred_res["predicted_score"] * 5)
                weekly_trend = [
                    {"week": "W1", "score": max(30, g1_pct - 6)},
                    {"week": "W2", "score": max(30, g1_pct - 2)},
                    {"week": "W3", "score": g1_pct},
                    {"week": "W4", "score": max(30, int((g1_pct + g2_pct)/2))},
                    {"week": "W5", "score": g2_pct},
                    {"week": "W6", "score": max(30, int((g2_pct + g3_pred_pct)/2))},
                    {"week": "W7", "score": g3_pred_pct}
                ]
                
                # Map SHAP factors to riskFactors
                risk_factors = []
                for factor in pred_res["top_factors"]:
                    risk_factors.append({
                        "id": f"f-{factor['feature']}",
                        "label": factor["feature_display_name"],
                        "impact": "positive" if factor["direction"] == "positive" else "negative",
                        "magnitude": int(min(100, abs(factor["impact"]) * 25)),
                        "detail": factor["description"]
                    })
                
                # Recommendations
                recommendations = []
                for id_r, text in enumerate(pred_res["recommended_interventions"]):
                    recommendations.append({
                        "id": f"rec-{student_id}-{id_r}",
                        "title": "AI Target Intervention" if id_r == 0 else "Recommended Support",
                        "priority": "high" if id_r == 0 else "medium",
                        "text": text,
                        "action": "Complete tasks detailed in recommendation"
                    })
                    
                student_profile = {
                    "id": student_id,
                    "name": meta["name"],
                    "className": f"Class {10 + (idx % 3)}-{chr(65 + (idx % 3))}",
                    "email": meta["email"],
                    "studentLevel": "school",
                    "avatarUrl": meta["avatarUrl"],
                    "gpa": gpa,
                    "attendancePct": attendance,
                    "riskLevel": pred_res["risk_level"].lower(),
                    "riskScore": risk_score,
                    "performanceScore": g3_pred_pct,
                    "subjects": subjects,
                    "weeklyTrend": weekly_trend,
                    "upcomingExams": [
                        {"subject": "Mathematics" if idx % 2 == 0 else "English", "date": "2026-08-30"},
                        {"subject": "Physics" if idx % 2 == 0 else "Biology", "date": "2026-09-04"}
                    ],
                    "recommendations": recommendations,
                    "riskFactors": risk_factors,
                    "prediction": {
                        "studentId": student_id,
                        "predictedScore": pred_res["predicted_score"],
                        "riskLevel": pred_res["risk_level"].lower(),
                        "confidence": round(float(probs["HIGH" if pred_res["risk_level"] == "HIGH" else "LOW"]), 2),
                        "summary": f"Predicted score is {pred_res['formatted_score']} with {pred_res['risk_level']} academic risk.",
                        "generatedAt": "2026-08-23T09:00:00Z",
                        "riskFactors": risk_factors
                    },
                    "raw_features": raw_payload # save raw payload for What-If
                }
                
                self.students[student_id] = student_profile

        # 2. Parse College Dataset
        path_college = COLLEGE_RAW_DIR / "higher_ed_students.csv"
        if os.path.exists(path_college):
            df_college = pd.read_csv(path_college)
            for idx, row in df_college.iterrows():
                raw_payload = row.to_dict()
                
                # Exclude Student ID and OUTPUT Grade from input payload
                student_id_val = raw_payload.get("Student ID", f"STUDENT{idx+1}")
                student_id = f"ST-COL-{idx:04d}"
                
                inference_payload = raw_payload.copy()
                if "Student ID" in inference_payload:
                    del inference_payload["Student ID"]
                if "OUTPUT Grade" in inference_payload:
                    del inference_payload["OUTPUT Grade"]
                    
                # Fetch ML Prediction
                try:
                    pred_res = engine.predict(inference_payload, "college")
                except Exception as e:
                    print(f"Error predicting college student {student_id}: {e}")
                    continue
                    
                # Extract meta (Sex is column name, 1=female, 2=male in college dataset)
                sex_str = "F" if int(raw_payload.get("Sex", 1)) == 1 else "M"
                meta = generate_profile_meta(idx, sex_str)
                
                # GPA Category 1 to 5 maps to:
                # 1: <2.00, 2: 2.00-2.49, 3: 2.50-2.99, 4: 3.00-3.49, 5: 3.50-4.00
                gpa_cat = int(raw_payload.get("Cumulative grade point average in the last semester (/4.00)", 3))
                gpa_ranges = {1: 1.8, 2: 2.25, 3: 2.75, 4: 3.25, 5: 3.75}
                gpa = gpa_ranges.get(gpa_cat, 2.5)
                
                # Attendance Classes: 1: always, 2: sometimes, 3: never
                attend_code = int(raw_payload.get("Attendance to classes", 1))
                attendance = 95 if attend_code == 1 else 75 if attend_code == 2 else 45
                
                # Midterm Prep (1: regular, 2: sometimes, 3: never)
                prep1 = int(raw_payload.get("Preparation to midterm exams 1", 1))
                prep2 = int(raw_payload.get("Preparation to midterm exams 2", 1))
                cs_score = 90 if prep1 == 1 else 70 if prep1 == 2 else 45
                ds_score = 92 if prep2 == 1 else 72 if prep2 == 2 else 48
                
                subjects = [
                    {"subject": "Computer Science I", "currentScore": cs_score, "trend": "up" if prep2 <= prep1 else "down"},
                    {"subject": "Data Structures & Alg", "currentScore": ds_score, "trend": "up"},
                    {"subject": "Discrete Mathematics", "currentScore": int(gpa * 23 + 5), "trend": "flat"},
                    {"subject": "Software Engineering", "currentScore": 82 if attend_code == 1 else 68, "trend": "up"},
                    {"subject": "Advanced Database Systems", "currentScore": int(max(40, gpa * 22)), "trend": "flat"}
                ]
                
                probs = pred_res["risk_probabilities"]
                risk_score = int(round((probs["MEDIUM"] * 50) + (probs["HIGH"] * 100)))
                
                perf_score = int(pred_res["predicted_score"])
                weekly_trend = [
                    {"week": "W1", "score": max(40, perf_score - 8)},
                    {"week": "W2", "score": max(40, perf_score - 4)},
                    {"week": "W3", "score": max(40, perf_score - 5)},
                    {"week": "W4", "score": max(40, perf_score - 2)},
                    {"week": "W5", "score": perf_score},
                    {"week": "W6", "score": min(100, perf_score + 1)},
                    {"week": "W7", "score": perf_score}
                ]
                
                # Map SHAP factors to riskFactors
                risk_factors = []
                for factor in pred_res["top_factors"]:
                    risk_factors.append({
                        "id": f"f-{factor['feature']}",
                        "label": factor["feature_display_name"],
                        "impact": "positive" if factor["direction"] == "positive" else "negative",
                        "magnitude": int(min(100, abs(factor["impact"]) * 20)),
                        "detail": factor["description"]
                    })
                
                recommendations = []
                for id_r, text in enumerate(pred_res["recommended_interventions"]):
                    recommendations.append({
                        "id": f"rec-{student_id}-{id_r}",
                        "title": "Academic Advising Support" if id_r == 0 else "Engagement Suggestion",
                        "priority": "high" if id_r == 0 else "medium",
                        "text": text,
                        "action": "Complete tasks detailed in recommendation"
                    })
                
                course_id = int(raw_payload.get("Course ID", 1))
                dept_name = {1: "Computer Engineering", 2: "Electrical Engineering", 3: "Mechanical Engineering", 4: "Business Administration"}.get(course_id, "Computer Science Department")
                
                student_profile = {
                    "id": student_id,
                    "name": meta["name"],
                    "className": dept_name,
                    "email": meta["email"],
                    "studentLevel": "college",
                    "avatarUrl": meta["avatarUrl"],
                    "gpa": gpa,
                    "attendancePct": attendance,
                    "riskLevel": pred_res["risk_level"].lower(),
                    "riskScore": risk_score,
                    "performanceScore": perf_score,
                    "subjects": subjects,
                    "weeklyTrend": weekly_trend,
                    "upcomingExams": [
                        {"subject": "Data Structures & Alg", "date": "2026-08-31"},
                        {"subject": "Software Engineering", "date": "2026-09-03"}
                    ],
                    "recommendations": recommendations,
                    "riskFactors": risk_factors,
                    "prediction": {
                        "studentId": student_id,
                        "predictedScore": pred_res["predicted_score"],
                        "riskLevel": pred_res["risk_level"].lower(),
                        "confidence": round(float(probs["HIGH" if pred_res["risk_level"] == "HIGH" else "LOW"]), 2),
                        "summary": f"Predicted GPA range score is {pred_res['formatted_score']} with {pred_res['risk_level']} academic risk.",
                        "generatedAt": "2026-08-23T09:00:00Z",
                        "riskFactors": risk_factors
                    },
                    "raw_features": raw_payload
                }
                
                self.students[student_id] = student_profile
                
        self.recalculate_risk_levels()
        self.initialized = True
        print(f"Pre-loaded {len(self.students)} student profiles successfully.")

    def get_all(self, level: Optional[str] = None, risk_level: Optional[str] = None, query: Optional[str] = None) -> List[Dict[str, Any]]:
        self.initialize()
        res = list(self.students.values())
        
        if level:
            res = [s for s in res if s["studentLevel"] == level.lower()]
        if risk_level:
            res = [s for s in res if s["riskLevel"] == risk_level.lower()]
        if query:
            q = query.lower()
            res = [s for s in res if q in s["name"].lower() or q in s["email"].lower() or q in s["id"].lower()]
            
        return res

    def get_by_id(self, student_id: str) -> Optional[Dict[str, Any]]:
        self.initialize()
        profile = self.students.get(student_id)
        if not profile:
            return None
            
        # Copy to avoid side-effects in root dict
        profile_copy = profile.copy()
        
        # 1. Fetch tasks
        tasks = self.persistent_data.setdefault("tasks", {}).setdefault(student_id, [])
        if not tasks:
            # Auto-populate tasks from recommendations on first fetch
            for idx, rec in enumerate(profile.get("recommendations", [])):
                tasks.append({
                    "id": f"task-{student_id}-{idx}",
                    "text": rec["text"],
                    "status": "todo",
                    "date": datetime.now().strftime("%Y-%m-%d")
                })
            self.persistent_data["tasks"][student_id] = tasks
            self.save_persistent_store()
            
        profile_copy["tasks"] = tasks
        
        # 2. Fetch interventions
        interventions = self.persistent_data.setdefault("interventions", {}).setdefault(student_id, [])
        profile_copy["interventions"] = interventions
        
        return profile_copy

    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        self.initialize()
        for s in self.students.values():
            if s["email"].lower() == email.lower():
                return self.get_by_id(s["id"])
        return None

    def add_task(self, student_id: str, text: str) -> Dict[str, Any]:
        self.initialize()
        tasks = self.persistent_data.setdefault("tasks", {}).setdefault(student_id, [])
        new_task = {
            "id": f"task-{student_id}-{len(tasks) + random.randint(100, 999)}",
            "text": text,
            "status": "todo",
            "date": datetime.now().strftime("%Y-%m-%d")
        }
        tasks.append(new_task)
        self.save_persistent_store()
        return new_task

    def toggle_task(self, student_id: str, task_id: str, status: str) -> Optional[Dict[str, Any]]:
        self.initialize()
        tasks = self.persistent_data.setdefault("tasks", {}).setdefault(student_id, [])
        target_task = None
        for t in tasks:
            if t["id"] == task_id:
                t["status"] = status
                target_task = t
                break
        
        if not target_task:
            return None
            
        self.save_persistent_store()
        
        # Dynamic Risk Mitigation Trigger: complete task -> improve features -> recalculate score
        if status == "completed" and student_id in self.students:
            profile = self.students[student_id]
            raw = profile["raw_features"]
            level = profile["studentLevel"]
            
            # Positively shift baseline parameters
            if level == "school":
                if raw.get("absences", 0) > 0:
                    raw["absences"] = max(0, raw["absences"] - 2)
                raw["studytime"] = min(4, raw.get("studytime", 1) + 1)
            else:
                raw["Weekly study hours"] = min(30, raw.get("Weekly study hours", 5) + 3)
                raw["Attendance to classes"] = min(1, raw.get("Attendance to classes", 0) + 1)
                
            try:
                engine = get_inference_engine()
                pred_res = engine.predict(raw, level)
                # Update baseline predicted score & gpa
                profile["prediction"]["predictedScore"] = pred_res["predicted_score"]
                profile["performanceScore"] = int(pred_res["predicted_score"] * 5) if level == "school" else pred_res["predicted_score"]
                
                if level == "school":
                    profile["gpa"] = round(pred_res["predicted_score"] / 2.0, 2)
                    profile["attendancePct"] = max(40, round(100 - (raw["absences"] / 30.0) * 40))
                else:
                    profile["gpa"] = round(pred_res["predicted_score"] / 25.0, 2)
                    profile["attendancePct"] = int(raw["Weekly study hours"] * 3.3)
                    
                self.recalculate_risk_levels()
            except Exception as e:
                print(f"Error executing auto prediction on task checkoff: {e}")
                
        return target_task

    def add_intervention(self, student_id: str, title: str, priority: str, text: str, action: str) -> Dict[str, Any]:
        self.initialize()
        interventions = self.persistent_data.setdefault("interventions", {}).setdefault(student_id, [])
        new_int = {
            "id": f"int-{student_id}-{len(interventions) + random.randint(100, 999)}",
            "title": title,
            "priority": priority,
            "text": text,
            "action": action,
            "date": datetime.now().strftime("%Y-%m-%d")
        }
        interventions.append(new_int)
        self.save_persistent_store()
        return new_int

    def get_thresholds(self) -> Dict[str, float]:
        return self.persistent_data.setdefault("thresholds", {
            "school_high": 10.0,
            "school_medium": 14.0,
            "college_high": 60.0,
            "college_medium": 80.0
        })

    def update_thresholds(self, school_high: float, school_medium: float, college_high: float, college_medium: float) -> Dict[str, float]:
        self.initialize()
        t = {
            "school_high": school_high,
            "school_medium": school_medium,
            "college_high": college_high,
            "college_medium": college_medium
        }
        self.persistent_data["thresholds"] = t
        self.save_persistent_store()
        self.recalculate_risk_levels()
        return t

    def recalculate_risk_levels(self):
        t = self.get_thresholds()
        for profile in self.students.values():
            level = profile["studentLevel"]
            pred_score = profile["prediction"]["predictedScore"]
            
            if level == "school":
                if pred_score < t["school_high"]:
                    risk_lvl = "high"
                elif pred_score < t["school_medium"]:
                    risk_lvl = "medium"
                else:
                    risk_lvl = "low"
            else:
                if pred_score < t["college_high"]:
                    risk_lvl = "high"
                elif pred_score < t["college_medium"]:
                    risk_lvl = "medium"
                else:
                    risk_lvl = "low"
                    
            profile["riskLevel"] = risk_lvl
            profile["prediction"]["riskLevel"] = risk_lvl
            profile["priority"] = risk_lvl


_student_db_instance: Optional[StudentDatabase] = None

def get_student_db() -> StudentDatabase:
    global _student_db_instance
    if _student_db_instance is None:
        _student_db_instance = StudentDatabase()
    return _student_db_instance

