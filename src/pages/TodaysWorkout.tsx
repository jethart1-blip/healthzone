import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, Check, Trophy } from 'lucide-react'
import { getProgram, getDayIndex, addWorkoutLog, advanceDayIndex, getProfile } from '../lib/storage'
import { getExerciseById } from '../data/exercises'
import { getAllTimePR } from '../lib/getPRs'
import { getAdaptiveWeightSuggestion } from '../lib/getAdaptiveWeight'
import { getWarmupForWorkout, getCooldownForWorkout } from '../data/warmups'
import type { WarmupExercise } from '../data/warmups'
import MuscleMap from '../components/MuscleMap'
import { getSwapSuggestions } from '../lib/getExerciseSwaps'
import { getYouTubeDemoUrl } from '../lib/getExerciseDemo'
import type { SetLog, ExerciseLog, WorkoutLog, MuscleGroupSlot } from '../types'

type WorkoutPhase = 'checkin' | 'warmup' | 'workout' | 'cooldown' | 'summary'

function playBeep(frequency = 880, duration = 200, volume = 0.3) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.frequency.value = frequency
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration / 1000)
  } catch (e) {
    console.warn('Audio not available:', e)
  }
}

function playCompletionSound() {
  playBeep(660, 150, 0.3)
  setTimeout(() => playBeep(880, 150, 0.3), 200)
  setTimeout(() => playBeep(1100, 300, 0.4), 400)
}

function playCountdownBeep() {
  playBeep(440, 100, 0.2)
}

interface SetRowProps {
  setNum: number
  log: SetLog
  onUpdate: (updated: SetLog) => void
}

