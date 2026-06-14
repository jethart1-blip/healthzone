import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { FoodLogEntry } from '../types';
import { getFoodLogs, getProfile } from '../lib/storage';

function getWeekRange(weeksAgo = 0): { start: Date; end: Date; label: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  startOfThisWeek.setHours(0, 0, 0, 0);

  const start = new Date(startOfThisWeek);
  start.setDate(start.getDate() - weeksAgo * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const label = weeksAgo === 0 ? 'This Week' : weeksAgo === 1 ? 'Last Week' : `${weeksAgo} Weeks Ago`;
  return { start, end, label };
}

function getLogsForDateRange(logs: FoodLogEntry[], start: Date, end: Date): FoodLogEntry[] {
  return logs.filter(l => {
    const d = new Date(l.date);
    return d >= start && d <= end;
  });
}

function getDailyTotals(
  logs: FoodLogEntry[],
  start: Date,
): { day: string; calories: number; protein: number; carbs: number; fat: number }[] {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayLogs = logs.filter(l => {
      const ld = new Date(l.date);
      return ld.toDateString() === d.toDateString();
    });
    days.push({
      day: dayStr,
      calories: dayLogs.reduce((s, l) => s + l.confirmed.calories, 0),
      protein: dayLogs.reduce((s, l) => s + l.confirmed.protein, 0),
      carbs: dayLogs.reduce((s, l) => s + l.confirmed.carbs, 0),
      fat: dayLogs.reduce((s, l) => s + l.confirmed.fat, 0),
    });
  }
  return days;
}

