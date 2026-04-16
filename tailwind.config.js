/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: '#FAFAF8',
        ink: '#1a1a1a',
        muted: '#999',
        border: '#e8e8e4',
        subtle: '#f0f0ec',
      },
    },
  },
  plugins: [],
}
