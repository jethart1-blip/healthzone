import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { getProfile } from './lib/storage'
import Layout from './components/Layout'
import Welcome from './pages/Welcome'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Train from './pages/Train'
import TodaysWorkout from './pages/TodaysWorkout'
import Nutrition from './pages/Nutrition'
import NutritionLog from './pages/NutritionLog'
import NutritionHistory from './pages/NutritionHistory'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import { TrainBuilder } from './pages/TrainBuilder'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const profile = getProfile()
  if (!profile) return <Navigate to="/welcome" replace />
  return <>{children}</>
}

function ProgramPlaceholder() {
  return (
    <div className="px-4 py-6 animate-[page-fade-in_0.35s_ease-out]">
      <h1 className="text-2xl font-display font-bold text-textPrimary">Program</h1>
      <p className="text-textMuted font-body mt-2">Program customization coming soon.</p>
    </div>
  )
}

function CatchAll() {
  const profile = getProfile()
  return <Navigate to={profile ? '/' : '/welcome'} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public routes — no Layout */}
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Protected routes without Layout (full-screen flows) */}
      <Route
        path="/train/workout"
        element={
          <ProtectedRoute>
            <TodaysWorkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/train/builder"
        element={
          <ProtectedRoute>
            <TrainBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nutrition/log"
        element={
          <ProtectedRoute>
            <NutritionLog />
          </ProtectedRoute>
        }
      />

      {/* Protected routes with Layout (tab nav) */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/train" element={<Train />} />
        <Route path="/train/program" element={<ProgramPlaceholder />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/nutrition/history" element={<NutritionHistory />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<CatchAll />} />
    </Routes>
  )
}
