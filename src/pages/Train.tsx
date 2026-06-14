import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, CheckCircle } from 'lucide-react'
import { getProfile, getProgram, getDayIndex, saveProgram, setDayIndex, getWorkoutLogs } from '../lib/storage'
import { generateProgram } from '../lib/generateProgram'
import { getExerciseById } from '../data/exercises'
import MuscleMap from '../components/MuscleMap'
import type { MuscleGroupSlot } from '../types'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function Train() {
  const navigate = useNavigate()
  const profile = getProfile()

  let program = getProgram()
  if (!program && profile && profile.splitId !== 'custom') {
    program = generateProgram(profile)
    saveProgram(program)
    setDayIndex(0)
  }

  const dayIndex = getDayIndex()
  const workoutLogs = getWorkoutLogs()
  const todayWorkout = program?.days[dayIndex % (program?.days.length || 1)]
  const today = todayStr()

  const todayDone = workoutLogs.some(
    (log) => log.date === today && log.programDayId === todayWorkout?.id
  )

  const todayMuscles: MuscleGroupSlot[] = useMemo(() => {
    if (!todayWorkout) return []
    return [...new Set(todayWorkout.exercises.map((e) => e.slot))]
  }, [todayWorkout])

  if (!program) {
    return (
      <div className="px-4 py-6 space-y-5 animate-[page-fade-in_0.35s_ease-out]">
        <div>
          <h1 className="text-2xl font-display font-bold text-textPrimary">Train</h1>
          <p className="text-textMuted font-body text-sm mt-0.5">Custom split</p>
        </div>
        <button
          onClick={() => navigate('/train/builder')}
          className="w-full bg-surface rounded-2xl p-5 flex items-center justify-between active:scale-95 transition-transform"
        >
          <div>
            <p className="text-sm font-semibold text-textPrimary">🛠️ Workout Builder</p>
            <p className="text-xs text-textMuted">Create custom workouts and splits</p>
          </div>
          <span className="text-textMuted">→</span>
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-5 animate-[page-fade-in_0.35s_ease-out]">
      <div>
        <h1 className="text-2xl font-display font-bold text-textPrimary">Train</h1>
        <p className="text-textMuted font-body text-sm mt-0.5">
          {profile?.splitId?.replace(/_/g, ' ')} · {program.days.length} day split
        </p>
      </div>

      {/* Today's workout card */}
      {todayWorkout && (
        <div className="bg-surface rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-body text-textMuted uppercase tracking-wide mb-1">Up Next</p>
              <h2 className="text-xl font-display font-bold text-textPrimary">{todayWorkout.name}</h2>
              <p className="text-sm font-body text-textMuted mt-0.5">
                {todayWorkout.exercises.length} exercises
              </p>
            </div>
            {todayDone && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-accentGreen/10 rounded-full">
                <CheckCircle size={14} className="text-accentGreen" />
                <span className="text-xs font-body text-accentGreen font-medium">Done</span>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <MuscleMap primary={todayMuscles} size={160} />
          </div>

          {/* Exercise preview */}
          <div className="space-y-2">
            {todayWorkout.exercises.slice(0, 4).map((ex) => {
              const def = getExerciseById(ex.exerciseId)
              return def ? (
                <div key={ex.id} className="flex items-center justify-between py-1">
                  <p className="text-sm font-body text-textPrimary">{def.name}</p>
                  <p className="text-xs font-body text-textMuted">
                    {ex.sets} × {ex.targetRepsMin}–{ex.targetRepsMax}
                  </p>
                </div>
              ) : null
            })}
            {todayWorkout.exercises.length > 4 && (
              <p className="text-xs font-body text-textMuted">
                +{todayWorkout.exercises.length - 4} more exercises
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/train/workout')}
            className="w-full py-4 rounded-xl bg-accent text-white font-display font-bold text-base flex items-center justify-center gap-2"
          >
            <Play size={18} fill="white" />
            {todayDone ? 'Repeat Workout' : 'Start Workout'}
          </button>
        </div>
      )}

      {/* Weekly overview */}
      <div className="bg-surface rounded-2xl p-5">
        <h3 className="font-display font-semibold text-textPrimary mb-4">This Week's Plan</h3>
        <div className="space-y-2">
          {program.days.map((day, idx) => {
            const isToday = idx === dayIndex % program.days.length
            const slots = [...new Set(day.exercises.map((e) => e.slot))] as MuscleGroupSlot[]

            return (
              <div
                key={day.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  isToday ? 'bg-accent/10 border border-accent/30' : 'bg-surface2'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold ${
                    isToday ? 'bg-accent text-white' : 'bg-surface text-textMuted'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-body font-medium ${isToday ? 'text-accent' : 'text-textPrimary'}`}>
                    {day.name}
                  </p>
                  <p className="text-xs font-body text-textMuted">
                    {slots.slice(0, 3).join(' · ')}
                    {slots.length > 3 && ` +${slots.length - 3}`}
                  </p>
                </div>
                {isToday && (
                  <span className="text-xs font-body text-accent font-semibold">Today</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Program info */}
      <div className="bg-surface rounded-2xl px-5 py-4">
        <p className="text-xs font-body text-textMuted uppercase tracking-wide mb-1">Program</p>
        <p className="font-display font-semibold text-textPrimary capitalize">
          {program.splitId.replace(/_/g, ' ')}
        </p>
        <p className="text-sm font-body text-textMuted mt-0.5">
          Created {new Date(program.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Workout Builder */}
      <button
        onClick={() => navigate('/train/builder')}
        className="w-full bg-surface rounded-2xl p-5 flex items-center justify-between active:scale-95 transition-transform"
      >
        <div>
          <p className="text-sm font-semibold text-textPrimary">🛠️ Workout Builder</p>
          <p className="text-xs text-textMuted">Create custom workouts and splits</p>
        </div>
        <span className="text-textMuted">→</span>
      </button>
    </div>
  )
}
