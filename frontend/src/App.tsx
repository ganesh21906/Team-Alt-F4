import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { FloatingBackground } from './components/background/FloatingBackground';
import { PageShell } from './components/layout/PageShell';
import { Landing } from './pages/Landing';
import { MentorDashboard } from './pages/MentorDashboard';
import { RolePicker } from './pages/RolePicker';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentProfile } from './pages/StudentProfile';
import { WhatIfSimulator } from './pages/WhatIfSimulator';
import { useSessionStore } from './store/sessionStore';

function ProtectedRoute({ children, role }: { children: JSX.Element; role: 'student' | 'mentor' }) {
  const { isAuthenticated, role: activeRole } = useSessionStore();

  if (!isAuthenticated || activeRole !== role) {
    return <Navigate to="/role-picker" replace />;
  }

  return children;
}

function RoutePage({ children }: { children: JSX.Element }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <div className="dot-field" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <FloatingBackground />
      </div>

      <div className="relative z-10">
        <PageShell>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<RoutePage><Landing /></RoutePage>} />
              <Route path="/role-picker" element={<RoutePage><RolePicker /></RoutePage>} />
              <Route path="/student/dashboard" element={<RoutePage><ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute></RoutePage>} />
              <Route path="/student/profile" element={<RoutePage><ProtectedRoute role="student"><StudentProfile /></ProtectedRoute></RoutePage>} />
              <Route path="/student/profile/:id" element={<RoutePage><ProtectedRoute role="mentor"><StudentProfile /></ProtectedRoute></RoutePage>} />
              <Route path="/student/what-if" element={<RoutePage><ProtectedRoute role="student"><WhatIfSimulator /></ProtectedRoute></RoutePage>} />
              <Route path="/mentor/dashboard" element={<RoutePage><ProtectedRoute role="mentor"><MentorDashboard /></ProtectedRoute></RoutePage>} />
              <Route path="*" element={<RoutePage><Navigate to="/" replace /></RoutePage>} />
            </Routes>
          </AnimatePresence>
        </PageShell>
      </div>
    </div>
  );
}
