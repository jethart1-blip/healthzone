import type { MuscleGroupSlot } from '../types'

interface MuscleMapProps {
  primary: MuscleGroupSlot[]
  secondary?: MuscleGroupSlot[]
  size?: number
}

const MUSCLE_COLORS = {
  primary: '#FF8C5A',
  secondary: '#5B9BD5',
  inactive: '#EDE7DD',
}

export default function MuscleMap({ primary, secondary = [], size = 160 }: MuscleMapProps) {
  const getColor = (slot: MuscleGroupSlot) => {
    if (primary.includes(slot)) return MUSCLE_COLORS.primary
    if (secondary.includes(slot)) return MUSCLE_COLORS.secondary
    return MUSCLE_COLORS.inactive
  }

  const w = size / 2
  const h = size

  return (
    <div className="flex gap-2 items-center justify-center">
      {/* Front View */}
      <svg width={w} height={h} viewBox="0 0 60 120" fill="none">
        {/* Head */}
        <ellipse cx="30" cy="8" rx="7" ry="8" fill="#EDE7DD" />
        {/* Neck */}
        <rect x="27" y="15" width="6" height="5" rx="1" fill="#EDE7DD" />

        {/* Chest */}
        <path
          d="M16 22 Q15 30 18 35 Q23 38 30 38 Q37 38 42 35 Q45 30 44 22 Q37 20 30 20 Q23 20 16 22Z"
          fill={getColor('chest')}
        />
        {/* Left chest separation */}
        <line x1="30" y1="22" x2="30" y2="37" stroke="#FAF7F2" strokeWidth="0.8" opacity="0.5" />

        {/* Shoulders (front deltoids) */}
        <ellipse cx="13" cy="25" rx="5" ry="7" fill={getColor('shoulders')} />
        <ellipse cx="47" cy="25" rx="5" ry="7" fill={getColor('shoulders')} />

        {/* Biceps */}
        <path d="M7 32 Q5 40 7 48 Q10 50 13 48 Q16 40 15 32 Q12 30 7 32Z" fill={getColor('biceps')} />
        <path d="M45 32 Q44 40 46 48 Q49 50 52 48 Q55 40 53 32 Q51 30 45 32Z" fill={getColor('biceps')} />

        {/* Forearms */}
        <path d="M7 49 Q5 58 7 65 Q9 67 12 65 Q14 58 13 49 Q10 48 7 49Z" fill={getColor('forearms')} />
        <path d="M47 49 Q48 58 47 65 Q49 67 52 65 Q54 58 53 49 Q50 48 47 49Z" fill={getColor('forearms')} />

        {/* Abs */}
        <rect x="24" y="38" width="12" height="18" rx="2" fill={getColor('abs')} />
        {/* Abs grid lines */}
        <line x1="24" y1="44" x2="36" y2="44" stroke="#FAF7F2" strokeWidth="0.7" opacity="0.6" />
        <line x1="24" y1="50" x2="36" y2="50" stroke="#FAF7F2" strokeWidth="0.7" opacity="0.6" />
        <line x1="30" y1="38" x2="30" y2="56" stroke="#FAF7F2" strokeWidth="0.7" opacity="0.6" />

        {/* Obliques */}
        <path d="M17 38 Q15 48 17 56 Q20 58 23 56 Q22 48 23 38Z" fill={getColor('abs')} opacity="0.7" />
        <path d="M37 38 Q38 48 36 56 Q40 58 43 56 Q45 48 43 38Z" fill={getColor('abs')} opacity="0.7" />

        {/* Quads */}
        <path d="M20 58 Q17 72 18 84 Q21 88 25 86 Q28 72 28 58 Q24 57 20 58Z" fill={getColor('quads')} />
        <path d="M32 58 Q32 72 35 86 Q39 88 42 84 Q43 72 40 58 Q36 57 32 58Z" fill={getColor('quads')} />

        {/* Calves (front visible) */}
        <path d="M18 87 Q16 98 18 108 Q20 110 23 108 Q25 98 24 87 Q21 86 18 87Z" fill={getColor('calves')} />
        <path d="M36 87 Q38 98 40 108 Q43 110 45 108 Q46 98 44 87 Q41 86 36 87Z" fill={getColor('calves')} />
      </svg>

      {/* Back View */}
      <svg width={w} height={h} viewBox="0 0 60 120" fill="none">
        {/* Head */}
        <ellipse cx="30" cy="8" rx="7" ry="8" fill="#EDE7DD" />
        {/* Neck */}
        <rect x="27" y="15" width="6" height="5" rx="1" fill="#EDE7DD" />

        {/* Traps / Upper Back */}
        <path
          d="M18 20 Q16 18 14 22 Q13 28 16 30 Q20 22 30 20 Q40 22 44 30 Q47 28 46 22 Q44 18 42 20 Q36 17 30 17 Q24 17 18 20Z"
          fill={getColor('shoulders')}
        />

        {/* Back (lats) */}
        <path
          d="M14 28 Q12 38 15 50 Q18 55 22 53 Q27 50 28 38 Q29 30 30 28 Q31 30 32 38 Q33 50 38 53 Q42 55 45 50 Q48 38 46 28 Q38 25 30 24 Q22 25 14 28Z"
          fill={getColor('back')}
        />

        {/* Rear delts */}
        <ellipse cx="13" cy="28" rx="5" ry="6" fill={getColor('shoulders')} opacity="0.85" />
        <ellipse cx="47" cy="28" rx="5" ry="6" fill={getColor('shoulders')} opacity="0.85" />

        {/* Triceps */}
        <path d="M7 32 Q5 42 8 50 Q11 52 14 50 Q16 42 15 32 Q12 30 7 32Z" fill={getColor('triceps')} />
        <path d="M45 32 Q44 42 46 50 Q49 52 52 50 Q55 42 53 32 Q50 30 45 32Z" fill={getColor('triceps')} />

        {/* Forearms back */}
        <path d="M7 51 Q5 60 8 66 Q10 68 13 66 Q15 60 14 51 Q11 50 7 51Z" fill={getColor('forearms')} />
        <path d="M46 51 Q47 60 46 66 Q48 68 51 66 Q53 60 52 51 Q49 50 46 51Z" fill={getColor('forearms')} />

        {/* Lower back / erectors */}
        <rect x="25" y="52" width="10" height="10" rx="2" fill={getColor('back')} opacity="0.7" />

        {/* Glutes */}
        <path d="M19 58 Q16 68 18 76 Q22 80 27 77 Q30 72 30 62 Q27 57 19 58Z" fill={getColor('glutes')} />
        <path d="M33 62 Q33 72 34 77 Q38 80 42 76 Q45 68 41 58 Q35 57 33 62Z" fill={getColor('glutes')} />

        {/* Hamstrings */}
        <path d="M19 77 Q17 88 18 97 Q21 100 25 98 Q27 88 28 78 Q24 76 19 77Z" fill={getColor('hamstrings')} />
        <path d="M32 78 Q33 88 35 98 Q39 100 42 97 Q44 88 41 77 Q37 76 32 78Z" fill={getColor('hamstrings')} />

        {/* Calves back */}
        <path d="M18 98 Q16 108 19 116 Q21 118 24 116 Q26 108 25 98 Q22 97 18 98Z" fill={getColor('calves')} />
        <path d="M35 98 Q37 108 40 116 Q43 118 45 116 Q46 108 44 98 Q41 97 35 98Z" fill={getColor('calves')} />
      </svg>
    </div>
  )
}
