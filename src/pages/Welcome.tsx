import { useNavigate } from 'react-router-dom'
import { getProfile } from '../lib/storage'

export default function Welcome() {
  const navigate = useNavigate()
  const profile = getProfile()

  return (
    <div className="min-h-screen bg-pageBg flex flex-col items-center justify-center px-6 py-12 animate-[page-fade-in_0.4s_ease-out]">
      {/* Logo mark */}
      <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center mb-8 shadow-none">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="M8 20C8 20 10 12 20 12C30 12 32 20 32 20C32 20 30 28 20 28C10 28 8 20 8 20Z"
            fill="white"
            opacity="0.3"
          />
          <circle cx="20" cy="20" r="5" fill="white" />
          <path d="M4 20H8M32 20H36" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {profile ? (
        <>
          <h1 className="text-3xl font-display font-bold text-textPrimary text-center mb-2">
            Welcome back,
          </h1>
          <h2 className="text-2xl font-display font-semibold text-accent text-center mb-3">
            {profile.name}
          </h2>
          <p className="text-textMuted font-body text-center mb-10">
            Ready to crush today's goals?
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full max-w-xs py-4 rounded-2xl bg-accent text-white font-display font-bold text-lg"
          >
            Continue
          </button>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-display font-extrabold text-textPrimary text-center mb-3">
            Health Zone
          </h1>
          <p className="text-textMuted font-body text-center text-lg mb-2 max-w-xs">
            Your unified fitness &amp; nutrition companion
          </p>
          <p className="text-textMuted font-body text-center text-sm mb-10 max-w-xs opacity-70">
            AI-powered meal analysis, smart workout programs, and progress tracking — all in one place.
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full max-w-xs py-4 rounded-2xl bg-accent text-white font-display font-bold text-lg"
          >
            Get Started
          </button>
        </>
      )}
    </div>
  )
}
