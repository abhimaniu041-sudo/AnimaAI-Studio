/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Rajdhani', 'sans-serif'],
        body: ['Exo 2', 'sans-serif'],
      },
      colors: {
        deep: '#0f0a1e',
        void: '#080612',
        neon: '#00f5d4',
        plasma: '#f72585',
        gold: '#ffd60a',
        glow: '#7209b7',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      }
    }
  },
  plugins: []
}
