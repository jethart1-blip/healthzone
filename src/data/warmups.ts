import type { MuscleGroupSlot } from '../types';

export interface WarmupExercise {
  id: string;
  name: string;
  duration: number;
  instruction: string;
  targetSlots: MuscleGroupSlot[];
}

export const WARMUP_EXERCISES: WarmupExercise[] = [
  { id: 'arm_circles', name: 'Arm Circles', duration: 30, instruction: 'Extend arms out, make large circles forward then backward. Keep shoulders relaxed.', targetSlots: ['shoulders'] },
  { id: 'shoulder_rolls', name: 'Shoulder Rolls', duration: 20, instruction: 'Roll shoulders forward 10 times, then backward 10 times. Keep neck long.', targetSlots: ['shoulders'] },
  { id: 'chest_opener', name: 'Chest Opener Stretch', duration: 30, instruction: 'Clasp hands behind back, squeeze shoulder blades together, lift chest. Hold.', targetSlots: ['chest', 'shoulders'] },
  { id: 'cat_cow', name: 'Cat-Cow', duration: 30, instruction: 'On hands and knees, arch back up (cat) then drop belly (cow). Move with breath.', targetSlots: ['back', 'abs'] },
  { id: 'hip_circles', name: 'Hip Circles', duration: 30, instruction: 'Stand with feet hip-width, hands on hips. Make large circles with hips. 10 each direction.', targetSlots: ['glutes', 'quads'] },
  { id: 'leg_swings', name: 'Leg Swings', duration: 30, instruction: 'Hold a wall, swing leg forward and back. 10 each leg. Keep upper body stable.', targetSlots: ['hamstrings', 'quads'] },
  { id: 'lateral_leg_swings', name: 'Lateral Leg Swings', duration: 30, instruction: 'Hold a wall, swing leg side to side across body. 10 each leg.', targetSlots: ['glutes', 'quads'] },
  { id: 'bodyweight_squat', name: 'Bodyweight Squat', duration: 40, instruction: 'Feet shoulder-width, toes slightly out. Squat to depth, drive through heels. 15 reps.', targetSlots: ['quads', 'glutes'] },
  { id: 'glute_bridge', name: 'Glute Bridge', duration: 40, instruction: 'Lie on back, feet flat. Drive hips up, squeeze glutes at top. 15 reps.', targetSlots: ['glutes', 'hamstrings'] },
  { id: 'inchworm', name: 'Inchworm', duration: 45, instruction: 'Hinge forward, walk hands out to plank, walk feet to hands. 8 reps.', targetSlots: ['back', 'hamstrings', 'abs'] },
  { id: 'world_greatest_stretch', name: "World's Greatest Stretch", duration: 45, instruction: 'Lunge forward, place same-side hand inside foot. Rotate opposite arm to sky. 5 each side.', targetSlots: ['quads', 'glutes', 'back', 'chest'] },
  { id: 'band_pull_apart', name: 'Band Pull Apart', duration: 30, instruction: 'Hold band at shoulder height, pull apart until arms are wide. 15 reps. Keep arms straight.', targetSlots: ['back', 'shoulders'] },
  { id: 'jumping_jacks', name: 'Jumping Jacks', duration: 30, instruction: 'Classic jumping jacks to elevate heart rate. Focus on landing softly.', targetSlots: ['quads', 'calves'] },
  { id: 'high_knees', name: 'High Knees', duration: 30, instruction: 'March in place bringing knees to hip height. Pump arms. Pick up the pace.', targetSlots: ['quads', 'abs'] },
  { id: 'thoracic_rotation', name: 'Thoracic Rotation', duration: 30, instruction: 'Sit on heels, hands behind head. Rotate upper back left and right. 10 each side.', targetSlots: ['back'] },
  { id: 'wrist_circles', name: 'Wrist Circles', duration: 20, instruction: 'Make fists, rotate wrists 10 times each direction. Essential before pressing.', targetSlots: ['forearms'] },
  { id: 'ankle_circles', name: 'Ankle Circles', duration: 20, instruction: 'Lift one foot, rotate ankle 10 times each direction. Repeat other side.', targetSlots: ['calves'] },
  { id: 'hip_flexor_stretch', name: 'Hip Flexor Stretch', duration: 40, instruction: 'Kneel on one knee, push hips forward, hold 20 seconds. Essential before squatting.', targetSlots: ['quads', 'glutes'] },
  { id: 'calf_raise_warmup', name: 'Calf Raise Warmup', duration: 30, instruction: 'Rise up on toes, hold 1 second, lower slowly. 20 reps. Essential before leg days.', targetSlots: ['calves'] },
  { id: 'face_pull_warmup', name: 'Face Pull (Light)', duration: 30, instruction: 'With light resistance band, pull to face level. 15 reps. Critical shoulder warmup.', targetSlots: ['shoulders', 'back'] },
];

