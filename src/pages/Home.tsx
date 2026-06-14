import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Flame, Scale, Plus } from 'lucide-react'
import { getProfile, getFoodLogsByDate, getWeightEntries, getProgram, getDayIndex } from '../lib/storage'
import MuscleMap from '../components/MuscleMap'
import type { MuscleGroupSlot } from '../types'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function greetingText(name: string) {
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${name}`
  if (hour < 17) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
}

function getStreak(): number {
  // Simple streak: count consecutive days with workout or food logs
  return 0 // placeholder — could compute from logs
}

interface CalorieRingProps {
  consumed: number
  target: number
  size?: number
}

function CalorieRing({ consumed, target, size = 140 }: CalorieRingProps) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(consumed / Math.max(target, 1), 1)
  const dashOffset = circumference * (1 - pct)
  const remaining = Math.max(target - consumed, 0)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-ring-track)" strokeWidth={10} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-calorie)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-display font-bold text-textPrimary">{remaining}</span>
        <span className="text-xs font-body text-textMuted">remaining</span>
      </div>
    </div>
  )
}

interface MacroRingProps {
  value: number
  target: number
  color: string
  label: string
}

function MacroRing({ value, target, color, label }: MacroRingProps) {
  const size = 64
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value / Math.max(target, 1), 1)
  const dashOffset = circumference * (1 - pct)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-ring-track)" strokeWidth={7} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-display font-bold text-textPrimary">{value}g</span>
        </div>
      </div>
      <span className="text-[10px] font-body text-textMuted">{label}</span>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [weightBannerDismissed, setWeightBannerDismissed] = useState(false)

  const profile = getProfile()
  const today = todayStr()
  const todayLogs = getFoodLogsByDate(today)
  const weightEntries = getWeightEntries()
  const program = getProgram()
  const dayIndex = getDayIndex()

  const consumed = useMemo(
    () => todayLogs.reduce((acc, e) => acc + e.confirmed.calories, 0),
    [todayLogs]
  )
  const proteinConsumed = useMemo(
    () => todayLogs.reduce((acc, e) => acc + e.confirmed.protein, 0),
    [todayLogs]
  )
  const carbsConsumed = useMemo(
    () => todayLogs.reduce((acc, e) => acc + e.confirmed.carbs, 0),
    [todayLogs]
  )
  const fatConsumed = useMemo(
    () => todayLogs.reduce((acc, e) => acc + e.confirmed.fat, 0),
    [todayLogs]
  )

  const targets = profile?.dailyTargets
  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1] : null
  const hasWeightToday = weightEntries.some((e) => e.date === today)
  const todayWorkout = program?.days[dayIndex % program.days.length]

  const workoutMuscles: MuscleGroupSlot[] = useMemo(() => {
    if (!todayWorkout) return []
    return [...new Set(todayWorkout.exercises.map((e) => e.slot))]
  }, [todayWorkout])

  useEffect(() => {
    if (profile && !program) {
      navigate('/train/builder?onboarding=1')
    }
  }, [profile, program, navigate])

  if (!profile || !targets) return null

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="px-4 py-6 space-y-5 animate-[page-fade-in_0.35s_ease-out]">
      {/* Header */}
      <div>
        <p className="text-textMuted font-body text-sm">{dateLabel}</p>
        <h1 className="text-2xl font-display font-bold text-textPrimary">{greetingText(profile.name)}</h1>
      </div>

      {/* Weight reminder banner */}
      {!hasWeightToday && !weightBannerDismissed && (
        <div className="bg-accentGreen/10 border border-accentGreen/30 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-accentGreen" />
            <p className="text-sm font-body text-textPrimary">Log today's weight</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/progress')}
              className="text-xs font-body font-semibold text-accentGreen"
            >
              Log
            </button>
            <button
              onClick={() => setWeightBannerDismissed(true)}
              className="text-xs font-body text-textMuted"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Streak + Calorie ring */}
      <div className="bg-surface rounded-2xl p-5 flex items-center gap-4">
        <CalorieRing consumed={consumed} target={targets.calories} />
        <div className="flex-1 space-y-3">
          {/* Streak */}
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-accent" />
            <span className="text-sm font-body font-semibold text-textPrimary">
              {getStreak()} day streak
            </span>
          </div>

          {/* Calorie summary */}
          <div>
            <p className="text-xs font-body text-textMuted">
              {consumed} / {targets.calories} kcal
            </p>
          </div>

          {/* Macro rings */}
          <div className="flex gap-3">
            <MacroRing value={proteinConsumed} target={targets.protein} color="var(--color-protein)" label="Protein" />
            <MacroRing value={carbsConsumed} target={targets.carbs} color="var(--color-carbs)" label="Carbs" />
            <MacroRing value={fatConsumed} target={targets.fat} color="var(--color-fat)" label="Fat" />
          </div>
        </div>
      </div>

      {/* Today's workout */}
      {todayWorkout && (
        <button
          onClick={() => navigate('/train')}
          className="w-full bg-surface rounded-2xl p-5 text-left flex items-center gap-4"
        >
          <div className="flex-1">
            <p className="text-xs font-body text-textMuted uppercase tracking-wide mb-1">Today's Workout</p>
            <h3 className="text-lg font-display font-bold text-textPrimary">{todayWorkout.name}</h3>
            <p className="text-sm font-body text-textMuted mt-0.5">
              {todayWorkout.exercises.length} exercises
            </p>
          </div>
          <div className="flex-shrink-0">
            <MuscleMap primary={workoutMuscles} size={80} />
          </div>
          <ChevronRight size={18} className="text-textMuted flex-shrink-0" />
        </button>
      )}

      {/* Weight card */}
      <button
        onClick={() => navigate('/progress')}
        className="w-full bg-surface rounded-2xl p-5 flex items-center justify-between"
      >
        <div>
          <p className="text-xs font-body text-textMuted uppercase tracking-wide mb-1">Weight</p>
          <p className="text-2xl font-display font-bold text-textPrimary">
            {latestWeight ? `${latestWeight.weightLbs} lbs` : '—'}
          </p>
          {profile.targetWeightLbs && (
            <p className="text-xs font-body text-textMuted mt-0.5">
              Goal: {profile.targetWeightLbs} lbs
            </p>
          )}
        </div>
        <ChevronRight size={18} className="text-textMuted" />
      </button>

      {/* Log a meal CTA */}
      <button
        onClick={() => navigate('/nutrition/log')}
        className="w-full py-4 rounded-2xl bg-accent text-white font-display font-bold text-base flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Log a Meal
      </button>

      {/* Today's meals */}
      {todayLogs.length > 0 && (
        <div>
          <h2 className="text-base font-display font-semibold text-textPrimary mb-3">Today's Meals</h2>
          <div className="space-y-2">
            {todayLogs.map((entry) => (
              <button
                key={entry.id}
                onClick={() => navigate('/nutrition')}
                className="w-full bg-surface rounded-2xl px-4 py-3 flex items-center gap-3 text-left"
              >
                {entry.photoDataUrl ? (
                  <img
                    src={entry.photoDataUrl}
                    alt={entry.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-surface2 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🍽️</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-textPrimary text-sm truncate">{entry.name}</p>
                  <p className="text-xs font-body text-textMuted capitalize">{entry.mealCategory}</p>
                </div>
                <p className="text-sm font-display font-bold text-calorie flex-shrink-0">
                  {entry.confirmed.calories} kcal
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
