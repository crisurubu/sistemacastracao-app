/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ong: {
          dark: '#020617',
          card: '#0f172a',
          blue: '#2563eb',
          green: '#059669',
          border: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}