export const COOLDOWN_STRETCHES: WarmupExercise[] = [
  { id: 'child_pose', name: "Child's Pose", duration: 45, instruction: 'Kneel, sit back on heels, arms extended forward. Breathe deeply into back.', targetSlots: ['back', 'glutes'] },
  { id: 'pigeon_pose', name: 'Pigeon Pose', duration: 60, instruction: 'From plank, bring one knee forward. Lower hips. Hold 30 seconds each side.', targetSlots: ['glutes', 'quads'] },
  { id: 'quad_stretch', name: 'Standing Quad Stretch', duration: 40, instruction: 'Stand on one leg, pull other foot to glute. Hold 20 seconds each side.', targetSlots: ['quads'] },
  { id: 'hamstring_stretch', name: 'Seated Hamstring Stretch', duration: 45, instruction: 'Sit with legs extended. Reach toward toes. Hold 30 seconds. Breathe out tension.', targetSlots: ['hamstrings'] },
  { id: 'chest_stretch', name: 'Doorway Chest Stretch', duration: 40, instruction: 'Place forearms on doorframe, step through. Feel stretch across chest. 20 seconds.', targetSlots: ['chest', 'shoulders'] },
  { id: 'lat_stretch', name: 'Lat Stretch', duration: 40, instruction: 'Hold a pole/rack, lean back and away. Feel lats stretching. 20 seconds each side.', targetSlots: ['back'] },
  { id: 'shoulder_cross_stretch', name: 'Cross-Body Shoulder Stretch', duration: 40, instruction: 'Pull one arm across chest with other hand. Hold 20 seconds each side.', targetSlots: ['shoulders'] },
  { id: 'tricep_stretch', name: 'Overhead Tricep Stretch', duration: 30, instruction: 'Raise arm, bend at elbow, use other hand to pull elbow back. 15 seconds each.', targetSlots: ['triceps'] },
  { id: 'bicep_stretch', name: 'Wall Bicep Stretch', duration: 30, instruction: 'Place hand on wall at shoulder height, turn body away. Feel bicep stretch.', targetSlots: ['biceps'] },
  { id: 'calf_stretch', name: 'Standing Calf Stretch', duration: 40, instruction: 'Step back, press heel down. Hold 20 seconds each side. Keep back leg straight.', targetSlots: ['calves'] },
  { id: 'hip_flexor_cooldown', name: 'Hip Flexor Stretch', duration: 50, instruction: 'Kneel, push hips forward. Hold 30 seconds each side. Essential after squats.', targetSlots: ['quads', 'glutes'] },
  { id: 'figure_four', name: 'Figure Four Stretch', duration: 50, instruction: 'Lie on back, cross ankle over knee, pull leg toward chest. 30 seconds each.', targetSlots: ['glutes'] },
  { id: 'spinal_twist', name: 'Supine Spinal Twist', duration: 50, instruction: 'Lie on back, pull one knee across body. Both shoulders stay grounded. 25 sec each.', targetSlots: ['back', 'glutes'] },
  { id: 'neck_stretch', name: 'Neck Side Stretch', duration: 30, instruction: 'Tilt ear to shoulder, hold 15 seconds each side. Never force — gentle only.', targetSlots: ['shoulders'] },
  { id: 'deep_breathing', name: 'Deep Breathing', duration: 60, instruction: 'Lie flat, close eyes. Inhale 4 counts, hold 4, exhale 6. Lower heart rate.', targetSlots: ['abs'] },
];

export function getWarmupForWorkout(slots: MuscleGroupSlot[]): WarmupExercise[] {
  const general = WARMUP_EXERCISES.filter(e => ['jumping_jacks', 'high_knees', 'inchworm'].includes(e.id));
  const targeted = WARMUP_EXERCISES.filter(e =>
    e.targetSlots.some(s => slots.includes(s)) && !general.includes(e)
  ).slice(0, 4);
  return [...general, ...targeted];
}

export function getCooldownForWorkout(slots: MuscleGroupSlot[]): WarmupExercise[] {
  const targeted = COOLDOWN_STRETCHES.filter(e =>
    e.targetSlots.some(s => slots.includes(s))
  ).slice(0, 5);
  const general = COOLDOWN_STRETCHES.filter(e =>
    ['child_pose', 'deep_breathing', 'spinal_twist'].includes(e.id) && !targeted.includes(e)
  );
  return [...targeted, ...general];
}
