/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          gray: '#86868b',
          dark: '#1d1d1f',
          black: '#000000',
          light: '#f5f5f7',
          blue: '#0071e3',
          border: '#d2d2d7',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'elevated': '0 12px 30px -10px rgba(0,0,0,0.12)',
      }
    },
  },
  plugins: [],
}
