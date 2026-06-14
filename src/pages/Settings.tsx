import { useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import {
  getProfile,
  saveProfile,
  saveProgram,
  setDayIndex,
  resetAllData,
} from '../lib/storage'
import { generateGoalsAI } from '../lib/calculateGoals'
import { generateProgram } from '../lib/generateProgram'
import type { UserProfile, ActivityLevel, FitnessGoal } from '../types'

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active: 'Very Active',
  extra_active: 'Extra Active',
}

const GOAL_LABELS: Record<FitnessGoal, string> = {
  build_muscle: 'Build Muscle',
  lose_fat: 'Lose Fat',
  get_stronger: 'Get Stronger',
  improve_endurance: 'Improve Endurance',
  body_recomp: 'Body Recomp',
  general_fitness: 'General Fitness',
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-surface2 last:border-0">
      <p className="text-sm font-body text-textMuted">{label}</p>
      <p className="text-sm font-body font-medium text-textPrimary">{value}</p>
    </div>
  )
}

export default function Settings() {
  const [profile, setProfileState] = useState<UserProfile | null>(getProfile())
  const [profileChanged, setProfileChanged] = useState(false)
  const [fitnessChanged, setFitnessChanged] = useState(false)
  const [regeneratingNutrition, setRegeneratingNutrition] = useState(false)
  const [regeneratingProgram, setRegeneratingProgram] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  // Editable targets
  const [targetsEditing, setTargetsEditing] = useState(false)
  const [editCalories, setEditCalories] = useState(profile?.dailyTargets.calories.toString() ?? '')
  const [editProtein, setEditProtein] = useState(profile?.dailyTargets.protein.toString() ?? '')
  const [editCarbs, setEditCarbs] = useState(profile?.dailyTargets.carbs.toString() ?? '')
  const [editFat, setEditFat] = useState(profile?.dailyTargets.fat.toString() ?? '')

  if (!profile) return (
    <div className="px-4 py-6">
      <p className="text-textMuted font-body">No profile found.</p>
    </div>
  )

  async function handleRegenerateNutrition() {
    setRegeneratingNutrition(true)
    try {
      const goals = await generateGoalsAI(profile!)
      const updated = { ...profile!, dailyTargets: goals }
      saveProfile(updated)
      setProfileState(updated)
      setProfileChanged(false)
    } finally {
      setRegeneratingNutrition(false)
    }
  }

  function handleRegenerateProgram() {
    setRegeneratingProgram(true)
    setTimeout(() => {
      const program = generateProgram(profile!)
      saveProgram(program)
      setDayIndex(0)
      setFitnessChanged(false)
      setRegeneratingProgram(false)
    }, 600)
  }

  function handleSaveTargets() {
    if (!profile) return
    const updated: UserProfile = {
      ...profile,
      dailyTargets: {
        calories: parseInt(editCalories) || profile.dailyTargets.calories,
        protein: parseInt(editProtein) || profile.dailyTargets.protein,
        carbs: parseInt(editCarbs) || profile.dailyTargets.carbs,
        fat: parseInt(editFat) || profile.dailyTargets.fat,
        source: 'manual' as const,
      },
    }
    saveProfile(updated)
    setProfileState(updated)
    setTargetsEditing(false)
  }

  function handleReset() {
    resetAllData()
    window.location.href = '/welcome'
  }

  const sourceLabel = profile.dailyTargets.source === 'ai_generated' ? 'AI Generated' : 'Manual'

  return (
    <div className="px-4 py-6 space-y-5 animate-[page-fade-in_0.35s_ease-out]">
      <h1 className="text-2xl font-display font-bold text-textPrimary">Settings</h1>

      {/* Profile card */}
      <div className="bg-surface rounded-2xl p-5 space-y-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-textPrimary">Profile</h2>
          <button className="text-xs font-body text-accent">Edit</button>
        </div>
        <InfoRow label="Name" value={profile.name} />
        <InfoRow label="Age" value={`${profile.age} years`} />
        <InfoRow label="Sex" value={profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1)} />
        <InfoRow label="Weight" value={`${profile.weightLbs} lbs`} />
        {profile.targetWeightLbs && <InfoRow label="Target Weight" value={`${profile.targetWeightLbs} lbs`} />}
        <InfoRow label="Height" value={`${Math.floor(profile.heightInches / 12)}' ${profile.heightInches % 12}"`} />
        <InfoRow label="Activity Level" value={ACTIVITY_LABELS[profile.activityLevel]} />
      </div>

      {/* Profile change banner */}
      {profileChanged && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <p className="text-sm font-body text-amber-800">Profile changed — regenerate nutrition targets?</p>
          </div>
          <button
            onClick={handleRegenerateNutrition}
            className="text-xs font-body font-semibold text-accent"
          >
            Regenerate
          </button>
        </div>
      )}

      {/* Fitness card */}
      <div className="bg-surface rounded-2xl p-5 space-y-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-textPrimary">Fitness</h2>
          <button className="text-xs font-body text-accent">Edit</button>
        </div>
        <InfoRow label="Goal" value={GOAL_LABELS[profile.fitnessGoal]} />
        <InfoRow label="Equipment" value={profile.equipment.length > 0 ? `${profile.equipment.length} items` : 'None'} />
        <InfoRow label="Days/Week" value={profile.daysPerWeek} />
        <InfoRow label="Split" value={profile.splitId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} />
      </div>

      {/* Fitness change banner */}
      {fitnessChanged && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <p className="text-sm font-body text-amber-800">Fitness settings changed — regenerate program?</p>
          </div>
          <button
            onClick={handleRegenerateProgram}
            disabled={regeneratingProgram}
            className="text-xs font-body font-semibold text-accent"
          >
            Regenerate
          </button>
        </div>
      )}

      {/* Daily Targets card */}
      <div className="bg-surface rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-textPrimary">Daily Targets</h2>
            <span className={`text-xs font-body px-2 py-0.5 rounded-full mt-1 inline-block ${
              profile.dailyTargets.source === 'ai_generated'
                ? 'bg-accentGreen/10 text-accentGreen'
                : 'bg-surface2 text-textMuted'
            }`}>
              {sourceLabel}
            </span>
          </div>
          <button
            onClick={handleRegenerateNutrition}
            disabled={regeneratingNutrition}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface2 text-textMuted text-xs font-body font-medium"
          >
            <RefreshCw size={13} className={regeneratingNutrition ? 'animate-spin' : ''} />
            Regenerate
          </button>
        </div>

        {targetsEditing ? (
          <div className="space-y-3">
            {[
              { label: 'Calories (kcal)', val: editCalories, set: setEditCalories },
              { label: 'Protein (g)', val: editProtein, set: setEditProtein },
              { label: 'Carbs (g)', val: editCarbs, set: setEditCarbs },
              { label: 'Fat (g)', val: editFat, set: setEditFat },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label className="text-xs font-body text-textMuted mb-1 block">{label}</label>
                <input
                  type="number"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface2 text-textPrimary font-body text-sm border border-transparent focus:border-accent focus:outline-none"
                />
              </div>
            ))}
            <div className="flex gap-3">
              <button
                onClick={() => setTargetsEditing(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface2 text-textMuted font-body font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTargets}
                className="flex-1 py-2.5 rounded-xl bg-accent text-white font-display font-semibold text-sm"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <InfoRow label="Calories" value={`${profile.dailyTargets.calories} kcal`} />
            <InfoRow label="Protein" value={`${profile.dailyTargets.protein}g`} />
            <InfoRow label="Carbs" value={`${profile.dailyTargets.carbs}g`} />
            <InfoRow label="Fat" value={`${profile.dailyTargets.fat}g`} />
            <button
              onClick={() => setTargetsEditing(true)}
              className="mt-2 text-sm font-body text-accent"
            >
              Edit manually
            </button>
          </div>
        )}
      </div>

      {/* Reset All Data */}
      <div className="bg-surface rounded-2xl p-5">
        <h2 className="font-display font-semibold text-textPrimary mb-3">Danger Zone</h2>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full py-3 rounded-xl border-2 border-danger/30 text-danger font-body font-medium text-sm"
          >
            Reset All Data
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-body text-textMuted">
              This will delete all your data permanently. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface2 text-textMuted font-body font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-danger text-white font-display font-semibold text-sm"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pb-4 text-center">
        <p className="text-xs font-body text-textMuted">Health Zone · Made with care</p>
      </div>
    </div>
  )
}
