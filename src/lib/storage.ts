import type {
  UserProfile,
  FoodLogEntry,
  WeightEntry,
  WorkoutLog,
  Program,
  CustomWorkout,
} from '../types'

const PREFIX = 'healthzone_'

const KEYS = {
  profile: `${PREFIX}profile`,
  foodLogs: `${PREFIX}food_logs`,
  weightEntries: `${PREFIX}weight_entries`,
  workoutLogs: `${PREFIX}workout_logs`,
  program: `${PREFIX}program`,
  customWorkouts: `${PREFIX}custom_workouts`,
  dayIndex: `${PREFIX}day_index`,
} as const

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable — fail silently
  }
}

// Profile
export function getProfile(): UserProfile | null {
  return safeGet<UserProfile | null>(KEYS.profile, null)
}

export function saveProfile(profile: UserProfile): void {
  safeSet(KEYS.profile, profile)
}

// Food logs
export function getFoodLogs(): FoodLogEntry[] {
  return safeGet<FoodLogEntry[]>(KEYS.foodLogs, [])
}

export function getFoodLogsByDate(date: string): FoodLogEntry[] {
  return getFoodLogs().filter((e) => e.date === date)
}

export function addFoodLog(entry: FoodLogEntry): void {
  const logs = getFoodLogs()
  safeSet(KEYS.foodLogs, [entry, ...logs])
}

export function updateFoodLog(updated: FoodLogEntry): void {
  const logs = getFoodLogs().map((e) => (e.id === updated.id ? updated : e))
  safeSet(KEYS.foodLogs, logs)
}

export function deleteFoodLog(id: string): void {
  const logs = getFoodLogs().filter((e) => e.id !== id)
  safeSet(KEYS.foodLogs, logs)
}

// Weight entries
export function getWeightEntries(): WeightEntry[] {
  return safeGet<WeightEntry[]>(KEYS.weightEntries, [])
}

export function addOrUpdateWeightEntry(entry: WeightEntry): void {
  const entries = getWeightEntries()
  const idx = entries.findIndex((e) => e.date === entry.date)
  if (idx >= 0) {
    entries[idx] = entry
  } else {
    entries.unshift(entry)
  }
  entries.sort((a, b) => a.date.localeCompare(b.date))
  safeSet(KEYS.weightEntries, entries)
}

// Workout logs
export function getWorkoutLogs(): WorkoutLog[] {
  return safeGet<WorkoutLog[]>(KEYS.workoutLogs, [])
}

export function addWorkoutLog(log: WorkoutLog): void {
  const logs = getWorkoutLogs()
  safeSet(KEYS.workoutLogs, [log, ...logs])
}

// Program
export function getProgram(): Program | null {
  return safeGet<Program | null>(KEYS.program, null)
}

export function saveProgram(program: Program): void {
  safeSet(KEYS.program, program)
}

// Custom workouts
export function getCustomWorkouts(): CustomWorkout[] {
  return safeGet<CustomWorkout[]>(KEYS.customWorkouts, [])
}

export function saveCustomWorkout(workout: CustomWorkout): void {
  const workouts = getCustomWorkouts()
  const idx = workouts.findIndex((w) => w.id === workout.id)
  if (idx >= 0) {
    workouts[idx] = workout
  } else {
    workouts.push(workout)
  }
  safeSet(KEYS.customWorkouts, workouts)
}

export function saveCustomWorkouts(workouts: CustomWorkout[]): void {
  safeSet(KEYS.customWorkouts, workouts)
}

// Day index (tracks which program day is next)
export function getDayIndex(): number {
  return safeGet<number>(KEYS.dayIndex, 0)
}

export function setDayIndex(index: number): void {
  safeSet(KEYS.dayIndex, index)
}

export function advanceDayIndex(): void {
  const program = getProgram()
  if (!program) return
  const current = getDayIndex()
  setDayIndex((current + 1) % program.days.length)
}

// Reset
export function resetAllData(): void {
  Object.values(KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
}
