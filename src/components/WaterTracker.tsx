import { useState } from 'react'
import { Droplets } from 'lucide-react'
import { getTodayWater, addWater, resetTodayWater } from '../lib/storage'

const QUICK_ADD_OPTIONS = [150, 250, 350, 500]
const DAILY_GOAL_ML = 2500

export function WaterTracker() {
  const [todayMl, setTodayMl] = useState(getTodayWater())

  function handleAdd(ml: number) {
    addWater(ml)
    setTodayMl(getTodayWater())
  }

  function handleReset() {
    resetTodayWater()
    setTodayMl(0)
  }

  const progress = Math.min(todayMl / DAILY_GOAL_ML, 1)
  const glasses = Math.round(todayMl / 250)
  const goalGlasses = Math.round(DAILY_GOAL_ML / 250)

  return (
    <div className="bg-surface rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-protein" />
          <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Water</p>
        </div>
        <button onClick={handleReset} className="text-xs text-textMuted">Reset</button>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-display font-bold text-protein">{(todayMl / 1000).toFixed(1)}L</p>
          <p className="text-xs text-textMuted">{glasses} of {goalGlasses} glasses</p>
        </div>
        <div className="flex gap-1 items-end">
          {Array.from({ length: goalGlasses }, (_, i) => (
            <div key={i} className={`w-3 h-8 rounded-sm transition-all ${i < glasses ? 'bg-protein' : 'bg-surface2'}`} />
          ))}
        </div>
      </div>

      <div className="h-2 rounded-full bg-surface2 overflow-hidden">
        <div
          className="h-full rounded-full bg-protein transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {QUICK_ADD_OPTIONS.map((ml) => (
          <button
            key={ml}
            onClick={() => handleAdd(ml)}
            className="py-2 rounded-xl bg-protein/10 text-protein text-xs font-semibold active:scale-95 transition-transform"
          >
            +{ml}ml
          </button>
        ))}
      </div>
    </div>
  )
}
