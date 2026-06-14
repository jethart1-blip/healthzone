import type { UserProfile, DailyTargets } from '../types'

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
}

export function calculateGoals(profile: UserProfile): DailyTargets {
  const { weightLbs, heightInches, age, sex, activityLevel, fitnessGoal, targetWeightLbs } = profile
  const weightKg = weightLbs * 0.453592
  const heightCm = heightInches * 2.54

  // Mifflin-St Jeor BMR
  const bmr =
    sex === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55
  let tdee = bmr * multiplier

  // Goal-based adjustments
  if (fitnessGoal === 'lose_fat') {
    tdee -= 500
  } else if (fitnessGoal === 'build_muscle') {
    tdee += 250
  } else if (fitnessGoal === 'get_stronger') {
    tdee += 200
  } else if (fitnessGoal === 'body_recomp') {
    tdee -= 200
  }

  // Weight gap adjustment: if large gap, increase deficit/surplus slightly
  if (targetWeightLbs) {
    const gapLbs = weightLbs - targetWeightLbs
    if (gapLbs > 30 && fitnessGoal === 'lose_fat') {
      tdee -= 100
    } else if (gapLbs < -10 && fitnessGoal === 'build_muscle') {
      tdee += 100
    }
  }

  const calories = Math.round(Math.max(1200, tdee))

  // Macro splits based on goal
  let proteinRatio = 0.3
  let fatRatio = 0.25

  if (fitnessGoal === 'build_muscle' || fitnessGoal === 'get_stronger') {
    proteinRatio = 0.35
    fatRatio = 0.25
  } else if (fitnessGoal === 'lose_fat') {
    proteinRatio = 0.4
    fatRatio = 0.3
  } else if (fitnessGoal === 'body_recomp') {
    proteinRatio = 0.38
    fatRatio = 0.27
  }

  const protein = Math.round((calories * proteinRatio) / 4)
  const fat = Math.round((calories * fatRatio) / 9)
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4)

  return {
    calories,
    protein: Math.max(protein, 100),
    carbs: Math.max(carbs, 50),
    fat: Math.max(fat, 40),
    source: 'manual',
  }
}

export async function generateGoalsAI(profile: UserProfile): Promise<DailyTargets> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('/api/generate-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        age: profile.age,
        sex: profile.sex,
        weightLbs: profile.weightLbs,
        heightInches: profile.heightInches,
        activityLevel: profile.activityLevel,
        fitnessGoal: profile.fitnessGoal,
        targetWeightLbs: profile.targetWeightLbs,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    return { ...data, source: 'ai_generated' as const }
  } catch {
    return { ...calculateGoals(profile), source: 'manual' as const }
  }
}
