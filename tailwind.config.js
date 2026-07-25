/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        charcoal: '#222222',
        slate: '#45515e',
        steel: '#5f5f5f',
        stone: '#8e8e93',
        muted: '#a8aab2',
        canvas: '#ffffff',
        surface: '#f7f8fa',
        'surface-soft': '#f2f3f5',
        hairline: '#e5e7eb',
        'hairline-soft': '#eaecf0',
        coral: '#ff5530',
        magenta: '#ea5ec1',
        minimaxBlue: '#1456f0',
        cyan: '#3daeff',
        purple: '#a855f7',
        success: '#1ba673',
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
