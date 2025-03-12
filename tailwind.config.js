/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dark': {
          DEFAULT: '#000000',
          50: '#111111',
          100: '#1a1a1a',
          200: '#222222',
          300: '#333333',
          400: '#444444',
          500: '#555555',
          600: '#666666',
          700: '#777777',
          800: '#888888',
          900: '#999999',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
};