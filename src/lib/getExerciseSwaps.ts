import type { EquipmentType } from '../types'
import { EXERCISE_LIBRARY } from '../data/exercises'

export function getSwapSuggestions(
  currentExerciseId: string,
  equipment: EquipmentType[],
  count = 5
): typeof EXERCISE_LIBRARY {
  const current = EXERCISE_LIBRARY.find(e => e.id === currentExerciseId)
  if (!current) return []

  return EXERCISE_LIBRARY
    .filter(e =>
      e.id !== currentExerciseId &&
      e.slot === current.slot &&
      e.equipment.some(eq => equipment.includes(eq))
    )
    .sort((a, b) => {
      const aMatch = a.category === current.category ? 0 : 1
      const bMatch = b.category === current.category ? 0 : 1
      const aDiff = a.difficulty === current.difficulty ? 0 : 1
      const bDiff = b.difficulty === current.difficulty ? 0 : 1
      return (aMatch + aDiff) - (bMatch + bDiff)
    })
    .slice(0, count)
}
