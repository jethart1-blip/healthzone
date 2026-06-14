import type { UserProfile, Program, ProgramDay, Exercise, SplitId, MuscleGroupSlot } from '../types'
import { getExercisesByEquipment } from '../data/exercises'

let idCounter = 0
function uid() {
  return `gen_${Date.now()}_${++idCounter}`
}

type DayTemplate = { name: string; slots: MuscleGroupSlot[] }

const SPLIT_TEMPLATES: Record<SplitId, DayTemplate[]> = {
  full_body: [
    { name: 'Full Body A', slots: ['chest', 'back', 'quads', 'shoulders', 'abs'] },
    { name: 'Full Body B', slots: ['back', 'chest', 'hamstrings', 'glutes', 'abs'] },
    { name: 'Full Body C', slots: ['shoulders', 'back', 'quads', 'triceps', 'biceps'] },
  ],
  upper_lower: [
    { name: 'Upper A', slots: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
    { name: 'Lower A', slots: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'] },
    { name: 'Upper B', slots: ['back', 'chest', 'shoulders', 'triceps', 'biceps'] },
    { name: 'Lower B', slots: ['hamstrings', 'quads', 'glutes', 'calves', 'abs'] },
  ],
  push_pull_legs: [
    { name: 'Push', slots: ['chest', 'shoulders', 'triceps'] },
    { name: 'Pull', slots: ['back', 'biceps', 'forearms'] },
    { name: 'Legs', slots: ['quads', 'hamstrings', 'glutes', 'calves'] },
  ],
  bro_split: [
    { name: 'Chest', slots: ['chest', 'triceps'] },
    { name: 'Back', slots: ['back', 'biceps'] },
    { name: 'Shoulders', slots: ['shoulders', 'forearms'] },
    { name: 'Legs', slots: ['quads', 'hamstrings', 'glutes', 'calves'] },
    { name: 'Arms', slots: ['biceps', 'triceps', 'abs'] },
  ],
  ppl_upper_lower: [
    { name: 'Push', slots: ['chest', 'shoulders', 'triceps'] },
    { name: 'Pull', slots: ['back', 'biceps'] },
    { name: 'Legs', slots: ['quads', 'hamstrings', 'glutes'] },
    { name: 'Upper', slots: ['chest', 'back', 'shoulders'] },
    { name: 'Lower', slots: ['quads', 'hamstrings', 'calves', 'abs'] },
  ],
  arnold_split: [
    { name: 'Chest & Back', slots: ['chest', 'back'] },
    { name: 'Shoulders & Arms', slots: ['shoulders', 'biceps', 'triceps'] },
    { name: 'Legs', slots: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'] },
  ],
  custom: [],
}

function pickExercisesForSlot(
  slot: MuscleGroupSlot,
  equipment: string[],
  fitnessGoal: string,
  count = 2
): Exercise[] {
  const available = getExercisesByEquipment(equipment as any).filter(
    (e) => e.slot === slot
  )
  if (available.length === 0) return []

  // Sort preference: compounds first for strength/muscle goals, mix for fat loss
  const sorted = [...available].sort((a, b) => {
    const isCompoundA = a.category === 'compound' ? 0 : 1
    const isCompoundB = b.category === 'compound' ? 0 : 1
    if (fitnessGoal === 'lose_fat' || fitnessGoal === 'improve_endurance') {
      return isCompoundA - isCompoundB
    }
    return isCompoundA - isCompoundB
  })

  const picked = sorted.slice(0, Math.min(count, sorted.length))

  return picked.map((ex) => ({
    id: uid(),
    slot: ex.slot,
    exerciseId: ex.id,
    sets: fitnessGoal === 'get_stronger' ? 5 : fitnessGoal === 'lose_fat' ? 3 : 4,
    targetRepsMin: fitnessGoal === 'get_stronger' ? 3 : fitnessGoal === 'lose_fat' ? 12 : 8,
    targetRepsMax: fitnessGoal === 'get_stronger' ? 5 : fitnessGoal === 'lose_fat' ? 15 : 12,
    restSeconds: fitnessGoal === 'get_stronger' ? 180 : fitnessGoal === 'lose_fat' ? 60 : 90,
  }))
}

export function generateProgram(profile: UserProfile): Program {
  const template = SPLIT_TEMPLATES[profile.splitId] ?? SPLIT_TEMPLATES.full_body
  const daysToUse = template.slice(0, Math.min(profile.daysPerWeek, template.length))

  const days: ProgramDay[] = daysToUse.map((dayTemplate) => {
    const exercises: Exercise[] = []
    dayTemplate.slots.forEach((slot) => {
      const count = slot === 'abs' || slot === 'calves' || slot === 'forearms' ? 1 : 2
      const exs = pickExercisesForSlot(slot, profile.equipment, profile.fitnessGoal, count)
      exercises.push(...exs)
    })

    return {
      id: uid(),
      name: dayTemplate.name,
      exercises,
    }
  })

  return {
    id: uid(),
    splitId: profile.splitId,
    days,
    createdAt: new Date().toISOString(),
  }
}
