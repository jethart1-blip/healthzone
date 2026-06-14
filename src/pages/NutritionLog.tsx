import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Camera, Type, ChevronRight } from 'lucide-react'
import { analyzeFood } from '../lib/analyzeFood'
import { compressImage } from '../lib/compressImage'
import { addFoodLog, getFoodLogs } from '../lib/storage'
import { getCurrentMealCategory } from '../lib/mealCategory'
import MealReviewForm from '../components/MealReviewForm'
import type { FoodLogEntry, NutritionInfo, MealCategory } from '../types'

type Stage = 'input' | 'loading' | 'review'

const FALLBACK_NUTRITION: NutritionInfo = {
  calories: 300,
  protein: 15,
  carbs: 35,
  fat: 10,
}

export default function NutritionLog() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<Stage>('input')
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>()
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [reviewData, setReviewData] = useState<{
    name: string
    nutrition: NutritionInfo
  } | null>(null)

  const recentMeals = getFoodLogs().slice(0, 5)

  async function handlePhotoSelect(file: File) {
    try {
      const compressed = await compressImage(file)
      setPhotoDataUrl(compressed)
    } catch {
      setError('Failed to process image')
    }
  }

  async function handleAnalyze() {
    if (!photoDataUrl && !description.trim()) return
    setStage('loading')
    setError(null)

    try {
      const result = await analyzeFood(photoDataUrl, description || undefined)
      setReviewData(result)
      setStage('review')
    } catch {
      setError('Analysis failed. Please try again or enter manually.')
      setStage('input')
    }
  }

  function handleSave(data: { name: string; category: MealCategory; nutrition: NutritionInfo }) {
    const entry: FoodLogEntry = {
      id: `fl_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      mealCategory: data.category,
      name: data.name,
      photoDataUrl,
      description: description || undefined,
      aiEstimate: reviewData?.nutrition ?? FALLBACK_NUTRITION,
      confirmed: data.nutrition,
    }
    addFoodLog(entry)
    navigate('/nutrition')
  }

  function handleRecentMeal(entry: FoodLogEntry) {
    setReviewData({ name: entry.name, nutrition: entry.confirmed })
    setStage('review')
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (stage === 'loading') {
    return (
      <div className="min-h-screen bg-pageBg flex flex-col items-center justify-center gap-6">
        <div className="text-5xl animate-bounce">🍽️</div>
        <div className="space-y-2 text-center">
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="font-body text-textMuted text-sm">Analyzing your meal...</p>
        </div>
      </div>
    )
  }

  // ── Review ──────────────────────────────────────────────────────────────
  if (stage === 'review' && reviewData) {
    return (
      <div className="min-h-screen bg-pageBg flex flex-col animate-[page-fade-in_0.3s_ease-out]">
        <div className="px-4 pt-8 pb-4 flex items-center gap-3">
          <button onClick={() => setStage('input')} className="p-2 -ml-2 text-textMuted">
            <X size={22} />
          </button>
          <h1 className="text-xl font-display font-bold text-textPrimary">Review Meal</h1>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          <MealReviewForm
            initialName={reviewData.name}
            initialCategory={getCurrentMealCategory()}
            initialNutrition={reviewData.nutrition}
            photoDataUrl={photoDataUrl}
            onSave={handleSave}
            saveLabel="Save Meal"
          />
        </div>
      </div>
    )
  }

  // ── Input ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-pageBg flex flex-col animate-[page-fade-in_0.3s_ease-out]">
      <div className="px-4 pt-8 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/nutrition')} className="p-2 -ml-2 text-textMuted">
          <X size={22} />
        </button>
        <h1 className="text-xl font-display font-bold text-textPrimary">Log a Meal</h1>
      </div>

      <div className="flex-1 px-4 pb-8 space-y-5 overflow-y-auto">
        {/* Photo upload */}
        <div>
          {photoDataUrl ? (
            <div className="relative rounded-2xl overflow-hidden h-48">
              <img src={photoDataUrl} alt="Meal" className="w-full h-full object-cover" />
              <button
                onClick={() => setPhotoDataUrl(undefined)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 rounded-2xl border-2 border-dashed border-surface2 flex flex-col items-center justify-center gap-2 text-textMuted hover:border-accent/40 transition-colors"
            >
              <Camera size={32} className="text-textMuted" />
              <p className="font-body text-sm">Take or upload a photo</p>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])}
          />
        </div>

        {/* Text description */}
        <div>
          <label className="block text-xs font-body font-semibold text-textMuted mb-1.5 uppercase tracking-wide">
            Or describe your meal
          </label>
          <div className="relative">
            <Type size={16} className="absolute left-4 top-3.5 text-textMuted" />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Grilled salmon with rice and broccoli"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-surface text-textPrimary font-body text-sm border-2 border-surface2 focus:border-accent focus:outline-none resize-none"
              rows={3}
            />
          </div>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3">
            <p className="text-sm font-body text-danger">{error}</p>
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={!photoDataUrl && !description.trim()}
          className="w-full py-4 rounded-2xl bg-accent text-white font-display font-bold text-base disabled:opacity-50"
        >
          Analyze with AI
        </button>

        {/* Recent meals */}
        {recentMeals.length > 0 && (
          <div>
            <h2 className="text-base font-display font-semibold text-textPrimary mb-3">Recent Meals</h2>
            <div className="space-y-2 overflow-x-hidden">
              {recentMeals.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handleRecentMeal(entry)}
                  className="w-full bg-surface rounded-2xl px-4 py-3 flex items-center gap-3 text-left"
                >
                  {entry.photoDataUrl ? (
                    <img
                      src={entry.photoDataUrl}
                      alt={entry.name}
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🍽️</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-textPrimary text-sm truncate">{entry.name}</p>
                    <p className="text-xs font-body text-textMuted">{entry.confirmed.calories} kcal</p>
                  </div>
                  <ChevronRight size={14} className="text-textMuted flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
