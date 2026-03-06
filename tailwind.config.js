/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        'background-secondary': '#F7F7F7',
        'text-primary': '#0A0A0A',
        'text-secondary': '#4A4A4A',
        'text-muted': '#A0A0A0',
        'border-color': '#E0E0E0',
        accent: '#0A0A0A',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Hiragino Sans', 'Noto Sans JP', 'sans-serif'],
        serif: ['Georgia', 'Hiragino Mincho ProN', 'serif'],
      },
    },
  },
  plugins: [],
}
