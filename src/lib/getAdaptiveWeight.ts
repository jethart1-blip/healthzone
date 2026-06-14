import { getWorkoutLogs } from './storage';

interface WeightSuggestion {
  weight: number;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export function getAdaptiveWeightSuggestion(
  exerciseId: string,
  targetRepsMin: number,
  targetRepsMax: number,
): WeightSuggestion {
  const logs = getWorkoutLogs();

  const allSets: { weight: number; reps: number; rpe?: number; date: string }[] = [];

  for (const log of [...logs].sort((a, b) => b.date.localeCompare(a.date))) {
    for (const ex of log.exercises) {
      if (ex.exerciseId === exerciseId) {
        for (const set of ex.sets) {
          if (set.completed && set.weight > 0) {
            allSets.push({ weight: set.weight, reps: set.reps, rpe: set.rpe, date: log.date });
          }
        }
      }
    }
  }

  if (allSets.length === 0) {
    return { weight: 0, reason: 'No previous data — start light and build up', confidence: 'low' };
  }

  const lastSessionSets = allSets.filter(s => s.date === allSets[0].date);
  const lastBestSet = lastSessionSets.reduce((best, s) => s.weight > best.weight ? s : best);

  const lastRPE = lastBestSet.rpe;
  const lastReps = lastBestSet.reps;
  const lastWeight = lastBestSet.weight;

  let suggestedWeight = lastWeight;
  let reason = '';

  if (lastRPE !== undefined) {
    if (lastRPE <= 6) {
      suggestedWeight = Math.round((lastWeight * 1.075) / 2.5) * 2.5;
      reason = `Last session felt easy (RPE ${lastRPE}) — increased by ~7.5%`;
    } else if (lastRPE === 7) {
      suggestedWeight = Math.round((lastWeight * 1.025) / 2.5) * 2.5;
      reason = `Last session felt manageable (RPE ${lastRPE}) — small increase`;
    } else if (lastRPE === 8) {
      suggestedWeight = lastWeight;
      reason = `Last session was on target (RPE ${lastRPE}) — same weight, aim for more reps`;
    } else if (lastRPE === 9) {
      suggestedWeight = lastWeight;
      reason = `Last session was challenging (RPE ${lastRPE}) — maintain weight, focus on form`;
    } else if (lastRPE >= 10) {
      suggestedWeight = Math.round((lastWeight * 0.95) / 2.5) * 2.5;
      reason = `Last session was too hard (RPE ${lastRPE}) — reduced slightly to ensure quality reps`;
    }
  } else {
    if (lastReps > targetRepsMax) {
      suggestedWeight = Math.round((lastWeight * 1.05) / 2.5) * 2.5;
      reason = `Hit ${lastReps} reps last time (above target) — increased weight`;
    } else if (lastReps < targetRepsMin) {
      suggestedWeight = Math.round((lastWeight * 0.95) / 2.5) * 2.5;
      reason = `Hit only ${lastReps} reps last time (below target) — reduced slightly`;
    } else {
      suggestedWeight = lastWeight;
      reason = `Matched target reps last time — same weight`;
    }
  }

  const confidence = allSets.length >= 6 ? 'high' : allSets.length >= 3 ? 'medium' : 'low';

  return { weight: suggestedWeight, reason, confidence };
}
