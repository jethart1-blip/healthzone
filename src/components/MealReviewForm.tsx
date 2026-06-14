import { useState, useEffect } from 'react'
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

interface Ingredient {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
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

  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [showIngredients, setShowIngredients] = useState(false)
  const [newIngName, setNewIngName] = useState('')
  const [newIngCals, setNewIngCals] = useState('')
  const [newIngProtein, setNewIngProtein] = useState('')
  const [newIngCarbs, setNewIngCarbs] = useState('')
  const [newIngFat, setNewIngFat] = useState('')

  const [nutrition, setNutrition] = useState<NutritionInfo>({
    calories: Math.round(initialNutrition.calories * multiplier),
    protein: Math.round(initialNutrition.protein * multiplier),
    carbs: Math.round(initialNutrition.carbs * multiplier),
    fat: Math.round(initialNutrition.fat * multiplier),
    fiber: initialNutrition.fiber !== undefined ? Math.round(initialNutrition.fiber) : undefined,
    sugar: initialNutrition.sugar !== undefined ? Math.round(initialNutrition.sugar) : undefined,
    sodium: initialNutrition.sodium !== undefined ? Math.round(initialNutrition.sodium) : undefined,
    saturatedFat: initialNutrition.saturatedFat !== undefined ? Math.round(initialNutrition.saturatedFat) : undefined,
    cholesterol: initialNutrition.cholesterol !== undefined ? Math.round(initialNutrition.cholesterol) : undefined,
  })

  // Recalculate from multiplier when no ingredients are active
  useEffect(() => {
    if (ingredients.length > 0) return
    setNutrition({
      calories: Math.round(initialNutrition.calories * multiplier),
      protein: Math.round(initialNutrition.protein * multiplier),
      carbs: Math.round(initialNutrition.carbs * multiplier),
      fat: Math.round(initialNutrition.fat * multiplier),
      fiber: initialNutrition.fiber !== undefined ? Math.round(initialNutrition.fiber * multiplier) : undefined,
      sugar: initialNutrition.sugar !== undefined ? Math.round(initialNutrition.sugar * multiplier) : undefined,
      sodium: initialNutrition.sodium !== undefined ? Math.round(initialNutrition.sodium * multiplier) : undefined,
      saturatedFat: initialNutrition.saturatedFat !== undefined ? Math.round(initialNutrition.saturatedFat * multiplier) : undefined,
      cholesterol: initialNutrition.cholesterol !== undefined ? Math.round(initialNutrition.cholesterol * multiplier) : undefined,
    })
  }, [multiplier, ingredients.length])

  // Override main macros from ingredients when any are present
  useEffect(() => {
    if (ingredients.length === 0) return
    setNutrition(prev => ({
      ...prev,
      calories: ingredients.reduce((s, i) => s + i.calories, 0),
      protein: ingredients.reduce((s, i) => s + i.protein, 0),
      carbs: ingredients.reduce((s, i) => s + i.carbs, 0),
      fat: ingredients.reduce((s, i) => s + i.fat, 0),
    }))
  }, [ingredients])

  function addIngredient() {
    if (!newIngName.trim()) return
    setIngredients(prev => [
      ...prev,
      {
        name: newIngName.trim(),
        calories: Number(newIngCals) || 0,
        protein: Number(newIngProtein) || 0,
        carbs: Number(newIngCarbs) || 0,
        fat: Number(newIngFat) || 0,
      },
    ])
    setNewIngName('')
    setNewIngCals('')
    setNewIngProtein('')
    setNewIngCarbs('')
    setNewIngFat('')
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

      {/* Edit ingredients toggle */}
      <button
        onClick={() => setShowIngredients(!showIngredients)}
        className="text-xs font-semibold text-accent underline"
      >
        {showIngredients ? 'Hide ingredients' : '🥗 Edit ingredients'}
      </button>

      {/* Ingredient editor */}
      {showIngredients && (
        <div className="bg-surface2 rounded-xl p-3 space-y-3">
          <p className="text-xs font-semibold text-textMuted">Ingredients</p>
          {ingredients.map((ing, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <p className="text-xs text-textPrimary flex-1">{ing.name} — {ing.calories} cal</p>
              <button
                onClick={() => setIngredients(prev => prev.filter((_, idx) => idx !== i))}
                className="text-danger text-xs"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="space-y-2">
            <input
              type="text"
              value={newIngName}
              onChange={e => setNewIngName(e.target.value)}
              placeholder="Ingredient name"
              className="w-full rounded-lg border border-surface2 bg-surface px-2 py-1.5 text-xs text-textPrimary focus:border-accent outline-none"
            />
            <div className="grid grid-cols-4 gap-1">
              {[
                { label: 'Cal', value: newIngCals, setter: setNewIngCals },
                { label: 'Pro', value: newIngProtein, setter: setNewIngProtein },
                { label: 'Carb', value: newIngCarbs, setter: setNewIngCarbs },
                { label: 'Fat', value: newIngFat, setter: setNewIngFat },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-[10px] text-textMuted">{f.label}</label>
                  <input
                    type="number"
                    value={f.value}
                    onChange={e => f.setter(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-surface2 bg-surface px-1.5 py-1 text-xs text-textPrimary focus:border-accent outline-none"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={addIngredient}
              className="w-full bg-accent/10 text-accent font-semibold rounded-lg py-1.5 text-xs active:scale-95 transition-transform"
            >
              + Add Ingredient
            </button>
          </div>
          {ingredients.length > 0 && (
            <p className="text-xs text-textMuted">Totals auto-calculated from ingredients above ↑</p>
          )}
        </div>
      )}

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

      {/* Portion multiplier — hidden when ingredients are active */}
      {ingredients.length === 0 && (
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
      )}

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
