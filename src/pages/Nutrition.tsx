import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight } from 'lucide-react'
import { getProfile, getFoodLogsByDate } from '../lib/storage'
import type { MealCategory } from '../types'
import { MEAL_CATEGORY_LABELS } from '../lib/mealCategory'
import { WaterTracker } from '../components/WaterTracker'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

const MEAL_ORDER: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default function Nutrition() {
  const navigate = useNavigate()
  const profile = getProfile()
  const today = todayStr()
  const logs = getFoodLogsByDate(today)
  const targets = profile?.dailyTargets

  const totals = useMemo(
    () =>
      logs.reduce(
        (acc, e) => ({
          calories: acc.calories + e.confirmed.calories,
          protein: acc.protein + e.confirmed.protein,
          carbs: acc.carbs + e.confirmed.carbs,
          fat: acc.fat + e.confirmed.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [logs]
  )

  const grouped = useMemo(() => {
    return MEAL_ORDER.map((cat) => ({
      category: cat,
      entries: logs.filter((e) => e.mealCategory === cat),
    }))
  }, [logs])

  return (
    <div className="px-4 py-6 space-y-5 animate-[page-fade-in_0.35s_ease-out]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-textPrimary">Nutrition</h1>
        <button
          onClick={() => navigate('/nutrition/history')}
          className="text-sm font-body text-accent"
        >
          History
        </button>
      </div>

      {/* Mini summary */}
      {targets && (
        <div className="bg-surface rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-body text-textMuted uppercase tracking-wide">Today</p>
            <p className="text-sm font-display font-bold text-calorie">{totals.calories} kcal</p>
          </div>
          <div className="flex gap-2 mb-3">
            {[
              { label: 'Protein', value: totals.protein, target: targets.protein, color: 'bg-protein' },
              { label: 'Carbs', value: totals.carbs, target: targets.carbs, color: 'bg-carbs' },
              { label: 'Fat', value: totals.fat, target: targets.fat, color: 'bg-fat' },
            ].map(({ label, value, target, color }) => (
              <div key={label} className="flex-1">
                <div className="h-1.5 bg-surface2 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full ${color} rounded-full`}
                    style={{ width: `${Math.min((value / target) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] font-body text-textMuted text-center">{value}g</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Cals', value: totals.calories, target: targets.calories, color: 'text-calorie' },
              { label: 'Protein', value: totals.protein, target: targets.protein, color: 'text-protein' },
              { label: 'Carbs', value: totals.carbs, target: targets.carbs, color: 'text-carbs' },
              { label: 'Fat', value: totals.fat, target: targets.fat, color: 'text-fat' },
            ].map(({ label, value, target, color }) => (
              <div key={label} className="text-center">
                <p className={`text-sm font-display font-bold ${color}`}>{value}</p>
                <p className="text-[10px] font-body text-textMuted">/ {target}</p>
                <p className="text-[10px] font-body text-textMuted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Water tracking */}
      <WaterTracker />

      {/* Meal sections */}
      {grouped.map(({ category, entries }) => (
        <div key={category}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-display font-semibold text-textPrimary">
              {MEAL_CATEGORY_LABELS[category]}
            </h2>
            {entries.length > 0 && (
              <p className="text-xs font-body text-textMuted">
                {entries.reduce((acc, e) => acc + e.confirmed.calories, 0)} kcal
              </p>
            )}
          </div>

          {entries.length === 0 ? (
            <button
              onClick={() => navigate('/nutrition/log')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed border-surface2 text-textMuted hover:border-accent/30 transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm font-body">Add {MEAL_CATEGORY_LABELS[category].toLowerCase()}</span>
            </button>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => navigate('/nutrition/history')}
                  className="w-full bg-surface rounded-2xl px-4 py-3 flex items-center gap-3 text-left"
                >
                  {entry.photoDataUrl ? (
                    <img
                      src={entry.photoDataUrl}
                      alt={entry.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-surface2 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🍽️</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-textPrimary text-sm truncate">{entry.name}</p>
                    <p className="text-xs font-body text-textMuted">
                      P: {entry.confirmed.protein}g · C: {entry.confirmed.carbs}g · F: {entry.confirmed.fat}g
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <p className="text-sm font-display font-bold text-calorie">{entry.confirmed.calories}</p>
                    <ChevronRight size={14} className="text-textMuted" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* FAB */}
      <div className="fixed bottom-24 right-4 z-40">
        <button
          onClick={() => navigate('/nutrition/log')}
          className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center shadow-none"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  )
}
