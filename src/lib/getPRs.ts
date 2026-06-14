import { getWorkoutLogs } from './storage'

export interface PREntry {
  weight: number
  reps: number
  date: string
}

export function getAllTimePR(exerciseId: string): PREntry | null {
  const logs = getWorkoutLogs()
  let best: PREntry | null = null

  for (const log of logs) {
    for (const exLog of log.exercises) {
      if (exLog.exerciseId !== exerciseId) continue
      for (const set of exLog.sets) {
        if (!set.completed || set.weight <= 0 || set.reps <= 0) continue
        // Use Epley formula for 1RM comparison: w * (1 + r/30)
        const estimated1RM = set.weight * (1 + set.reps / 30)
        const current1RM = best
          ? best.weight * (1 + best.reps / 30)
          : 0

        if (estimated1RM > current1RM) {
          best = { weight: set.weight, reps: set.reps, date: log.date }
        }
      }
    }
  }

  return best
}

// Common lift IDs for the PR section in Progress
export const KEY_LIFTS = [
  { exerciseId: 'quads_01', name: 'Back Squat' },
  { exerciseId: 'chest_01', name: 'Bench Press' },
  { exerciseId: 'back_01', name: 'Deadlift' },
  { exerciseId: 'shoulders_01', name: 'Overhead Press' },
  { exerciseId: 'back_02', name: 'Barbell Row' },
]
