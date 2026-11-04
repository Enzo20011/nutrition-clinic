/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'sm': '576px',   // mòviles
      'md': '768px',   // tablets vertical
      'lg': '992px',   // tablets horizontal / medianas
      'xl': '1200px',  // desktops comunes
      '2xl': '1600px', // pantallas grandes / 4K
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        label: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        // Semantic tokens — resolved via CSS variables so light/dark
        // switch automatically without !important overrides.
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        border: 'var(--border)',
        'border-soft': 'var(--border-soft)',
        fg: 'var(--fg)',
        'fg-dim': 'var(--fg-dim)',
        'fg-muted': 'var(--fg-muted)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        'accent-soft': 'var(--accent-soft)',
        'accent-fg': 'var(--accent-fg)',
        success: 'var(--success)',
        'success-soft': 'var(--success-soft)',
        warning: 'var(--warning)',
        'warning-soft': 'var(--warning-soft)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',

        // Legacy aliases kept so any not-yet-migrated component still
        // resolves to the new palette instead of a stale hardcoded color.
        bone: 'var(--fg)',
        darkNavy: 'var(--bg)',
        navy: { DEFAULT: 'var(--surface)', dark: 'var(--surface-2)', deep: 'var(--bg)' },
        cardDark: 'var(--surface)',
        accentBlue: 'var(--accent)',
      },
      animation: {
        pulse: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '60px',
      },
      backgroundImage: {
        'gradient-top': 'linear-gradient(to top, var(--bg) 60%, transparent)',
      },
    },
  },
  plugins: [],
}
