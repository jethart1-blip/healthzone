import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import type {
  Sex,
  ActivityLevel,
  FitnessGoal,
  EquipmentType,
  SplitId,
  UserProfile,
} from '../types'
import { saveProfile, saveProgram, setDayIndex } from '../lib/storage'
import { generateGoalsAI } from '../lib/calculateGoals'
import { generateProgram } from '../lib/generateProgram'

const TOTAL_STEPS = 8

const ACTIVITY_OPTIONS: { id: ActivityLevel; label: string; desc: string }[] = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little exercise' },
  { id: 'lightly_active', label: 'Lightly Active', desc: '1–3 days/week' },
  { id: 'moderately_active', label: 'Moderately Active', desc: '3–5 days/week' },
  { id: 'very_active', label: 'Very Active', desc: '6–7 days/week' },
]

const GOAL_OPTIONS: { id: FitnessGoal; label: string; emoji: string; desc: string }[] = [
  { id: 'build_muscle', label: 'Build Muscle', emoji: '💪', desc: 'Gain size and strength' },
  { id: 'lose_fat', label: 'Lose Fat', emoji: '🔥', desc: 'Burn fat, stay lean' },
  { id: 'get_stronger', label: 'Get Stronger', emoji: '🏋️', desc: 'Increase max lifts' },
  { id: 'improve_endurance', label: 'Endurance', emoji: '🏃', desc: 'Cardio & stamina' },
  { id: 'body_recomp', label: 'Recomp', emoji: '⚖️', desc: 'Lose fat, build muscle' },
  { id: 'general_fitness', label: 'General Fitness', emoji: '🌟', desc: 'Stay healthy & active' },
]

const EQUIPMENT_OPTIONS: { id: EquipmentType; label: string }[] = [
  { id: 'barbell', label: 'Barbell' },
  { id: 'dumbbell', label: 'Dumbbell' },
  { id: 'cable', label: 'Cable Machine' },
  { id: 'machine', label: 'Gym Machine' },
  { id: 'bodyweight', label: 'Bodyweight' },
  { id: 'kettlebell', label: 'Kettlebell' },
  { id: 'resistance_band', label: 'Bands' },
  { id: 'pull_up_bar', label: 'Pull-Up Bar' },
  { id: 'bench', label: 'Bench' },
  { id: 'ez_bar', label: 'EZ Bar' },
]

const SPLIT_OPTIONS: { id: SplitId; label: string; desc: string; days: string }[] = [
  { id: 'full_body', label: 'Full Body', desc: 'Hit everything each session', days: '2–4' },
  { id: 'upper_lower', label: 'Upper / Lower', desc: 'Split upper and lower body', days: '4' },
  { id: 'push_pull_legs', label: 'Push / Pull / Legs', desc: 'Classic PPL split', days: '3–6' },
  { id: 'bro_split', label: 'Bro Split', desc: 'One muscle group per day', days: '5' },
  { id: 'arnold_split', label: 'Arnold Split', desc: 'Classic 3-day program', days: '3–6' },
  { id: 'ppl_upper_lower', label: 'PPL + Upper/Lower', desc: 'High frequency 5-day', days: '5' },
  { id: 'custom', label: 'Custom Split', desc: 'Build your own workout split from scratch using the exercise library', days: 'any' },
]

interface GoalsPreview {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [goalsPreview, setGoalsPreview] = useState<GoalsPreview | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<Sex>('male')
  const [weightLbs, setWeightLbs] = useState('')
  const [targetWeightLbs, setTargetWeightLbs] = useState('')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately_active')
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('build_muscle')
  const [equipment, setEquipment] = useState<EquipmentType[]>(['barbell', 'dumbbell', 'bench'])
  const [splitId, setSplitId] = useState<SplitId>('push_pull_legs')
  const [daysPerWeek, setDaysPerWeek] = useState(3)

  const heightInches = parseInt(heightFt || '0') * 12 + parseInt(heightIn || '0')

