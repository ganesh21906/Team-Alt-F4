import { useState } from 'react'
import './App.css'

const initialForm = {
  name: 'Aanya',
  math: 84,
  science: 76,
  english: 89,
  attendance: 91,
  studyHours: 6,
  assignments: 72,
  consistency: 81,
}

const historySeed = [
  { date: '2026-08-20', score: 86, riskLevel: 'Low', label: 'Strong consistency' },
  { date: '2026-08-14', score: 71, riskLevel: 'Moderate', label: 'Needs focus' },
  { date: '2026-08-08', score: 64, riskLevel: 'Moderate', label: 'Attendance dip' },
]

const steps = [
  'Enter academic and engagement data',
  'AI analyzes performance patterns',
  'Get actionable insights and next steps',
]

const riskConfig = {
  Low: { className: 'risk-low', label: 'Low Risk' },
  Moderate: { className: 'risk-moderate', label: 'Moderate Risk' },
  High: { className: 'risk-high', label: 'High Risk' },
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getGrade(score) {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C+'
  if (score >= 50) return 'C'
  return 'Needs support'
}

async function predictPerformance(payload) {
  await new Promise((resolve) => setTimeout(resolve, 1400))

  const academicAverage = (
    Number(payload.math) +
    Number(payload.science) +
    Number(payload.english)
  ) / 3

  const score = clamp(
    Math.round(
      academicAverage * 0.48 +
        Number(payload.attendance) * 0.3 +
        Number(payload.assignments) * 0.12 +
        Number(payload.consistency) * 0.1 +
        Number(payload.studyHours) * 1.2,
    ),
    35,
    98,
  )

  const riskLevel = score >= 78 ? 'Low' : score >= 62 ? 'Moderate' : 'High'

  const suggestions = []

  if (Number(payload.attendance) < 85) {
    suggestions.push('Improve class attendance by targeting at least 2 more classes per week to strengthen learning continuity.')
  }

  if (Number(payload.assignments) < 75) {
    suggestions.push('Complete pending assignments early and review feedback to reduce dropped marks in practical subjects.')
  }

  if (Number(payload.studyHours) < 5) {
    suggestions.push('Add focused revision blocks of 30–45 minutes for core subjects so concept recall becomes more consistent.')
  }

  if (Number(payload.math) < 75 || Number(payload.science) < 75) {
    suggestions.push('Prioritize math and science practice with short daily drills and weekly topic recap sessions.')
  }

  if (suggestions.length < 3) {
    suggestions.push('Keep the current momentum going by maintaining a weekly check-in on assignment completion and revision coverage.')
  }

  const chartData = [
    { label: 'Attendance', value: Number(payload.attendance) },
    { label: 'Assignments', value: Number(payload.assignments) },
    { label: 'Academic', value: academicAverage },
    { label: 'Focus', value: Number(payload.consistency) },
  ]

  return {
    score,
    riskLevel,
    grade: getGrade(score),
    summary:
      riskLevel === 'Low'
        ? 'This student is showing strong academic momentum with manageable risk.'
        : riskLevel === 'Moderate'
          ? 'The student is progressing, but a few support areas could lift performance further.'
          : 'The student may benefit from targeted interventions to stabilize attendance and assignments.',
    suggestions: suggestions.slice(0, 3),
    chartData,
  }
}

function App() {
  const [screen, setScreen] = useState('home')
  const [formData, setFormData] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [history, setHistory] = useState(historySeed)

  const validateForm = () => {
    const nextErrors = {}
    ;['math', 'science', 'english', 'attendance', 'assignments', 'consistency'].forEach((field) => {
      const value = Number(formData[field])
      if (Number.isNaN(value) || value < 0 || value > 100) {
        nextErrors[field] = 'Enter a value between 0 and 100.'
      }
    })

    if (Number(formData.studyHours) < 1 || Number(formData.studyHours) > 12) {
      nextErrors.studyHours = 'Study hours should be between 1 and 12.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: '' }))
  }

  const handlePredict = async (event) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const prediction = await predictPerformance(formData)
      setResult(prediction)
      setHistory((previous) => [
        {
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          score: prediction.score,
          riskLevel: prediction.riskLevel,
          label: 'Latest prediction',
        },
        ...previous,
      ].slice(0, 4))
      setScreen('results')
    } finally {
      setIsLoading(false)
    }
  }

  const badgeLabel = result ? riskConfig[result.riskLevel].label : 'Low Risk'

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">AI</div>
          <div>
            <p className="eyebrow">AltF4</p>
            <h2>Student Performance Predictor</h2>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <button type="button" className={screen === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => setScreen('home')}>
            Home
          </button>
          <button type="button" className={screen === 'predict' ? 'nav-link active' : 'nav-link'} onClick={() => setScreen('predict')}>
            Predict
          </button>
          <button type="button" className={screen === 'results' ? 'nav-link active' : 'nav-link'} onClick={() => setScreen('results')}>
            Results
          </button>
        </nav>
      </header>

      {screen === 'home' && (
        <main className="page home-page">
          <section className="hero-panel">
            <div className="hero-copy">
              <p className="eyebrow accent">AI-powered academic support</p>
              <h1>See where a student is thriving and where they need support.</h1>
              <p className="subtitle">
                Turn academic data into a clear performance forecast with risk indicators and actionable next steps.
              </p>
              <div className="hero-actions">
                <button type="button" className="primary-btn" onClick={() => setScreen('predict')}>
                  Check My Performance
                </button>
                <button type="button" className="secondary-btn" onClick={() => setScreen('results')}>
                  View Demo Report
                </button>
              </div>
              <div className="mini-stats">
                <div>
                  <strong>92%</strong>
                  <span>Guidance accuracy</span>
                </div>
                <div>
                  <strong>3 steps</strong>
                  <span>To get insights</span>
                </div>
                <div>
                  <strong>24/7</strong>
                  <span>Student support</span>
                </div>
              </div>
            </div>

            <div className="hero-visual" aria-label="Student performance summary card">
              <div className="summary-card">
                <div className="summary-topline">
                  <span>Projected outcome</span>
                  <span className="pill success">Low Risk</span>
                </div>
                <div className="summary-score">84</div>
                <div className="summary-grid">
                  <div>
                    <span>Attendance</span>
                    <strong>91%</strong>
                  </div>
                  <div>
                    <span>Essay quality</span>
                    <strong>B+</strong>
                  </div>
                </div>
                <div className="bars" aria-hidden="true">
                  <span style={{ height: '52%' }}></span>
                  <span style={{ height: '68%' }}></span>
                  <span style={{ height: '78%' }}></span>
                  <span style={{ height: '88%' }}></span>
                </div>
              </div>
            </div>
          </section>

          <section className="steps-panel">
            <div className="section-heading">
              <p className="eyebrow">How it works</p>
              <h3>Simple, supportive guidance for every student.</h3>
            </div>

            <div className="steps-grid">
              {steps.map((step, index) => (
                <article key={step} className="step-card">
                  <div className="step-no">0{index + 1}</div>
                  <h4>{step}</h4>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}

      {screen === 'predict' && (
        <main className="page form-page">
          <section className="panel form-panel">
            <div className="section-heading wide-heading">
              <div>
                <p className="eyebrow">Performance input</p>
                <h3>Enter student data</h3>
              </div>
              <span className="progress-chip">2 min analysis</span>
            </div>

            <form onSubmit={handlePredict} className="predict-form">
              <div className="form-section">
                <div className="section-title-row">
                  <h4>Student profile</h4>
                </div>
                <div className="field-grid two-col">
                  <label>
                    Student name
                    <input type="text" name="name" value={formData.name} onChange={handleFieldChange} placeholder="e.g. Aanya" />
                  </label>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title-row">
                  <h4>Academic performance</h4>
                </div>
                <div className="field-grid three-col">
                  {['math', 'science', 'english'].map((field) => (
                    <label key={field}>
                      {field === 'math' ? 'Mathematics' : field === 'science' ? 'Science' : 'English'}
                      <input
                        type="number"
                        name={field}
                        min="0"
                        max="100"
                        value={formData[field]}
                        onChange={handleFieldChange}
                      />
                      {errors[field] && <span className="error-text">{errors[field]}</span>}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <div className="section-title-row">
                  <h4>Engagement indicators</h4>
                </div>
                <div className="field-grid three-col">
                  <label>
                    Attendance %
                    <input type="number" name="attendance" min="0" max="100" value={formData.attendance} onChange={handleFieldChange} />
                    {errors.attendance && <span className="error-text">{errors.attendance}</span>}
                  </label>

                  <label>
                    Study hours / week
                    <input type="number" name="studyHours" min="1" max="12" value={formData.studyHours} onChange={handleFieldChange} />
                    {errors.studyHours && <span className="error-text">{errors.studyHours}</span>}
                  </label>

                  <label>
                    Assignment completion
                    <input type="number" name="assignments" min="0" max="100" value={formData.assignments} onChange={handleFieldChange} />
                    {errors.assignments && <span className="error-text">{errors.assignments}</span>}
                  </label>

                  <label>
                    Consistency score
                    <input type="number" name="consistency" min="0" max="100" value={formData.consistency} onChange={handleFieldChange} />
                    {errors.consistency && <span className="error-text">{errors.consistency}</span>}
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-btn" disabled={isLoading}>
                  {isLoading ? 'Analyzing your data...' : 'Predict Performance'}
                </button>
              </div>
            </form>
          </section>
        </main>
      )}

      {screen === 'results' && (
        <main className="page results-page">
          {!result ? (
            <section className="panel empty-panel">
              <p className="eyebrow">No report yet</p>
              <h3>Generate a prediction to see the result dashboard.</h3>
              <button type="button" className="primary-btn" onClick={() => setScreen('predict')}>
                Start prediction
              </button>
            </section>
          ) : (
            <>
              <section className="panel result-summary panel-wide">
                <div className="result-header">
                  <div>
                    <p className="eyebrow">Predicted outcome</p>
                    <h3>{formData.name || 'Student'} performance forecast</h3>
                  </div>
                  <span className={`risk-badge ${riskConfig[result.riskLevel].className}`}>{badgeLabel}</span>
                </div>

                <div className="summary-panel">
                  <div className="score-block">
                    <div className="score-value">{result.score}</div>
                    <div className="score-meta">
                      <span className="grade-pill">Grade {result.grade}</span>
                      <span>Predicted score</span>
                    </div>
                  </div>

                  <div className="summary-copy">
                    <p>{result.summary}</p>
                    <div className="result-actions">
                      <button type="button" className="primary-btn" onClick={() => setScreen('predict')}>
                        Edit data
                      </button>
                      <button type="button" className="secondary-btn">
                        Download report
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="dashboard-grid">
                <div className="panel chart-panel">
                  <div className="section-heading small-heading">
                    <p className="eyebrow">Key factor trends</p>
                    <h3>Impact snapshot</h3>
                  </div>

                  <div className="chart-bars" aria-label="Performance factor chart">
                    {result.chartData.map((item) => (
                      <div key={item.label} className="chart-column">
                        <span className="chart-value">{item.value}%</span>
                        <div className="chart-track">
                          <span style={{ height: `${item.value}%` }}></span>
                        </div>
                        <small>{item.label}</small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel suggestions-panel">
                  <div className="section-heading small-heading">
                    <p className="eyebrow">Next best actions</p>
                    <h3>Areas to focus on</h3>
                  </div>

                  <ul className="suggestions-list">
                    {result.suggestions.map((item, index) => (
                      <li key={item}>
                        <span className="suggestion-index">0{index + 1}</span>
                        <p>{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="panel history-panel">
                <div className="section-heading wide-heading">
                  <div>
                    <p className="eyebrow">History</p>
                    <h3>Recent predictions</h3>
                  </div>
                </div>

                <div className="history-list">
                  {history.map((item) => (
                    <div key={`${item.date}-${item.score}`} className="history-item">
                      <div>
                        <strong>{item.date}</strong>
                        <span>{item.label}</span>
                      </div>
                      <div className="history-score-wrap">
                        <span className="history-score">{item.score}</span>
                        <span className={`risk-badge slim ${riskConfig[item.riskLevel].className}`}>{item.riskLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      )}
    </div>
  )
}

export default App
