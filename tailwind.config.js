/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        luxury: {
          dark: '#070b1c',
          indigo: '#151b3b',
          violet: '#2a1758',
          accent: '#8b5cf6',
          cyan: '#22d3ee'
        }
      },
      boxShadow: {
        glow: '0 0 30px rgba(139, 92, 246, 0.35)'
      }
    }
  },
  plugins: []
};
