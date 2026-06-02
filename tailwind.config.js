/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        ox: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#c96868',
          500: '#b03c3c',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#3d0e0e',
          900: '#240808',
        },
      },
    },
  },
  plugins: [],
};