  function toggleEquipment(eq: EquipmentType) {
    setEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    )
  }

  function canProceed(): boolean {
    switch (step) {
      case 1: return name.trim().length >= 2
      case 2: return parseInt(age) >= 13 && parseInt(age) <= 100
      case 3: return parseFloat(weightLbs) > 0 && heightInches >= 48 && parseFloat(targetWeightLbs) > 0
      case 4: return true
      case 5: return true
      case 6: return equipment.length > 0
      case 7: return true
      case 8: return goalsPreview !== null
      default: return true
    }
  }

  async function handleNext() {
    if (step === 7) {
      setStep(8)
      setLoading(true)
      const tempProfile = buildProfile({ calories: 2000, protein: 150, carbs: 200, fat: 70, source: 'manual' })
      try {
        const goals = await generateGoalsAI(tempProfile)
        setGoalsPreview(goals)
      } catch {
        setGoalsPreview({ calories: 2000, protein: 150, carbs: 200, fat: 70 })
      } finally {
        setLoading(false)
      }
      return
    }
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
    }
  }

  function buildProfile(targets: GoalsPreview & { source: 'ai_generated' | 'manual' }): UserProfile {
    return {
      name: name.trim(),
      age: parseInt(age),
      weightLbs: parseFloat(weightLbs),
      targetWeightLbs: parseFloat(targetWeightLbs) || undefined,
      heightInches,
      sex,
      activityLevel,
      fitnessGoal,
      equipment,
      splitId,
      daysPerWeek,
      dailyTargets: targets,
      createdAt: new Date().toISOString(),
    }
  }

  function handleGetStarted() {
    if (!goalsPreview) return
    const profile = buildProfile({ ...goalsPreview, source: 'ai_generated' })
    saveProfile(profile)
    if (splitId === 'custom') {
      navigate('/train/builder?onboarding=1')
      return
    }
    const program = generateProgram(profile)
    saveProgram(program)
    setDayIndex(0)
    navigate('/')
  }

  const progress = (step / TOTAL_STEPS) * 100

  return (
    <div key={step} className="min-h-screen bg-pageBg flex flex-col px-6 py-8 animate-[page-fade-in_0.3s_ease-out]">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => step > 1 && setStep((s) => s - 1)}
            className={`p-1 rounded-lg ${step === 1 ? 'invisible' : 'text-textMuted'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-body text-textMuted">
            Step {step} of {TOTAL_STEPS}
          </span>
          <div className="w-8" />
        </div>
        <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1">
        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-textPrimary mb-2">
                What's your name?
              </h1>
              <p className="text-textMuted font-body">Let's make this personal.</p>
            </div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-4 rounded-2xl bg-surface text-textPrimary font-body text-lg border-2 border-surface2 focus:border-accent focus:outline-none"
            />
          </div>
        )}

        {/* Step 2: Age + Sex */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-textPrimary mb-2">
                About you
              </h1>
              <p className="text-textMuted font-body">Used to calculate your metabolic rate.</p>
            </div>
            <div>
              <label className="block text-xs font-body font-semibold text-textMuted mb-2 uppercase tracking-wide">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                min={13}
                max={100}
                className="w-full px-4 py-4 rounded-2xl bg-surface text-textPrimary font-body text-lg border-2 border-surface2 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-body font-semibold text-textMuted mb-2 uppercase tracking-wide">Sex</label>
              <div className="flex gap-3">
                {(['male', 'female'] as Sex[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSex(s)}
                    className={`flex-1 py-4 rounded-2xl font-display font-bold capitalize text-lg transition-all ${
                      sex === s
                        ? 'bg-accent text-white'
                        : 'bg-surface border-2 border-surface2 text-textMuted'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Weight + Target + Height */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-3xl font-display font-bold text-textPrimary mb-2">
                Body stats
              </h1>
              <p className="text-textMuted font-body">Helps calculate your TDEE accurately.</p>
            </div>
            <div>
              <label className="block text-xs font-body font-semibold text-textMuted mb-2 uppercase tracking-wide">
                Current Weight (lbs)
              </label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                placeholder="175"
                className="w-full px-4 py-4 rounded-2xl bg-surface text-textPrimary font-body text-lg border-2 border-surface2 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-body font-semibold text-textMuted mb-2 uppercase tracking-wide">
                Target Weight (lbs)
              </label>
              <input
                type="number"
                value={targetWeightLbs}
                onChange={(e) => setTargetWeightLbs(e.target.value)}
                placeholder="165"
                className="w-full px-4 py-4 rounded-2xl bg-surface text-textPrimary font-body text-lg border-2 border-surface2 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-body font-semibold text-textMuted mb-2 uppercase tracking-wide">
                Height
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder="5"
                    min={3}
                    max={8}
                    className="w-full px-4 py-4 rounded-2xl bg-surface text-textPrimary font-body text-lg border-2 border-surface2 focus:border-accent focus:outline-none text-center"
                  />
                  <p className="text-center text-xs text-textMuted mt-1">ft</p>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="10"
                    min={0}
                    max={11}
                    className="w-full px-4 py-4 rounded-2xl bg-surface text-textPrimary font-body text-lg border-2 border-surface2 focus:border-accent focus:outline-none text-center"
                  />
                  <p className="text-center text-xs text-textMuted mt-1">in</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Activity Level */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-3xl font-display font-bold text-textPrimary mb-2">
                Activity level
              </h1>
              <p className="text-textMuted font-body">Outside of planned workouts.</p>
            </div>
            <div className="space-y-3">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setActivityLevel(opt.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all ${
                    activityLevel === opt.id
                      ? 'border-accent bg-accent/10'
                      : 'border-surface2 bg-surface'
                  }`}
                >
                  <div className="text-left">
                    <p className={`font-display font-semibold ${activityLevel === opt.id ? 'text-accent' : 'text-textPrimary'}`}>
                      {opt.label}
                    </p>
                    <p className="text-textMuted text-sm font-body">{opt.desc}</p>
                  </div>
                  {activityLevel === opt.id && (
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                      <Check size={14} strokeWidth={3} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Fitness Goal */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-3xl font-display font-bold text-textPrimary mb-2">
                Your goal
              </h1>
              <p className="text-textMuted font-body">This shapes your program and nutrition targets.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFitnessGoal(opt.id)}
                  className={`flex flex-col items-center py-5 px-3 rounded-2xl border-2 transition-all ${
                    fitnessGoal === opt.id
                      ? 'border-accent bg-accent/10'
                      : 'border-surface2 bg-surface'
                  }`}
                >
                  <span className="text-3xl mb-2">{opt.emoji}</span>
                  <p className={`font-display font-semibold text-sm text-center ${fitnessGoal === opt.id ? 'text-accent' : 'text-textPrimary'}`}>
                    {opt.label}
                  </p>
                  <p className="text-textMuted text-xs font-body text-center mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Equipment */}
        {step === 6 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-3xl font-display font-bold text-textPrimary mb-2">
                Equipment access
              </h1>
              <p className="text-textMuted font-body">Select everything available to you.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => toggleEquipment(opt.id)}
                  className={`px-4 py-2.5 rounded-full font-body font-medium text-sm border-2 transition-all ${
                    equipment.includes(opt.id)
                      ? 'border-accent bg-accent text-white'
                      : 'border-surface2 bg-surface text-textMuted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Training Split + Days */}
        {step === 7 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-3xl font-display font-bold text-textPrimary mb-2">
                Training split
              </h1>
              <p className="text-textMuted font-body">How you want to structure your workouts.</p>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-64">
              {SPLIT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSplitId(opt.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all ${
                    splitId === opt.id
                      ? 'border-accent bg-accent/10'
                      : 'border-surface2 bg-surface'
                  }`}
                >
                  <div className="text-left">
                    <p className={`font-display font-semibold ${splitId === opt.id ? 'text-accent' : 'text-textPrimary'}`}>
                      {opt.label}
                    </p>
                    <p className="text-textMuted text-sm font-body">{opt.desc}</p>
                    <p className="text-xs text-textMuted font-body">{opt.days} days/week</p>
                  </div>
                  {splitId === opt.id && (
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                      <Check size={14} strokeWidth={3} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-body font-semibold text-textMuted mb-2 uppercase tracking-wide">
                Days per week: {daysPerWeek}
              </label>
              <input
                type="range"
                min={2}
                max={6}
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-xs text-textMuted font-body mt-1">
                <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 8: AI Targets Preview */}
        {step === 8 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-textPrimary mb-2">
                Your targets
              </h1>
              <p className="text-textMuted font-body">AI-calculated based on your profile.</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-16 gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-surface2 border-t-accent animate-spin" />
                <p className="text-textMuted font-body text-sm">Calculating your targets...</p>
              </div>
            ) : goalsPreview ? (
              <div className="space-y-4">
                <div className="bg-surface rounded-2xl p-6 text-center">
                  <p className="text-xs font-body text-textMuted uppercase tracking-wide mb-1">Daily Calories</p>
                  <p className="text-5xl font-display font-extrabold text-calorie">{goalsPreview.calories}</p>
                  <p className="text-textMuted font-body text-sm mt-1">kcal / day</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Protein', value: goalsPreview.protein, color: 'text-protein' },
                    { label: 'Carbs', value: goalsPreview.carbs, color: 'text-carbs' },
                    { label: 'Fat', value: goalsPreview.fat, color: 'text-fat' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-surface rounded-2xl p-4 text-center">
                      <p className="text-xs font-body text-textMuted mb-1">{label}</p>
                      <p className={`text-2xl font-display font-bold ${color}`}>{value}g</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-accentGreen/10 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-accentGreen" />
                  <p className="text-xs font-body text-accentGreen font-medium">AI Generated — based on your stats</p>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="pt-6">
        {step === 8 ? (
          <button
            onClick={handleGetStarted}
            disabled={!goalsPreview || loading}
            className="w-full py-4 rounded-2xl bg-accent text-white font-display font-bold text-lg disabled:opacity-50"
          >
            Get Started
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full py-4 rounded-2xl bg-accent text-white font-display font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  )
}
