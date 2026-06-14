import { useState } from 'react'
import type { MealCategory, NutritionInfo } from '../types'
import { MEAL_CATEGORY_LABELS } from '../lib/mealCategory'

interface MealReviewFormProps {
  initialName: string
  initialCategory: MealCategory
  initialNutrition: NutritionInfo
  photoDataUrl?: string
  onSave: (data: {
    name: string
    category: MealCategory
    nutrition: NutritionInfo
  }) => void
  onSaveAsTemplate?: (templateName: string, data: { name: string; category: MealCategory; nutrition: NutritionInfo }) => void
  saveLabel?: string
}

const MEAL_CATEGORIES: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack']
const PORTION_MULTIPLIERS = [0.5, 1, 1.5, 2] as const

export default function MealReviewForm({
  initialName,
  initialCategory,
  initialNutrition,
  photoDataUrl,
  onSave,
  onSaveAsTemplate,
  saveLabel = 'Save Meal',
}: MealReviewFormProps) {
  const [name, setName] = useState(initialName)
  const [category, setCategory] = useState<MealCategory>(initialCategory)
  const [multiplier, setMultiplier] = useState<number>(1)
  const [showSecondary, setShowSecondary] = useState(false)

  const scaled = (val?: number) =>
    val !== undefined ? Math.round(val * multiplier) : undefined

  const nutrition: NutritionInfo = {
    calories: Math.round(initialNutrition.calories * multiplier),
    protein: Math.round(initialNutrition.protein * multiplier),
    carbs: Math.round(initialNutrition.carbs * multiplier),
    fat: Math.round(initialNutrition.fat * multiplier),
    fiber: scaled(initialNutrition.fiber),
    sugar: scaled(initialNutrition.sugar),
    sodium: scaled(initialNutrition.sodium),
    saturatedFat: scaled(initialNutrition.saturatedFat),
    cholesterol: scaled(initialNutrition.cholesterol),
  }

  function handleSave() {
    onSave({ name, category, nutrition })
  }

  return (
    <div className="space-y-5">
      {/* Photo preview */}
      {photoDataUrl && (
        <div className="rounded-2xl overflow-hidden h-40 bg-surface2">
          <img src={photoDataUrl} alt="Meal" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs font-body font-semibold text-textMuted mb-1.5 uppercase tracking-wide">
          Meal Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface2 text-textPrimary font-body text-sm border border-transparent focus:border-accent focus:outline-none"
          placeholder="e.g. Grilled Chicken Bowl"
        />
      </div>

      {/* Category pills */}
      <div>
        <label className="block text-xs font-body font-semibold text-textMuted mb-2 uppercase tracking-wide">
          Meal
        </label>
        <div className="flex gap-2 flex-wrap">
          {MEAL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-body font-medium transition-all ${
                category === cat
                  ? 'bg-accent text-white'
                  : 'bg-surface2 text-textMuted'
              }`}
            >
              {MEAL_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Portion multiplier */}
      <div>
        <label className="block text-xs font-body font-semibold text-textMuted mb-2 uppercase tracking-wide">
          Portion
        </label>
        <div className="flex gap-2">
          {PORTION_MULTIPLIERS.map((m) => (
            <button
              key={m}
              onClick={() => setMultiplier(m)}
              className={`flex-1 py-2 rounded-xl text-sm font-body font-semibold transition-all ${
                multiplier === m
                  ? 'bg-accent text-white'
                  : 'bg-surface2 text-textMuted'
              }`}
            >
              {m}x
            </button>
          ))}
        </div>
      </div>

      {/* Primary nutrition grid */}
      <div>
        <label className="block text-xs font-body font-semibold text-textMuted mb-2 uppercase tracking-wide">
          Nutrition
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Calories', value: nutrition.calories, unit: 'kcal', color: 'text-calorie' },
            { label: 'Protein', value: nutrition.protein, unit: 'g', color: 'text-protein' },
            { label: 'Carbs', value: nutrition.carbs, unit: 'g', color: 'text-carbs' },
            { label: 'Fat', value: nutrition.fat, unit: 'g', color: 'text-fat' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="bg-surface2 rounded-xl px-4 py-3">
              <p className="text-xs font-body text-textMuted">{label}</p>
              <p className={`text-xl font-display font-bold ${color}`}>
                {value}
                <span className="text-xs font-body text-textMuted ml-1">{unit}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary details toggle */}
      <button
        onClick={() => setShowSecondary(!showSecondary)}
        className="text-sm font-body text-accent underline-offset-2"
      >
        {showSecondary ? 'Hide details' : 'Show more details'}
      </button>

      {showSecondary && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Fiber', value: nutrition.fiber },
            { label: 'Sugar', value: nutrition.sugar },
            { label: 'Sodium', value: nutrition.sodium },
            { label: 'Sat. Fat', value: nutrition.saturatedFat },
            { label: 'Cholest.', value: nutrition.cholesterol },
          ].map(
            ({ label, value }) =>
              value !== undefined && (
                <div key={label} className="bg-surface2 rounded-xl px-3 py-2 text-center">
                  <p className="text-[10px] font-body text-textMuted">{label}</p>
                  <p className="text-sm font-display font-semibold text-textPrimary">{value}g</p>
                </div>
              )
          )}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!name.trim()}
        className="w-full py-4 rounded-2xl bg-accent text-white font-display font-bold text-base disabled:opacity-50 transition-opacity"
      >
        {saveLabel}
      </button>

      {onSaveAsTemplate && (
        <button
          onClick={() => {
            const templateName = prompt('Template name?')
            if (templateName?.trim()) onSaveAsTemplate(templateName.trim(), { name, category, nutrition })
          }}
          className="w-full py-2 rounded-xl bg-surface2 text-textMuted text-xs font-semibold active:scale-95 transition-transform"
        >
          💾 Save as Template
        </button>
      )}
    </div>
  )
}
