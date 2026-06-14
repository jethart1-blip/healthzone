import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { getFoodLogs, deleteFoodLog } from '../lib/storage'
import type { MealCategory } from '../types'
import { MEAL_CATEGORY_LABELS } from '../lib/mealCategory'

const MEAL_ORDER: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack']

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

type ViewMode = 'day' | 'calendar'

export default function NutritionHistory() {
  const navigate = useNavigate()
  const allLogs = getFoodLogs()
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [, forceUpdate] = useState(0)

  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())

  const dayLogs = useMemo(
    () => allLogs.filter((e) => e.date === selectedDate),
    [allLogs, selectedDate, forceUpdate]
  )

  const dayTotals = useMemo(
    () =>
      dayLogs.reduce(
        (acc, e) => ({
          calories: acc.calories + e.confirmed.calories,
          protein: acc.protein + e.confirmed.protein,
          carbs: acc.carbs + e.confirmed.carbs,
          fat: acc.fat + e.confirmed.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [dayLogs]
  )

  function handleDelete(id: string) {
    deleteFoodLog(id)
    forceUpdate((n) => n + 1)
  }

  function prevDay() {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  function nextDay() {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    const newDate = d.toISOString().split('T')[0]
    if (newDate <= today) setSelectedDate(newDate)
  }

  // Calendar data
  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)

  const dateHasLogs = useMemo(() => {
    const set = new Set(allLogs.map((e) => e.date))
    return set
  }, [allLogs])

  function calDateStr(day: number) {
    const m = String(calMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${calYear}-${m}-${d}`
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="px-4 py-6 space-y-5 animate-[page-fade-in_0.35s_ease-out]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-textPrimary">History</h1>
        <div className="flex gap-1 bg-surface2 p-1 rounded-xl">
          {(['day', 'calendar'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium capitalize transition-all ${
                viewMode === mode ? 'bg-surface text-textPrimary' : 'text-textMuted'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Day View */}
      {viewMode === 'day' && (
        <>
          {/* Day navigation */}
          <div className="flex items-center justify-between">
            <button onClick={prevDay} className="p-2 text-textMuted">
              <ChevronLeft size={20} />
            </button>
            <p className="font-display font-semibold text-textPrimary">{formatDate(selectedDate)}</p>
            <button
              onClick={nextDay}
              disabled={selectedDate >= today}
              className="p-2 text-textMuted disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day summary */}
          {dayLogs.length > 0 && (
            <div className="bg-surface rounded-2xl p-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Cals', value: dayTotals.calories, color: 'text-calorie' },
                  { label: 'Protein', value: `${dayTotals.protein}g`, color: 'text-protein' },
                  { label: 'Carbs', value: `${dayTotals.carbs}g`, color: 'text-carbs' },
                  { label: 'Fat', value: `${dayTotals.fat}g`, color: 'text-fat' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <p className={`text-lg font-display font-bold ${color}`}>{value}</p>
                    <p className="text-[10px] font-body text-textMuted">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entries by category */}
          {MEAL_ORDER.map((cat) => {
            const entries = dayLogs.filter((e) => e.mealCategory === cat)
            if (entries.length === 0) return null
            return (
              <div key={cat}>
                <h3 className="font-display font-semibold text-textPrimary mb-2">
                  {MEAL_CATEGORY_LABELS[cat]}
                </h3>
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <div key={entry.id} className="bg-surface rounded-2xl px-4 py-3 flex items-center gap-3">
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
                          {entry.confirmed.calories} kcal · P:{entry.confirmed.protein}g
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate('/nutrition/log')}
                          className="p-2 text-textMuted"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-danger"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {dayLogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-textMuted font-body text-4xl mb-3">📭</p>
              <p className="text-textMuted font-body">No meals logged for this day</p>
            </div>
          )}
        </>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <>
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1) }
                else setCalMonth((m) => m - 1)
              }}
              className="p-2 text-textMuted"
            >
              <ChevronLeft size={20} />
            </button>
            <p className="font-display font-semibold text-textPrimary">
              {monthNames[calMonth]} {calYear}
            </p>
            <button
              onClick={() => {
                if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1) }
                else setCalMonth((m) => m + 1)
              }}
              className="p-2 text-textMuted"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="bg-surface rounded-2xl p-4">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="text-center text-[10px] font-body font-semibold text-textMuted py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = calDateStr(day)
                const hasLog = dateHasLogs.has(dateStr)
                const isSelected = dateStr === selectedDate
                const isToday = dateStr === today
                const isFuture = dateStr > today

                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (!isFuture) {
                        setSelectedDate(dateStr)
                        setViewMode('day')
                      }
                    }}
                    disabled={isFuture}
                    className={`relative flex flex-col items-center py-1 rounded-lg transition-all disabled:opacity-30 ${
                      isSelected ? 'bg-accent text-white' : isToday ? 'bg-accent/10' : ''
                    }`}
                  >
                    <span className={`text-sm font-body ${isSelected ? 'text-white font-semibold' : 'text-textPrimary'}`}>
                      {day}
                    </span>
                    {hasLog && !isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-accentGreen mt-0.5" />
                    )}
                    {hasLog && isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white mt-0.5" />
                    )}
                    {!hasLog && <div className="w-1.5 h-1.5 mt-0.5" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-body text-textMuted">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accentGreen" />
              <span>Meals logged</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span>Selected</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
