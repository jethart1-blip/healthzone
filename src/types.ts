export type Sex = 'male' | 'female'

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active'

export type NutritionGoal =
  | 'lose_weight'
  | 'maintain'
  | 'gain_muscle'
  | 'body_recomp'

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'resistance_band'
  | 'pull_up_bar'
  | 'bench'
  | 'ez_bar'

export type MuscleGroupSlot =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'forearms'

export type SplitId =
  | 'full_body'
  | 'upper_lower'
  | 'push_pull_legs'
  | 'bro_split'
  | 'ppl_upper_lower'
  | 'arnold_split'
  | 'custom'

export type FitnessGoal =
  | 'build_muscle'
  | 'lose_fat'
  | 'get_stronger'
  | 'improve_endurance'
  | 'body_recomp'
  | 'general_fitness'

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
  saturatedFat?: number
  cholesterol?: number
}

export interface DailyTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
  source: 'ai_generated' | 'manual'
}

export interface FoodLogEntry {
  id: string
  date: string
  mealCategory: MealCategory
  name: string
  photoDataUrl?: string
  description?: string
  aiEstimate: NutritionInfo
  confirmed: NutritionInfo
}

export interface WeightEntry {
  id: string
  date: string
  weightLbs: number
}

export interface ExerciseDefinition {
  id: string
  name: string
  slot: MuscleGroupSlot
  secondarySlots?: MuscleGroupSlot[]
  equipment: EquipmentType[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  coachingCues: string[]
  category: 'compound' | 'isolation' | 'bodyweight' | 'cardio'
}

export interface Exercise {
  id: string
  slot: MuscleGroupSlot
  exerciseId: string
  sets: number
  targetRepsMin: number
  targetRepsMax: number
  restSeconds: number
  notes?: string
}

export interface ProgramDay {
  id: string
  name: string
  exercises: Exercise[]
}

export interface Program {
  id: string
  splitId: SplitId
  days: ProgramDay[]
  createdAt: string
}

export interface SetLog {
  weight: number
  reps: number
  rpe?: number
  completed: boolean
}

export interface ExerciseLog {
  exerciseId: string
  sets: SetLog[]
}

export interface WorkoutLog {
  id: string
  date: string
  programDayId: string
  exercises: ExerciseLog[]
  readiness?: number
  durationMinutes?: number
  difficulty?: number
}

export interface CustomWorkout {
  id: string
  name: string
  exercises: Exercise[]
}

export interface UserProfile {
  name: string
  age: number
  weightLbs: number
  targetWeightLbs?: number
  heightInches: number
  sex: Sex
  activityLevel: ActivityLevel
  dailyTargets: DailyTargets
  fitnessGoal: FitnessGoal
  equipment: EquipmentType[]
  splitId: SplitId
  daysPerWeek: number
  createdAt: string
}
