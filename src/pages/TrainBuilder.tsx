import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, ChevronUp, ChevronDown, Search } from 'lucide-react';
import type { Exercise, CustomWorkout, Program, ProgramDay, MuscleGroupSlot } from '../types';
import { getProfile, saveProfile, saveProgram, getCustomWorkouts, saveCustomWorkouts } from '../lib/storage';
import { EXERCISE_LIBRARY } from '../data/exercises';

const MUSCLE_SLOTS: { id: MuscleGroupSlot; label: string }[] = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'quads', label: 'Quads' },
  { id: 'hamstrings', label: 'Hams' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'calves', label: 'Calves' },
  { id: 'abs', label: 'Abs' },
  { id: 'forearms', label: 'Forearms' },
];

type BuilderStep = 'workouts' | 'split' | 'exercise-picker';

export function TrainBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === '1';

  const [step, setStep] = useState<BuilderStep>('workouts');
  const [customWorkouts, setCustomWorkouts] = useState<CustomWorkout[]>([]);
  const [, setActiveWorkoutId] = useState<string | null>(null);

  const [workoutName, setWorkoutName] = useState('');
  const [editingWorkout, setEditingWorkout] = useState<CustomWorkout | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSlot, setFilterSlot] = useState<MuscleGroupSlot | 'all'>('all');

  const [splitName, setSplitName] = useState('My Custom Split');
  const [splitDays, setSplitDays] = useState<{ workoutId: string; dayName: string }[]>([]);

  const profile = getProfile();

  useEffect(() => {
    setCustomWorkouts(getCustomWorkouts());
  }, []);

  function saveWorkout(workout: CustomWorkout) {
    const existing = customWorkouts.find(w => w.id === workout.id);
    let updated: CustomWorkout[];
    if (existing) {
      updated = customWorkouts.map(w => w.id === workout.id ? workout : w);
    } else {
      updated = [...customWorkouts, workout];
    }
    setCustomWorkouts(updated);
    saveCustomWorkouts(updated);
  }

  function deleteWorkout(id: string) {
    const updated = customWorkouts.filter(w => w.id !== id);
    setCustomWorkouts(updated);
    saveCustomWorkouts(updated);
  }

  function createNewWorkout() {
    if (!workoutName.trim()) return;
    const newWorkout: CustomWorkout = {
      id: crypto.randomUUID(),
      name: workoutName.trim(),
      exercises: [],
    };
    saveWorkout(newWorkout);
    setEditingWorkout(newWorkout);
    setWorkoutName('');
  }

  function addExerciseToWorkout(exerciseId: string) {
    if (!editingWorkout) return;
    const def = EXERCISE_LIBRARY.find(e => e.id === exerciseId);
    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      slot: def?.slot ?? 'chest',
      exerciseId,
      sets: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
      restSeconds: 90,
    };
    const updated = { ...editingWorkout, exercises: [...editingWorkout.exercises, newExercise] };
    setEditingWorkout(updated);
    saveWorkout(updated);
    setStep('workouts');
  }

  function removeExerciseFromWorkout(exerciseIndex: number) {
    if (!editingWorkout) return;
    const exercises = editingWorkout.exercises.filter((_, i) => i !== exerciseIndex);
    const updated = { ...editingWorkout, exercises };
    setEditingWorkout(updated);
    saveWorkout(updated);
  }

  function moveExercise(index: number, direction: 'up' | 'down') {
    if (!editingWorkout) return;
    const exercises = [...editingWorkout.exercises];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= exercises.length) return;
    [exercises[index], exercises[newIndex]] = [exercises[newIndex], exercises[index]];
    const updated = { ...editingWorkout, exercises };
    setEditingWorkout(updated);
    saveWorkout(updated);
  }

  function updateExerciseParam(
    index: number,
    field: 'sets' | 'targetRepsMin' | 'targetRepsMax' | 'restSeconds',
    value: number,
  ) {
    if (!editingWorkout) return;
    const exercises = [...editingWorkout.exercises];
    exercises[index] = { ...exercises[index], [field]: value };
    const updated = { ...editingWorkout, exercises };
    setEditingWorkout(updated);
    saveWorkout(updated);
  }

  function addDayToSplit(workoutId: string) {
    const workout = customWorkouts.find(w => w.id === workoutId);
    if (!workout) return;
    setSplitDays(prev => [...prev, { workoutId, dayName: workout.name }]);
  }

  function removeDayFromSplit(index: number) {
    setSplitDays(prev => prev.filter((_, i) => i !== index));
  }

  function activateSplit() {
    if (!profile || splitDays.length === 0) return;

    const days: ProgramDay[] = splitDays.map((day, i) => {
      const workout = customWorkouts.find(w => w.id === day.workoutId);
      return {
        id: `custom_day_${i}`,
        name: day.dayName,
        exercises: workout?.exercises ?? [],
      };
    });

    const program: Program = {
      id: crypto.randomUUID(),
      splitId: 'custom',
      days,
      createdAt: new Date().toISOString(),
    };

    saveProgram(program);

    if (profile.splitId !== 'custom') {
      saveProfile({ ...profile, splitId: 'custom', daysPerWeek: splitDays.length });
    }

    navigate('/train');
  }

  const filteredExercises = EXERCISE_LIBRARY.filter(ex => {
    const matchesSlot = filterSlot === 'all' || ex.slot === filterSlot;
    const matchesSearch = searchQuery === '' || ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEquipment = !profile || ex.equipment.some(eq => profile.equipment.includes(eq));
    return matchesSlot && matchesSearch && matchesEquipment;
  });

  // EXERCISE PICKER VIEW
  if (step === 'exercise-picker') {
    return (
      <div className="min-h-screen bg-pageBg">
        <div className="max-w-sm mx-auto px-4 pt-8 pb-28">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setStep('workouts')} className="text-textMuted">← Back</button>
            <h1 className="text-xl font-display font-bold text-textPrimary">Add Exercise</h1>
          </div>

          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-3 text-textMuted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-surface2 bg-surface text-sm text-textPrimary focus:border-accent outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            <button
              onClick={() => setFilterSlot('all')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${filterSlot === 'all' ? 'bg-accent text-white' : 'bg-surface2 text-textMuted'}`}
            >
              All
            </button>
            {MUSCLE_SLOTS.map(s => (
              <button
                key={s.id}
                onClick={() => setFilterSlot(s.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${filterSlot === s.id ? 'bg-accent text-white' : 'bg-surface2 text-textMuted'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredExercises.map(ex => (
              <button
                key={ex.id}
                onClick={() => addExerciseToWorkout(ex.id)}
                className="w-full bg-surface rounded-xl p-4 flex items-center justify-between text-left active:scale-95 transition-transform"
              >
                <div>
                  <p className="text-sm font-semibold text-textPrimary">{ex.name}</p>
                  <p className="text-xs text-textMuted capitalize">{ex.slot} · {ex.category}</p>
                </div>
                <Plus size={18} className="text-accent shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // SPLIT BUILDER VIEW
  if (step === 'split') {
    return (
      <div className="min-h-screen bg-pageBg">
        <div className="max-w-sm mx-auto px-4 pt-8 pb-28 space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('workouts')} className="text-textMuted text-sm">← Back</button>
            <h1 className="text-xl font-display font-bold text-textPrimary">Build Split</h1>
          </div>

          <div>
            <label className="text-xs font-semibold text-textMuted uppercase tracking-wide">Split Name</label>
            <input
              type="text"
              value={splitName}
              onChange={e => setSplitName(e.target.value)}
              className="w-full mt-1 rounded-xl border-2 border-surface2 px-3 py-2 text-sm text-textPrimary bg-surface focus:border-accent outline-none"
            />
          </div>

          <div className="bg-surface rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Your Split Days</p>
            {splitDays.length === 0 && (
              <p className="text-sm text-textMuted">Add workouts below to build your split.</p>
            )}
            {splitDays.map((day, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-1">
                <p className="text-sm font-medium text-textPrimary">Day {i + 1}: {day.dayName}</p>
                <button onClick={() => removeDayFromSplit(i)} className="text-danger"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Add Workouts to Split</p>
            {customWorkouts.map(workout => (
              <div key={workout.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-textPrimary">{workout.name}</p>
                  <p className="text-xs text-textMuted">{workout.exercises.length} exercises</p>
                </div>
                <button
                  onClick={() => addDayToSplit(workout.id)}
                  className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>

          {splitDays.length > 0 && (
            <button
              onClick={activateSplit}
              className="w-full bg-accent text-white font-display font-bold rounded-2xl py-4 text-base active:scale-95 transition-transform"
            >
              {isOnboarding ? 'Activate & Start Training 🚀' : 'Save & Activate Split'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // MAIN WORKOUTS VIEW
  return (
    <div className="min-h-screen bg-pageBg">
      <div className="max-w-sm mx-auto px-4 pt-8 pb-28 space-y-5 page-fade-in">
        {isOnboarding && (
          <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4">
            <p className="text-sm font-semibold text-textPrimary">🛠️ Build Your Custom Split</p>
            <p className="text-xs text-textMuted mt-1">
              Create workouts, then tap "Build Split" to assemble them into your training program.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-textPrimary">Workout Builder</h1>
          <button
            onClick={() => setStep('split')}
            className="text-xs font-semibold text-accent bg-accent/10 px-3 py-2 rounded-xl active:scale-95 transition-transform"
          >
            Build Split →
          </button>
        </div>

        {/* Create new workout */}
        <div className="bg-surface rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">New Workout</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={workoutName}
              onChange={e => setWorkoutName(e.target.value)}
              placeholder="e.g. My Push Day"
              className="flex-1 rounded-xl border-2 border-surface2 px-3 py-2 text-sm text-textPrimary bg-surface focus:border-accent outline-none"
            />
            <button
              onClick={createNewWorkout}
              disabled={!workoutName.trim()}
              className="bg-accent text-white rounded-xl px-4 font-semibold text-sm disabled:opacity-40 active:scale-95 transition-transform"
            >
              Create
            </button>
          </div>
        </div>

        {/* Workout list */}
        {customWorkouts.map(workout => (
          <div key={workout.id} className="bg-surface rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setEditingWorkout(editingWorkout?.id === workout.id ? null : workout)}
                className="text-base font-display font-bold text-textPrimary text-left"
              >
                {workout.name} ({workout.exercises.length} exercises)
              </button>
              <button onClick={() => deleteWorkout(workout.id)} className="text-danger p-1">
                <Trash2 size={16} />
              </button>
            </div>

            {editingWorkout?.id === workout.id && (
              <div className="space-y-3">
                {editingWorkout.exercises.map((ex, i) => {
                  const def = EXERCISE_LIBRARY.find(e => e.id === ex.exerciseId);
                  return (
                    <div key={ex.id} className="bg-surface2 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-textPrimary">{def?.name ?? ex.exerciseId}</p>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveExercise(i, 'up')} className="p-1 text-textMuted">
                            <ChevronUp size={14} />
                          </button>
                          <button onClick={() => moveExercise(i, 'down')} className="p-1 text-textMuted">
                            <ChevronDown size={14} />
                          </button>
                          <button onClick={() => removeExerciseFromWorkout(i)} className="p-1 text-danger">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center">
                        {[
                          { label: 'Sets', field: 'sets' as const, value: ex.sets },
                          { label: 'Min', field: 'targetRepsMin' as const, value: ex.targetRepsMin },
                          { label: 'Max', field: 'targetRepsMax' as const, value: ex.targetRepsMax },
                          { label: 'Rest', field: 'restSeconds' as const, value: ex.restSeconds },
                        ].map(param => (
                          <div key={param.field}>
                            <label className="text-[10px] text-textMuted">{param.label}</label>
                            <input
                              type="number"
                              value={param.value}
                              onChange={e => updateExerciseParam(i, param.field, Number(e.target.value))}
                              className="w-full text-center text-xs font-semibold bg-surface rounded-lg border border-surface2 py-1 focus:border-accent outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => { setActiveWorkoutId(workout.id); setStep('exercise-picker'); }}
                  className="w-full border-2 border-dashed border-surface2 rounded-xl py-3 text-sm font-semibold text-textMuted hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Exercise
                </button>
              </div>
            )}
          </div>
        ))}

        {customWorkouts.length === 0 && (
          <div className="bg-surface rounded-2xl p-6 text-center">
            <p className="text-sm text-textMuted">Create your first workout above, then add exercises to it.</p>
          </div>
        )}
      </div>
    </div>
  );
}