export function NutritionInsights() {
  const navigate = useNavigate();
  const [weeksAgo, setWeeksAgo] = useState(0);
  const profile = getProfile();
  const allLogs = getFoodLogs();
  const { start, end, label } = getWeekRange(weeksAgo);
  const weekLogs = getLogsForDateRange(allLogs, start, end);
  const dailyTotals = getDailyTotals(weekLogs, start);
  const targets = profile?.dailyTargets;

  const daysLogged = dailyTotals.filter(d => d.calories > 0).length;
  const avgCalories = daysLogged > 0 ? Math.round(dailyTotals.reduce((s, d) => s + d.calories, 0) / daysLogged) : 0;
  const avgProtein = daysLogged > 0 ? Math.round(dailyTotals.reduce((s, d) => s + d.protein, 0) / daysLogged) : 0;
  const avgCarbs = daysLogged > 0 ? Math.round(dailyTotals.reduce((s, d) => s + d.carbs, 0) / daysLogged) : 0;
  const avgFat = daysLogged > 0 ? Math.round(dailyTotals.reduce((s, d) => s + d.fat, 0) / daysLogged) : 0;
  const bestDay = dailyTotals.reduce(
    (best, d) =>
      d.calories > 0 && Math.abs(d.calories - (targets?.calories ?? 2000)) < Math.abs(best.calories - (targets?.calories ?? 2000))
        ? d
        : best,
    dailyTotals[0],
  );
  const totalProtein = dailyTotals.reduce((s, d) => s + d.protein, 0);
  const calorieGoalHitDays = targets
    ? dailyTotals.filter(d => d.calories > 0 && Math.abs(d.calories - targets.calories) / targets.calories < 0.1).length
    : 0;

  const chartMax = targets
    ? Math.max(targets.calories * 1.3, Math.max(...dailyTotals.map(d => d.calories), 100))
    : 2500;

  return (
    <div className="min-h-screen bg-pageBg">
      <div className="max-w-sm mx-auto px-4 pt-8 pb-28 space-y-6 animate-[page-fade-in_0.35s_ease-out]">

        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-display font-bold text-textPrimary">Nutrition Insights</h1>
        </div>

        {/* Week selector */}
        <div className="flex items-center justify-between bg-surface rounded-2xl p-4">
          <button
            onClick={() => setWeeksAgo(w => w + 1)}
            className="p-2 text-textMuted active:scale-95 transition-transform"
          >
            ←
          </button>
          <p className="font-display font-bold text-textPrimary">{label}</p>
          <button
            onClick={() => setWeeksAgo(w => Math.max(0, w - 1))}
            disabled={weeksAgo === 0}
            className="p-2 text-textMuted disabled:opacity-30 active:scale-95 transition-transform"
          >
            →
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Avg Calories', value: avgCalories, unit: 'cal', color: 'text-calorie', target: targets?.calories },
            { label: 'Avg Protein', value: avgProtein, unit: 'g', color: 'text-protein', target: targets?.protein },
            { label: 'Avg Carbs', value: avgCarbs, unit: 'g', color: 'text-carbs', target: targets?.carbs },
            { label: 'Avg Fat', value: avgFat, unit: 'g', color: 'text-fat', target: targets?.fat },
          ].map(stat => (
            <div key={stat.label} className="bg-surface rounded-2xl p-4">
              <p className="text-xs text-textMuted">{stat.label}</p>
              <p className={`text-2xl font-display font-bold ${stat.color}`}>
                {stat.value}
                <span className="text-sm font-normal text-textMuted ml-1">{stat.unit}</span>
              </p>
              {stat.target && <p className="text-xs text-textMuted mt-1">Goal: {stat.target}{stat.unit}</p>}
            </div>
          ))}
        </div>

        {/* Consistency score */}
        <div className="bg-surface rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Weekly Consistency</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-display font-bold text-accent">
              {daysLogged}
              <span className="text-lg text-textMuted">/7</span>
            </p>
            <p className="text-sm text-textMuted mb-1">days logged</p>
          </div>
          {targets && (
            <p className="text-xs text-textMuted">
              🎯 Hit calorie goal on {calorieGoalHitDays} day{calorieGoalHitDays !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Daily calories bar chart */}
        <div className="bg-surface rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Daily Calories</p>
          <div className="flex items-end gap-1.5 h-32">
            {dailyTotals.map((d, i) => {
              const height = d.calories > 0 ? Math.max((d.calories / chartMax) * 100, 4) : 0;
              const isOnTarget =
                targets && d.calories > 0 && Math.abs(d.calories - targets.calories) / targets.calories < 0.1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-[8px] text-textMuted">{d.calories > 0 ? d.calories : ''}</p>
                  <div className="w-full flex items-end" style={{ height: '96px' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isOnTarget ? 'bg-success' : d.calories > 0 ? 'bg-calorie' : 'bg-surface2'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-textMuted">{d.day}</p>
                </div>
              );
            })}
          </div>
          {targets && (
            <div className="flex items-center gap-2 text-xs text-textMuted">
              <div className="w-3 h-3 rounded-sm bg-success" />
              <span>On target</span>
              <div className="w-3 h-3 rounded-sm bg-calorie ml-2" />
              <span>Logged</span>
            </div>
          )}
        </div>

        {/* Macro breakdown */}
        <div className="bg-surface rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Weekly Macro Breakdown</p>
          {[
            { label: 'Protein', total: totalProtein, avg: avgProtein, target: targets?.protein, color: 'bg-protein', text: 'text-protein' },
            { label: 'Carbs', total: dailyTotals.reduce((s, d) => s + d.carbs, 0), avg: avgCarbs, target: targets?.carbs, color: 'bg-carbs', text: 'text-carbs' },
            { label: 'Fat', total: dailyTotals.reduce((s, d) => s + d.fat, 0), avg: avgFat, target: targets?.fat, color: 'bg-fat', text: 'text-fat' },
          ].map(m => (
            <div key={m.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className={`font-semibold ${m.text}`}>{m.label}</span>
                <span className="text-textMuted">{m.avg}g avg {m.target ? `/ ${m.target}g goal` : ''}</span>
              </div>
              <div className="h-2 rounded-full bg-surface2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.color} transition-all duration-500`}
                  style={{ width: `${m.target ? Math.min((m.avg / m.target) * 100, 100) : 50}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="bg-surface rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Insights</p>
          {daysLogged === 0 ? (
            <p className="text-sm text-textMuted">No meals logged this week yet.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-textPrimary">
                🏆 Best day: <span className="font-semibold">{bestDay.day}</span> ({bestDay.calories} cal)
              </p>
              <p className="text-sm text-textPrimary">
                📊 Logged {daysLogged} of 7 days ({Math.round((daysLogged / 7) * 100)}% consistency)
              </p>
              {avgProtein > 0 && targets && (
                <p className="text-sm text-textPrimary">
                  {avgProtein >= targets.protein
                    ? '💪 Protein goal crushed!'
                    : `🎯 Protein: ${targets.protein - avgProtein}g/day short of goal`}
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
