/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Open Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        dbs: {
          red: '#dc143c',
          blue: '#003d82',
          gray: '#6b7280',
          light: '#f8fafc',
        }
      },
      spacing: {
        '18': '4.5rem',
        '86': '21.5rem',
      }
    },
  },
  plugins: [],
}