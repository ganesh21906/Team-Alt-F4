# EduPulse — AI-Powered Student Performance Prediction & Early Intervention Subsystem

EduPulse is an end-to-end, production-grade machine learning subsystem for student performance prediction, risk categorization, SHAP-based explainability, and counterfactual What-If scenario simulation. It provides a standardized REST API for seamless integration with frontend and backend application services.

---

## 1. Problem
Academic institutions face challenges in identifying at-risk students early enough to implement effective interventions. Traditional evaluation occurs after major examinations when remediation is difficult. EduPulse delivers defensible, early-warning predictions and counterfactual simulations (**PREDICT → EXPLAIN → SIMULATE → INTERVENE → MEASURE**).

---

## 2. ML Architecture
EduPulse separates modeling for **School** and **College** populations to ensure statistical validity while exposing a consistent API contract:

```
                            EDUPULSE ML SUB-SYSTEM
                                       |
                 +---------------------+---------------------+
                 |                                           |
           SCHOOL MODEL                                COLLEGE MODEL
    (UCI Student Performance)                   (UCI Higher Education)
                 |                                           |
    GradientBoostingRegressor                         XGBClassifier
         (CV MAE: 1.4204)                           (CV F1: 0.2651)
                 |                                           |
                 +---------------------+---------------------+
                                       |
                             FASTAPI ML SERVICE
                      (/predict, /what-if, /explain)
```

---

## 3. Dataset Sources
* **School**: UCI Student Performance Dataset (`student-mat.csv` Math: 395 rows, `student-por.csv` Portuguese: 649 rows).
* **College**: UCI Higher Education Students Performance Evaluation Dataset (`higher_ed_students.csv`: 145 rows, 33 features).

---

## 4. Dataset Statistics
* **School Total Rows**: 1,044 observations, 33 columns (no missing values).
* **College Total Rows**: 145 observations, 33 columns (no missing values).

---

## 5. Prediction Targets
* **School Subsystem**:
  * **Primary Target**: Continuous Final Grade `G3` ($0-20$ score scale).
  * **Risk Tiers**: `HIGH` ($G3 < 10$), `MEDIUM` ($10 \le G3 < 14$), `LOW` ($G3 \ge 14$).
* **College Subsystem**:
  * **Primary Target**: Multi-class `OUTPUT Grade` ($0-7$ categorical performance scale).
  * **Risk Tiers**: `HIGH` (Grades 0-1), `MEDIUM` (Grades 2-3), `LOW` (Grades 4-7).

---

## 6. Prediction Timing
* **School**: Mid-Semester (utilizing Period 1 grade `G1`, study habits, and support structures).
* **College**: Mid-Term (utilizing prior semester GPA, midterm preparation, class attendance, and study hours).

---

## 7. Data Leakage Prevention Strategy
* **Strict Temporal Scope**: For School models, Period 2 grade `G2` is strictly excluded from all training and inference to prevent future-grade leakage. Preprocessing transformations are fitted exclusively on training splits.

---

## 8. Feature Engineering
* **School Derived Features**:
  * `alcohol_index`: Weighted workday vs weekend alcohol consumption index.
  * `study_to_leisure_ratio`: $\frac{\text{studytime}}{\text{freetime} + \text{goout} + 1e-5}$.
  * `support_score`: Composite binary indicator of academic and family support.
* **College Derived Features**:
  * `exam_prep_score`: Sum of Midterm 1 & 2 exam preparation levels.
  * `classroom_engagement_index`: Composite score of attendance, note-taking, listening, and flip-classroom participation.
  * `gpa_expectation_gap`: `Expected GPA` - `Last Semester Cumulative GPA`.

---

## 9. Models Benchmarked
* **School Regression**: `DummyRegressor` (Baseline), `LinearRegression`, `RandomForestRegressor`, `GradientBoostingRegressor`, `XGBRegressor`.
* **College Classification**: `DummyClassifier` (Baseline), `LogisticRegression`, `RandomForestClassifier`, `GradientBoostingClassifier`, `XGBClassifier`.

---

## 10. Final Model Selection
* **School**: `GradientBoostingRegressor` (Selected for lowest Cross-Validation MAE of 1.4204 marks).
* **College**: `XGBClassifier` (Selected for highest Cross-Validation F1-Score of 0.2651).

---

## 11. Evaluation Metrics
| Dataset | Algorithm | CV Metric | Test Metric |
| :--- | :--- | :--- | :--- |
| **School Baseline** | DummyRegressor | CV MAE: 2.8123 | Test MAE: 2.7910 |
| **School Selected** | **GradientBoostingRegressor** | **CV MAE: 1.4204** | **Test MAE: 1.3412** ($R^2=0.74$) |
| **College Baseline** | DummyClassifier | CV F1: 0.0946 | Test F1: 0.1140 |
| **College Selected** | **XGBClassifier** | **CV F1: 0.2651** | **Test F1: 0.3120** |

---

## 12. Explainability
Integrated SHAP (SHapley Additive exPlanations) TreeExplainer computes feature contributions per prediction:
```json
{
  "feature": "G1",
  "value": 15.0,
  "impact": 2.45,
  "direction": "positive"
}
```

---

## 13. What-If Scenario Methodology
Runs baseline and hypothetical counterfactual payloads through the exact same production pipeline without modifying saved weights:
$$\Delta \text{Score} = \text{Score}_{\text{scenario}} - \text{Score}_{\text{baseline}}$$

---

## 14. API Documentation
FastAPI interactive Swagger UI available at `http://localhost:8000/docs`.

### Key Endpoints:
* `GET /health`: Readiness check.
* `GET /model-info`: Active model metadata and feature listings.
* `POST /predict`: Performance prediction and SHAP top factors.
* `POST /what-if`: Scenario simulation.
* `POST /explain`: Detailed SHAP local explanation.

---

## 15. Installation
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 16. Training
```bash
python -m src.train_school
python -m src.train_college
```

---

## 17. Inference Service Execution
```bash
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

---

## 18. Docker Containerization
```bash
docker build -t edupulse-ml:latest .
docker run -p 8000:8000 edupulse-ml:latest
```

---

## 19. System Limitations
* Small dataset size for Higher Education dataset (145 records).
* Tabular survey representations may introduce subjective self-reporting variance.

---

## 20. Responsible AI & Ethics
EduPulse is designed strictly as a **decision-support tool for academic counseling and early intervention**. It must never be used for automated failure penalties, admission rejections, or punitive labeling.
