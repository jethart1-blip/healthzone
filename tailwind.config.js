/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        pageBg: 'var(--color-page-bg)',
        surface: 'var(--color-surface)',
        surface2: 'var(--color-surface2)',
        textPrimary: 'var(--color-text-primary)',
        textMuted: 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
        accentGreen: 'var(--color-accent-green)',
        calorie: 'var(--color-calorie)',
        protein: 'var(--color-protein)',
        carbs: 'var(--color-carbs)',
        fat: 'var(--color-fat)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        ringTrack: 'var(--color-ring-track)',
      },
      keyframes: {
        'page-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ring-pop': {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '60%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'page-fade-in': 'page-fade-in 0.35s ease-out forwards',
        'ring-pop': 'ring-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
    },
  },
  plugins: [],
}
