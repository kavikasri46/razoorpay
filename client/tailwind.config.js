/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Support toggling dark mode via className="dark"
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#030712',      // Very dark gray/black background
          navy: '#0b1329',      // Deep navy blue
          slate: '#1e293b',     // Smooth slate blue for cards
          accent: '#06b6d4',    // Cyan electric blue
          accentHover: '#0891b2',
          success: '#10b981',   // Emerald green
          warning: '#f59e0b',   // Amber warning
          danger: '#ef4444',    // Crimson red
          textMuted: '#94a3b8', // Cool gray text
          border: '#334155',    // Card border
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
