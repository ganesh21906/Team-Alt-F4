# EduPulse — Frontend

> Predict. Explain. Improve.

AI Student Performance Predictor — students enter academic data (marks,
attendance, and other relevant factors) and receive a predicted
performance level, a risk category, and personalized, encouraging
improvement suggestions from an ML model running on the backend.

Built for **Hackspora 2.0**.

---

## Overview

EduPulse turns raw academic signals — marks, attendance, study habits —
into a clear, explainable picture of where a student stands and what to
focus on next. The tool is designed to feel supportive rather than
judgmental: results are framed as "areas to focus on," not failures.

This repository contains the **frontend only**. It is built to run
against mock data out of the box, so the UI is fully demoable before the
ML backend is wired in — swapping mock data for the real API is a
one-line change (see [API Contract](#api-contract) below).

---

## Features

- **Landing page** — explains the tool, 3-step "How it works," clear CTA
  into the flow.
- **Data input** — a clean, validated multi-field form (marks, attendance,
  study hours, assignment completion) with progress indication.
- **Results dashboard** — predicted score, color-coded risk badge
  (Low / Moderate / High), supporting charts, and a personalized
  suggestions list built from the weakest factors.
- **History** *(optional/stretch)* — a list of past predictions with date
  and risk level, if persistence is available.
- Fully responsive — built mobile-first, verified on laptop widths for
  live demo conditions.
- Loading, empty, and error states on every async view — including the
  "Analyzing your data..." state while a prediction is in flight.

---

## Tech Stack

- React + TypeScript
- Tailwind CSS
- Chart library for results visualizations (bar/radar/gauge)
- Component-first architecture — no page owns business logic directly

---

## Project Structure

```
/src
  /components
    InputForm.tsx
    ResultCard.tsx
    RiskBadge.tsx
    SuggestionList.tsx
    Chart.tsx
  /pages
    Landing.tsx
    Predict.tsx
    Results.tsx
    History.tsx        (optional)
  /lib
    types.ts            # shared TypeScript interfaces
    mockData.ts          # placeholder data matching the real API shape
    api.ts               # fetch wrapper — swap mock for live here
  /hooks
```

Components are kept modular and prop-driven on purpose, so the real ML
model can be plugged in later without touching component internals.

---

## API Contract

The frontend expects a backend endpoint shaped like:

```
POST /predict
Body: { marks, attendance, studyHours, assignmentCompletion, ... }

Response:
{
  "score": number,
  "risk_level": "low" | "moderate" | "high",
  "suggestions": string[]
}
```

Until the backend is ready, `lib/mockData.ts` returns data in this exact
shape, so every component already renders correctly against the real
contract.

---

## Getting Started

```bash
# install dependencies
npm install

# run the dev server
npm run dev

# build for production
npm run build
```

Open `http://localhost:3000` (or the port shown in your terminal).

No environment variables are required to run against mock data. To point
at a live backend, set:

```
NEXT_PUBLIC_API_BASE_URL=<your backend URL>
```

---

## UX Principles

- **2–3 clicks to a result** — Home → Predict → Results, no unnecessary
  navigation.
- **Constructive framing** — "Areas to focus on," never "weaknesses" or
  "failure."
- **Accessible by default** — dark text on white/off-white, no
  low-contrast pastel-on-white combinations.
- **Trustworthy, not clinical** — modern SaaS-dashboard feel rather than
  a form-heavy academic tool.

---

## Current Limitations

- Running against **mock/placeholder data** until the ML backend is
  integrated.
- No authentication yet.
- History page is a stretch goal, dependent on backend persistence.

---

## Team

Hackspora 2.0 — Team HS2026-203
