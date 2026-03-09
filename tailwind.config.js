/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './screens/**/*.{js,ts,tsx}'],
  darkMode: 'class',

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2B468B",
          light: "#3458B0",
          dark: "#1E3A8A",
          muted: "#F0F7FF"
        },
        surface: {
          light: "#FFFFFF",
          dark: "#0F172A",
          muted: "#F8FAFC"
        }
      },
    },
  },
  plugins: [],
};
