/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyberblue: '#00f0ff',
        warmorange: '#ff9e00',
        midnight: '#0b0f19',
      }
    },
  },
  plugins: [],
}