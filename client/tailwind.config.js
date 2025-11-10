/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Safelist critical custom classes to ensure they're always included
  safelist: [
    'btn-gradient-primary',
    'glassy-card',
    'card-border',
    'floating-element',
    'floating-glow',
    {
      pattern: /^(bg|text|border)-(cyan|purple|emerald|yellow|rose|violet)-(300|400|500)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
      },
    },
  },
  plugins: [
    // eslint-disable-next-line no-undef
    require('daisyui'),
  ],
  daisyui: {
    themes: ['dark'],
  },
}

