export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f5', 100: '#ffe4ec', 200: '#ffc9da', 300: '#ff9dba',
          400: '#ff6393', 500: '#ff2d78', 600: '#ed145d', 700: '#c90a4c',
          800: '#a60c47', 900: '#8a0f41',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}