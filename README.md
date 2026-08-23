# EduPulse: AI Student Performance Predictor

Developed as an end-to-end solution for the **AI Student Performance Predictor** Hackathon track.

### 🎯 Hackathon Problem Statement
> **AI Student Performance Predictor**: Develop an AI/ML-based system where students can enter their academic information, such as marks, attendance, and other relevant factors. The system should predict the student's performance and risk level and provide personalized suggestions for improvement.

EduPulse fulfills and expands upon this statement by providing a production-grade educational workspace. It enables students to input academic signals, predicts performance/risk levels using robust GBR & XGBoost pipelines, explains predictions with local SHAP values, generates counterfactual What-If predictions, and bridges them directly into actionable study plans.

---

## 1. Project Architecture

EduPulse consists of two primary subsystems structured as follows:

```
                            EDUPULSE SYSTEM ARCHITECTURE
                                         |
            +----------------------------+----------------------------+
            |                                                         |
    REACT VITE CLIENT                                          FASTAPI SERVICES
 (Tailwind CSS, Zustand, Router)                             (Uvicorn, Pydantic, Scikit-learn)
            |                                                         |
     AI Study Planner                                            Student database
  Mentor Intervention Tool                                      SHAP explainers
  Governance Diagnostics Tab                                    Predict & What-if APIs
```

* **Frontend**: A React + TypeScript web app styled with Vanilla CSS and Tailwind CSS, utilizing Framer Motion for premium micro-animations and Zustand for session management.
* **Backend**: A FastAPI REST service that handles dataset parsing, predictions, explainability attributes, and maintains persistent state.

---

## 2. Advanced Feature Modules

EduPulse integrates five key functional areas that solve the core intervention lifecycle:

1. **AI Study Planner & Task Board (Student)**: Students can click "+ Add to Study Planner" directly from AI recommendations. Completing tasks dynamically updates their dataset features in the backend (improving attendance or study hours), triggers the ML pipeline, and immediately recalculates their risk level on the page.
2. **Coaching & Intervention Contract Log (Mentor)**: Mentors can log formal contracts (warning letters, milestone checklists, tutoring reviews). All actions are saved in a chronological feed timeline on the student profile page.
3. **Model Governance & Telemetry Control (Mentor/Admin)**: Displays validation benchmarks (Accuracy, Precision, Recall, F1) and global SHAP feature importances. Advising administrators can adjust the Risk Boundary Thresholds (predicted scores or percentages) to dynamically re-categorize risk levels for the entire cohort.
4. **Multi-Student Comparison Matrix (Mentor)**: Checkboxes in the cohort list enable mentors to select multiple students and contrast GPAs, attendance trends, risk scores, and next steps side-by-side.
5. **What-If Scenario Simulator**: Performs counterfactual analysis by allowing students and mentors to adjust attendance and study sliders to see the exact predicted grade shifts and risk transitions.

---

## 3. Dataset & Machine Learning Subsystems

EduPulse runs two tailored model pipelines to fit school and college populations:

* **Secondary School Subsystem**:
  * **Dataset**: UCI Student Performance (`student-mat.csv` / `student-por.csv` combined: $1,044$ rows).
  * **Model**: Gradient Boosting Regressor (CV MAE: 1.4204, Test MAE: 1.3412, $R^2$: 0.74).
  * **Targets**: Predicted final score scale of $0\text{--}20$.
  * **Risk Tiers**: High (&lt; 10.0), Medium (&lt; 14.0), Low (&ge; 14.0) — fully tunable dynamically.
* **Higher Education Subsystem**:
  * **Dataset**: UCI Higher Education Performance evaluation (`higher_ed_students.csv`: $145$ rows).
  * **Model**: XGBoost Classifier (CV F1-Score: 0.2651, Test F1-Score: 0.3120).
  * **Targets**: Predicted grade class $0\text{--}7$, mapped to percentages.
  * **Risk Tiers**: High (&lt; 60%), Medium (&lt; 80%), Low (&ge; 80%) — fully tunable dynamically.

---

## 4. Getting Started (Run Locally)

### Prerequisites
* Python 3.9+
* Node.js 18+

### Step 1: Launch the ML Backend
1. Open a terminal in `ml-service/`:
   ```bash
   cd ml-service
   ```
2. Activate your virtual environment and install requirements:
   ```bash
   # Windows
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Start the FastAPI development server:
   ```bash
   python api/main.py
   ```
   *The server runs on [http://localhost:8000](http://localhost:8000). Interactive Swagger docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).*

### Step 2: Launch the React Client
1. Open a second terminal in `frontend/`:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The client runs on [http://localhost:5173](http://localhost:5173).*

---

## 5. Demo Instructions
1. Navigate to [http://localhost:5173](http://localhost:5173).
2. Click **Start Now** and select **I'm a Student**.
3. Use the **Quick Login** cards to login as **Aanya Sharma** (School Student) or **Rohan Mehta** (College Student).
4. Review metrics, add recommendations to the AI Planner, and mark them completed to see the risk level recalculate live.
5. Log out and select **I'm a Mentor** to view the cohort distribution, contrast profiles using the comparison checkboxes, and slide alerting limits inside the **Model Governance** tab.
