import { useState, useMemo } from 'react'
import { Trophy, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { getProfile, getWeightEntries, addOrUpdateWeightEntry } from '../lib/storage'
import { KEY_LIFTS, getAllTimePR } from '../lib/getPRs'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

interface GoalRingProps {
  current: number
  start: number
  target: number
  size?: number
}

function GoalRing({ current, start, target, size = 120 }: GoalRingProps) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const totalChange = Math.abs(target - start)
  const progress = totalChange === 0 ? 1 : Math.min(Math.abs(start - current) / totalChange, 1)
  const dashOffset = circumference * (1 - progress)
  const pct = Math.round(progress * 100)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-ring-track)" strokeWidth={8} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-accent-green)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-display font-bold text-accentGreen">{pct}%</span>
        <span className="text-[10px] font-body text-textMuted">to goal</span>
      </div>
    </div>
  )
}

export default function Progress() {
  const profile = getProfile()
  const [weightInput, setWeightInput] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [, forceUpdate] = useState(0)

  const weightEntries = getWeightEntries()
  const today = todayStr()

  const latestEntry = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1] : null
  const earliestEntry = weightEntries.length > 0 ? weightEntries[0] : null
  const change =
    weightEntries.length >= 2
      ? weightEntries[weightEntries.length - 1].weightLbs - weightEntries[0].weightLbs
      : null

  function handleSaveWeight() {
    const w = parseFloat(weightInput)
    if (!w || w <= 0) return
    addOrUpdateWeightEntry({ id: `we_${Date.now()}`, date: today, weightLbs: w })
    setWeightInput('')
    setShowSuccess(true)
    forceUpdate((n) => n + 1)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const chartPoints = useMemo(() => {
    if (weightEntries.length < 2) return null
    const last30 = weightEntries.slice(-30)
    const minW = Math.min(...last30.map((e) => e.weightLbs)) - 2
    const maxW = Math.max(...last30.map((e) => e.weightLbs)) + 2
    const W = 300
    const H = 80
    return last30.map((e, i) => {
      const x = (i / (last30.length - 1)) * W
      const y = H - ((e.weightLbs - minW) / (maxW - minW)) * H
      return `${x},${y}`
    })
  }, [weightEntries])

  const prs = useMemo(
    () => KEY_LIFTS.map((lift) => ({ ...lift, pr: getAllTimePR(lift.exerciseId) })),
    []
  )

  return (
    <div className="px-4 py-6 space-y-5 animate-[page-fade-in_0.35s_ease-out]">
      <h1 className="text-2xl font-display font-bold text-textPrimary">Progress</h1>

      {/* Log weight */}
      <div className="bg-surface rounded-2xl p-5 space-y-4">
        <h2 className="font-display font-semibold text-textPrimary">Log Weight</h2>
        <div className="flex gap-3">
          <input
            type="number"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="lbs"
            className="flex-1 px-4 py-3 rounded-xl bg-surface2 text-textPrimary font-body border border-transparent focus:border-accent focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleSaveWeight()}
          />
          <button
            onClick={handleSaveWeight}
            disabled={!weightInput}
            className="px-6 py-3 rounded-xl bg-accent text-white font-display font-semibold disabled:opacity-50"
          >
            Save
          </button>
        </div>

        {/* Success popup */}
        {showSuccess && (
          <div className="bg-accentGreen/10 border border-accentGreen/30 rounded-xl px-4 py-3 animate-[page-fade-in_0.3s_ease-out]">
            <p className="text-sm font-body text-accentGreen font-medium">Weight saved!</p>
          </div>
        )}
      </div>

      {/* Goal ring + stats */}
      {profile?.targetWeightLbs && earliestEntry && latestEntry && weightEntries.length >= 2 && (
        <div className="bg-surface rounded-2xl p-5 flex items-center gap-5">
          <GoalRing
            current={latestEntry.weightLbs}
            start={earliestEntry.weightLbs}
            target={profile.targetWeightLbs}
          />
          <div className="space-y-2 flex-1">
            <div>
              <p className="text-xs font-body text-textMuted">Current</p>
              <p className="text-xl font-display font-bold text-textPrimary">
                {latestEntry.weightLbs} lbs
              </p>
            </div>
            <div>
              <p className="text-xs font-body text-textMuted">Goal</p>
              <p className="text-base font-display font-semibold text-textPrimary">
                {profile.targetWeightLbs} lbs
              </p>
            </div>
            {change !== null && (
              <div className="flex items-center gap-1">
                {change < 0 ? (
                  <TrendingDown size={14} className="text-accentGreen" />
                ) : change > 0 ? (
                  <TrendingUp size={14} className="text-danger" />
                ) : (
                  <Minus size={14} className="text-textMuted" />
                )}
                <p className={`text-sm font-body font-medium ${change < 0 ? 'text-accentGreen' : change > 0 ? 'text-danger' : 'text-textMuted'}`}>
                  {change > 0 ? '+' : ''}{change?.toFixed(1)} lbs
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weight chart */}
      {chartPoints && chartPoints.length >= 2 && (
        <div className="bg-surface rounded-2xl p-5">
          <h2 className="font-display font-semibold text-textPrimary mb-4">Weight Trend</h2>
          <svg width="100%" viewBox="0 0 300 80" className="overflow-visible">
            <polyline
              points={chartPoints.join(' ')}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dots */}
            {chartPoints.map((pt, i) => {
              const [x, y] = pt.split(',').map(Number)
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={i === chartPoints.length - 1 ? 4 : 2}
                  fill={i === chartPoints.length - 1 ? 'var(--color-accent)' : 'var(--color-accent)'}
                  opacity={i === chartPoints.length - 1 ? 1 : 0.5}
                />
              )
            })}
          </svg>
          <div className="flex justify-between mt-2">
            <p className="text-xs font-body text-textMuted">
              {weightEntries.slice(-30)[0]?.date.slice(5)}
            </p>
            <p className="text-xs font-body text-textMuted">Today</p>
          </div>
        </div>
      )}

      {/* Strength PRs */}
      <div className="bg-surface rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} className="text-carbs" />
          <h2 className="font-display font-semibold text-textPrimary">Strength PRs</h2>
        </div>
        <div className="space-y-3">
          {prs.map(({ exerciseId, name, pr }) => (
            <div key={exerciseId} className="flex items-center justify-between py-1">
              <p className="text-sm font-body text-textPrimary">{name}</p>
              {pr ? (
                <div className="text-right">
                  <p className="text-sm font-display font-bold text-carbs">
                    {pr.weight} lbs × {pr.reps}
                  </p>
                  <p className="text-[10px] font-body text-textMuted">{pr.date}</p>
                </div>
              ) : (
                <p className="text-xs font-body text-textMuted">No data yet</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
