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
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          dark: '#E0A800',
          light: '#FFD54F',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        darkBg: 'var(--background)',
        secondaryBg: 'var(--secondary)',
        cardBg: 'var(--card)',
        accentBlue: '#00CFFF',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'yellow-glow': '0 0 15px rgba(255, 193, 7, 0.4)',
        'yellow-glow-lg': '0 0 25px rgba(255, 193, 7, 0.6)',
        'blue-glow': '0 0 15px rgba(0, 207, 255, 0.4)',
        'blue-glow-lg': '0 0 25px rgba(0, 207, 255, 0.6)',
        'card-hover': '0 10px 30px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
}