function SetRow({ setNum, log, onUpdate }: SetRowProps) {
  return (
    <div className={`flex items-center gap-2 py-2 px-3 rounded-xl ${log.completed ? 'bg-accentGreen/10' : 'bg-surface2'}`}>
      <span className="w-6 text-center text-xs font-body font-bold text-textMuted">{setNum}</span>
      <input
        type="number"
        value={log.weight || ''}
        onChange={(e) => onUpdate({ ...log, weight: parseFloat(e.target.value) || 0 })}
        placeholder="lbs"
        className="w-16 text-center py-1.5 rounded-lg bg-surface text-sm font-body text-textPrimary border border-surface2 focus:border-accent focus:outline-none"
      />
      <input
        type="number"
        value={log.reps || ''}
        onChange={(e) => onUpdate({ ...log, reps: parseInt(e.target.value) || 0 })}
        placeholder="reps"
        className="w-16 text-center py-1.5 rounded-lg bg-surface text-sm font-body text-textPrimary border border-surface2 focus:border-accent focus:outline-none"
      />
      <input
        type="number"
        value={log.rpe || ''}
        onChange={(e) => onUpdate({ ...log, rpe: parseFloat(e.target.value) || undefined })}
        placeholder="RPE"
        className="w-14 text-center py-1.5 rounded-lg bg-surface text-xs font-body text-textMuted border border-surface2 focus:border-accent focus:outline-none"
        min={1}
        max={10}
        step={0.5}
      />
      <button
        onClick={() => onUpdate({ ...log, completed: !log.completed })}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          log.completed ? 'bg-accentGreen text-white' : 'bg-surface border border-surface2 text-textMuted'
        }`}
      >
        <Check size={14} strokeWidth={3} />
      </button>
    </div>
  )
}

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds)
  const size = 80
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const pct = remaining / seconds
  const dashOffset = circumference * (1 - pct)

  useEffect(() => {
    if (remaining <= 0) {
      playCompletionSound()
      onDone()
      return
    }
    if (remaining <= 3) {
      playCountdownBeep()
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining, onDone])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-ring-track)" strokeWidth={6} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-display font-bold text-textPrimary">{remaining}s</span>
        </div>
      </div>
      <p className="text-xs font-body text-textMuted">Rest</p>
      <button onClick={onDone} className="text-xs font-body text-accent">Skip</button>
    </div>
  )
}

interface WarmupCountdownProps {
  exercise: WarmupExercise
  onNext: () => void
}

function WarmupCountdown({ exercise, onNext }: WarmupCountdownProps) {
  const [remaining, setRemaining] = useState(exercise.duration)
  const [done, setDone] = useState(false)
  const size = 96
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const pct = remaining / exercise.duration
  const dashOffset = circumference * (1 - pct)

  useEffect(() => {
    setRemaining(exercise.duration)
    setDone(false)
  }, [exercise.id, exercise.duration])

  useEffect(() => {
    if (remaining <= 0) {
      setDone(true)
      return
    }
    if (remaining <= 3) playCountdownBeep()
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-ring-track)" strokeWidth={7} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={done ? 'var(--color-accentGreen)' : 'var(--color-accent)'}
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={done ? 0 : dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {done
            ? <Check size={28} className="text-accentGreen" strokeWidth={3} />
            : <span className="text-xl font-display font-bold text-textPrimary">{remaining}s</span>
          }
        </div>
      </div>
      <button
        onClick={onNext}
        className={`px-6 py-3 rounded-2xl font-display font-bold text-white transition-all active:scale-95 ${
          done ? 'bg-accentGreen' : 'bg-accent'
        }`}
      >
        {done ? 'Next →' : 'Skip →'}
      </button>
    </div>
  )
}

export default function TodaysWorkout() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<WorkoutPhase>('checkin')
  const [readiness, setReadiness] = useState(7)
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [warmupIndex, setWarmupIndex] = useState(0)
  const [cooldownIndex, setCooldownIndex] = useState(0)
  const [resting, setResting] = useState(false)
  const [startTime] = useState(Date.now())
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [demoTab, setDemoTab] = useState<'muscles' | 'demo'>('muscles')

  const profile = getProfile()

  const program = getProgram()
  const dayIndex = getDayIndex()
  const workout = program?.days[dayIndex % (program?.days.length || 1)]

  const todaySlots = workout ? [...new Set(workout.exercises.map(e => e.slot))] as MuscleGroupSlot[] : []
  const warmupExercises = getWarmupForWorkout(todaySlots)
  const cooldownExercises = getCooldownForWorkout(todaySlots)

  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() => {
    if (!workout) return []
    return workout.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: Array.from({ length: ex.sets }, () => ({
        weight: 0,
        reps: ex.targetRepsMax,
        completed: false,
      })),
    }))
  })

  const currentExercise = workout?.exercises[exerciseIndex]
  const currentLog = exerciseLogs[exerciseIndex]
  // Derive currentDef from the log so it reflects any swap the user makes
  const currentDef = currentLog ? getExerciseById(currentLog.exerciseId) : undefined

  const suggestion = currentExercise && currentLog
    ? getAdaptiveWeightSuggestion(
        currentLog.exerciseId,
        currentExercise.targetRepsMin,
        currentExercise.targetRepsMax,
      )
    : null

  function swapExercise(newExerciseId: string) {
    if (!workout) return
    setExerciseLogs(prev =>
      prev.map((el, i) => {
        if (i !== exerciseIndex) return el
        return { ...el, exerciseId: newExerciseId }
      })
    )
  }

  function fillSuggestedWeight(weight: number) {
    setExerciseLogs((prev) =>
      prev.map((el, i) => {
        if (i !== exerciseIndex) return el
        return { ...el, sets: el.sets.map(s => ({ ...s, weight })) }
      })
    )
  }

  function updateSet(setIdx: number, updated: SetLog) {
    setExerciseLogs((prev) =>
      prev.map((el, i) => {
        if (i !== exerciseIndex) return el
        const newSets = [...el.sets]
        newSets[setIdx] = updated
        return { ...el, sets: newSets }
      })
    )
  }

  function handleFinish() {
    const duration = Math.round((Date.now() - startTime) / 60000)
    const log: WorkoutLog = {
      id: `wl_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      programDayId: workout?.id ?? '',
      exercises: exerciseLogs,
      readiness,
      durationMinutes: duration,
    }
    addWorkoutLog(log)
    advanceDayIndex()
    setPhase('cooldown')
  }

  const totalSets = exerciseLogs.reduce((acc, el) => acc + el.sets.length, 0)
  const completedSets = exerciseLogs.reduce(
    (acc, el) => acc + el.sets.filter((s) => s.completed).length,
    0
  )

  const newPRs = exerciseLogs
    .map((el) => {
      const def = getExerciseById(el.exerciseId)
      if (!def) return null
      const pr = getAllTimePR(el.exerciseId)
      const bestSet = el.sets
        .filter((s) => s.completed && s.weight > 0)
        .sort((a, b) => b.weight * (1 + b.reps / 30) - a.weight * (1 + a.reps / 30))[0]
      if (!bestSet) return null
      const isBetter =
        !pr || bestSet.weight * (1 + bestSet.reps / 30) > pr.weight * (1 + pr.reps / 30)
      return isBetter ? { name: def.name, weight: bestSet.weight, reps: bestSet.reps } : null
    })
    .filter(Boolean)

  if (!workout) {
    return (
      <div className="min-h-screen bg-pageBg flex items-center justify-center">
        <p className="text-textMuted font-body">No workout found.</p>
      </div>
    )
  }

  // ── Check-in phase ──────────────────────────────────────────────────────
  if (phase === 'checkin') {
    return (
      <div className="min-h-screen bg-pageBg flex flex-col px-6 py-8 animate-[page-fade-in_0.3s_ease-out]">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/train')} className="p-2 -ml-2 text-textMuted">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 flex flex-col justify-center space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-textPrimary mb-2">{workout.name}</h1>
            <p className="text-textMuted font-body">{workout.exercises.length} exercises · {completedSets}/{totalSets} sets</p>
          </div>

          <div className="bg-surface rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-display font-semibold text-textPrimary">Readiness</p>
              <span className="text-2xl font-display font-bold text-accent">{readiness}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={readiness}
              onChange={(e) => setReadiness(parseInt(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-textMuted font-body">
              <span>💀 Exhausted</span>
              <span>🔥 Feeling great</span>
            </div>
          </div>

          <div className="flex justify-center">
            <MuscleMap
              primary={[...new Set(workout.exercises.map((e) => e.slot))] as MuscleGroupSlot[]}
              size={160}
            />
          </div>
        </div>

        <button
          onClick={() => setPhase('warmup')}
          className="w-full py-4 rounded-2xl bg-accent text-white font-display font-bold text-lg"
        >
          Start Workout
        </button>
      </div>
    )
  }

  // ── Warm-up phase ───────────────────────────────────────────────────────
  if (phase === 'warmup') {
    const currentWarmup = warmupExercises[warmupIndex]

    if (!currentWarmup) {
      setPhase('workout')
      return null
    }

    function handleWarmupNext() {
      if (warmupIndex < warmupExercises.length - 1) {
        setWarmupIndex(i => i + 1)
      } else {
        setPhase('workout')
      }
    }

    return (
      <div className="min-h-screen bg-pageBg flex flex-col animate-[page-fade-in_0.3s_ease-out]">
        <div className="px-4 pt-8 pb-4 flex items-center justify-between">
          <button onClick={() => navigate('/train')} className="p-2 -ml-2 text-textMuted">
            <X size={22} />
          </button>
          <div className="text-center">
            <h2 className="text-base font-display font-bold text-textPrimary">Warm Up</h2>
            <p className="text-xs font-body text-textMuted">{warmupIndex + 1} of {warmupExercises.length}</p>
          </div>
          <button
            onClick={() => setPhase('workout')}
            className="text-xs font-body text-textMuted active:opacity-60"
          >
            Skip
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center px-4 pb-2">
          {warmupExercises.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i < warmupIndex ? 'bg-accentGreen w-4' : i === warmupIndex ? 'bg-accent w-6' : 'bg-surface2 w-4'
              }`}
            />
          ))}
        </div>

        <div className="flex-1 px-4 overflow-y-auto pb-8 space-y-5">
          {/* Muscle map + name */}
          <div className="bg-surface rounded-2xl p-5 flex items-center gap-4">
            <MuscleMap
              primary={currentWarmup.targetSlots}
              size={90}
            />
            <div className="flex-1">
              <h3 className="text-xl font-display font-bold text-textPrimary">{currentWarmup.name}</h3>
              <p className="text-xs font-body text-textMuted mt-1 capitalize">
                {currentWarmup.targetSlots.join(', ')}
              </p>
            </div>
          </div>

          {/* Instruction */}
          <div className="bg-accent/10 border border-accent/20 rounded-2xl px-4 py-4">
            <p className="text-xs font-body font-semibold text-accent mb-1">How to do it</p>
            <p className="text-sm font-body text-textPrimary leading-relaxed">{currentWarmup.instruction}</p>
          </div>

          {/* Timer */}
          <div className="flex justify-center py-4">
            <WarmupCountdown
              key={`${currentWarmup.id}-${warmupIndex}`}
              exercise={currentWarmup}
              onNext={handleWarmupNext}
            />
          </div>
        </div>
      </div>
    )
  }

  // ── Workout phase ───────────────────────────────────────────────────────
  if (phase === 'workout' && currentExercise && currentDef && currentLog) {
    return (
      <div className="min-h-screen bg-pageBg flex flex-col animate-[page-fade-in_0.3s_ease-out]">
        {/* Header */}
        <div className="px-4 pt-8 pb-4 flex items-center justify-between">
          <button onClick={() => navigate('/train')} className="p-2 -ml-2 text-textMuted">
            <X size={22} />
          </button>
          <div className="text-center">
            <p className="text-xs font-body text-textMuted">
              {exerciseIndex + 1} / {workout.exercises.length}
            </p>
            <div className="flex gap-1 mt-1">
              {workout.exercises.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i < exerciseIndex
                      ? 'bg-accentGreen'
                      : i === exerciseIndex
                      ? 'bg-accent w-6'
                      : 'bg-surface2'
                  } ${i !== exerciseIndex ? 'w-3' : ''}`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs font-body text-textMuted">{completedSets}/{totalSets} sets</p>
        </div>

        <div className="flex-1 px-4 overflow-y-auto pb-32 space-y-5">
          {/* Exercise card with tabs */}
          <div className="bg-surface rounded-2xl p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-body text-textMuted uppercase tracking-wide mb-1">
                  {currentDef.slot}
                </p>
                <h2 className="text-lg font-display font-bold text-textPrimary">{currentDef.name}</h2>
                <p className="text-xs font-body text-textMuted mt-0.5 capitalize">
                  {currentDef.difficulty} · {currentDef.category}
                </p>
              </div>
              <button
                onClick={() => setShowSwapModal(true)}
                className="shrink-0 text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
              >
                Swap
              </button>
            </div>

            {/* Muscle / How To tabs */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setDemoTab('muscles')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${demoTab === 'muscles' ? 'bg-accent text-white' : 'bg-surface2 text-textMuted'}`}
              >
                Muscles
              </button>
              <button
                onClick={() => setDemoTab('demo')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${demoTab === 'demo' ? 'bg-accent text-white' : 'bg-surface2 text-textMuted'}`}
              >
                How To
              </button>
            </div>

            {demoTab === 'muscles' ? (
              <div className="flex justify-center">
                <MuscleMap
                  primary={[currentDef.slot]}
                  secondary={currentDef.secondarySlots}
                  size={120}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-surface2 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-semibold text-textPrimary">Coaching Cues</p>
                  {currentDef.coachingCues.map((cue, i) => (
                    <p key={i} className="text-xs text-textMuted">• {cue}</p>
                  ))}
                </div>
                <a
                  href={getYouTubeDemoUrl(currentDef.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-red-500/10 text-red-500 font-semibold rounded-xl py-3 text-sm active:scale-95 transition-transform"
                >
                  ▶ Watch Demo on YouTube
                </a>
              </div>
            )}
          </div>

          {/* Swap modal */}
          {showSwapModal && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
              <div className="bg-pageBg rounded-t-3xl w-full max-w-sm p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-display font-bold text-textPrimary">Swap Exercise</h2>
                  <button onClick={() => setShowSwapModal(false)} className="text-textMuted text-2xl leading-none">×</button>
                </div>
                <p className="text-xs text-textMuted">Same muscle group, your equipment</p>
                <div className="space-y-2">
                  {getSwapSuggestions(
                    currentLog.exerciseId,
                    profile?.equipment ?? [],
                  ).map(swap => (
                    <button
                      key={swap.id}
                      onClick={() => {
                        swapExercise(swap.id)
                        setShowSwapModal(false)
                        setDemoTab('muscles')
                      }}
                      className="w-full bg-surface rounded-xl p-4 text-left active:scale-95 transition-transform"
                    >
                      <p className="text-sm font-semibold text-textPrimary">{swap.name}</p>
                      <p className="text-xs text-textMuted capitalize">{swap.category} · {swap.difficulty}</p>
                      <p className="text-xs text-textMuted mt-1 italic">{swap.coachingCues[0]}</p>
                    </button>
                  ))}
                  {getSwapSuggestions(currentLog.exerciseId, profile?.equipment ?? []).length === 0 && (
                    <p className="text-sm text-textMuted text-center py-4">No alternatives found for your equipment.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Set table */}
          <div className="bg-surface rounded-2xl p-4 space-y-2">
            {/* Adaptive weight suggestion banner */}
            {suggestion && suggestion.weight > 0 && (
              <div className={`rounded-xl px-3 py-2 mb-3 flex items-center justify-between gap-2 ${
                suggestion.confidence === 'high' ? 'bg-success/10 border border-success/20' :
                suggestion.confidence === 'medium' ? 'bg-carbs/10 border border-carbs/20' :
                'bg-surface2'
              }`}>
                <div>
                  <p className="text-xs font-semibold text-textPrimary">
                    💡 Suggested: {suggestion.weight} lbs
                  </p>
                  <p className="text-[10px] text-textMuted mt-0.5">{suggestion.reason}</p>
                </div>
                <button
                  onClick={() => fillSuggestedWeight(suggestion.weight)}
                  className="shrink-0 text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-lg active:scale-95 transition-transform"
                >
                  Use
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 mb-2 px-3">
              <span className="w-6 text-center text-[10px] font-body text-textMuted">#</span>
              <span className="w-16 text-center text-[10px] font-body text-textMuted">Weight</span>
              <span className="w-16 text-center text-[10px] font-body text-textMuted">Reps</span>
              <span className="w-14 text-center text-[10px] font-body text-textMuted">RPE</span>
              <span className="w-8 text-center text-[10px] font-body text-textMuted">✓</span>
            </div>
            {currentLog.sets.map((set, i) => (
              <SetRow key={i} setNum={i + 1} log={set} onUpdate={(u) => updateSet(i, u)} />
            ))}
          </div>

          {/* Rest timer */}
          {resting && (
            <div className="flex justify-center py-4">
              <RestTimer
                seconds={currentExercise.restSeconds}
                onDone={() => setResting(false)}
              />
            </div>
          )}
          {!resting && (
            <button
              onClick={() => setResting(true)}
              className="w-full py-3 rounded-xl bg-surface2 text-textMuted font-body text-sm"
            >
              Start Rest Timer ({currentExercise.restSeconds}s)
            </button>
          )}
        </div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surface2 px-4 py-4">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <button
              onClick={() => setExerciseIndex((i) => Math.max(0, i - 1))}
              disabled={exerciseIndex === 0}
              className="flex-1 py-3 rounded-xl bg-surface2 text-textMuted font-body font-medium disabled:opacity-40 flex items-center justify-center gap-1"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            {exerciseIndex < workout.exercises.length - 1 ? (
              <button
                onClick={() => setExerciseIndex((i) => i + 1)}
                className="flex-1 py-3 rounded-xl bg-accent text-white font-display font-bold flex items-center justify-center gap-1"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl bg-accentGreen text-white font-display font-bold flex items-center justify-center gap-1"
              >
                Finish <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Cooldown phase ──────────────────────────────────────────────────────
  if (phase === 'cooldown') {
    const currentCooldown = cooldownExercises[cooldownIndex]

    if (!currentCooldown) {
      setPhase('summary')
      return null
    }

    function handleCooldownNext() {
      if (cooldownIndex < cooldownExercises.length - 1) {
        setCooldownIndex(i => i + 1)
      } else {
        setPhase('summary')
      }
    }

    return (
      <div className="min-h-screen bg-pageBg flex flex-col animate-[page-fade-in_0.3s_ease-out]">
        <div className="px-4 pt-8 pb-4 flex items-center justify-between">
          <button onClick={() => navigate('/train')} className="p-2 -ml-2 text-textMuted">
            <X size={22} />
          </button>
          <div className="text-center">
            <h2 className="text-base font-display font-bold text-textPrimary">Cool Down 🧘</h2>
            <p className="text-xs font-body text-textMuted">{cooldownIndex + 1} of {cooldownExercises.length}</p>
          </div>
          <button
            onClick={() => setPhase('summary')}
            className="text-xs font-body text-textMuted active:opacity-60"
          >
            Skip
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center px-4 pb-2">
          {cooldownExercises.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i < cooldownIndex ? 'bg-accentGreen w-4' : i === cooldownIndex ? 'bg-accent w-6' : 'bg-surface2 w-4'
              }`}
            />
          ))}
        </div>

        <div className="flex-1 px-4 overflow-y-auto pb-8 space-y-5">
          {/* Muscle map + name */}
          <div className="bg-surface rounded-2xl p-5 flex items-center gap-4">
            <MuscleMap
              primary={currentCooldown.targetSlots}
              size={90}
            />
            <div className="flex-1">
              <h3 className="text-xl font-display font-bold text-textPrimary">{currentCooldown.name}</h3>
              <p className="text-xs font-body text-textMuted mt-1 capitalize">
                {currentCooldown.targetSlots.join(', ')}
              </p>
            </div>
          </div>

          {/* Instruction */}
          <div className="bg-accent/10 border border-accent/20 rounded-2xl px-4 py-4">
            <p className="text-xs font-body font-semibold text-accent mb-1">How to do it</p>
            <p className="text-sm font-body text-textPrimary leading-relaxed">{currentCooldown.instruction}</p>
          </div>

          {/* Timer */}
          <div className="flex justify-center py-4">
            <WarmupCountdown
              key={`${currentCooldown.id}-${cooldownIndex}`}
              exercise={currentCooldown}
              onNext={handleCooldownNext}
            />
          </div>
        </div>
      </div>
    )
  }

  // ── Summary phase ───────────────────────────────────────────────────────
  if (phase === 'summary') {
    const duration = Math.round((Date.now() - startTime) / 60000)

    return (
      <div className="min-h-screen bg-pageBg flex flex-col px-6 py-8 animate-[page-fade-in_0.3s_ease-out]">
        <div className="flex-1 space-y-6">
          <div className="text-center pt-4">
            <div className="w-16 h-16 rounded-full bg-accentGreen/10 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-accentGreen" />
            </div>
            <h1 className="text-3xl font-display font-bold text-textPrimary">Workout Done!</h1>
            <p className="text-textMuted font-body mt-1">{workout.name}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Sets', value: completedSets },
              { label: 'Duration', value: `${duration}m` },
              { label: 'Exercises', value: workout.exercises.length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface rounded-2xl p-4 text-center">
                <p className="text-2xl font-display font-bold text-textPrimary">{value}</p>
                <p className="text-xs font-body text-textMuted">{label}</p>
              </div>
            ))}
          </div>

          {/* PRs */}
          {newPRs.length > 0 && (
            <div className="bg-surface rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={18} className="text-carbs" />
                <h3 className="font-display font-semibold text-textPrimary">New Personal Records!</h3>
              </div>
              <div className="space-y-2">
                {newPRs.map((pr, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <p className="text-sm font-body text-textPrimary">{pr!.name}</p>
                    <p className="text-sm font-display font-bold text-carbs">
                      {pr!.weight} lbs × {pr!.reps}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/train')}
          className="w-full py-4 rounded-2xl bg-accent text-white font-display font-bold text-lg"
        >
          Back to Train
        </button>
      </div>
    )
  }

  return null
}
