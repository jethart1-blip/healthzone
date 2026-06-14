import type {
  UserProfile,
  FoodLogEntry,
  WeightEntry,
  WorkoutLog,
  Program,
  CustomWorkout,
  WaterEntry,
  MealTemplate,
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
  water: `${PREFIX}water`,
  mealTemplates: `${PREFIX}meal_templates`,
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

// Water tracking
function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getWaterEntries(): WaterEntry[] {
  return safeGet<WaterEntry[]>(KEYS.water, [])
}

export function getTodayWater(): number {
  const key = todayKey()
  return getWaterEntries().find((e) => e.date === key)?.amountMl ?? 0
}

export function addWater(amountMl: number): void {
  const key = todayKey()
  const entries = getWaterEntries()
  const idx = entries.findIndex((e) => e.date === key)
  if (idx >= 0) {
    entries[idx].amountMl += amountMl
  } else {
    entries.push({ id: crypto.randomUUID(), date: key, amountMl })
  }
  safeSet(KEYS.water, entries)
}

export function resetTodayWater(): void {
  const key = todayKey()
  safeSet(KEYS.water, getWaterEntries().filter((e) => e.date !== key))
}

// Meal templates
export function getMealTemplates(): MealTemplate[] {
  return safeGet<MealTemplate[]>(KEYS.mealTemplates, [])
}

export function saveMealTemplates(templates: MealTemplate[]): void {
  safeSet(KEYS.mealTemplates, templates)
}

export function addMealTemplate(template: MealTemplate): void {
  const templates = getMealTemplates()
  templates.push(template)
  saveMealTemplates(templates)
}

export function deleteMealTemplate(id: string): void {
  saveMealTemplates(getMealTemplates().filter((t) => t.id !== id))
}

// Reset
export function resetAllData(): void {
  Object.values(KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
}
