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
        primary: {
          DEFAULT: '#FFC107',
          dark: '#E0A800',
          light: '#FFD54F',
        },
        bgPrimary: 'var(--bg-primary)',
        bgSecondary: 'var(--bg-secondary)',
        cardBgColor: 'var(--card-bg)',
        surface: 'var(--surface)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        borderColor: 'var(--border-color)',
        buttonPrimary: 'var(--button-primary)',
        buttonSecondary: 'var(--button-secondary)',
        accent: 'var(--accent)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        
        darkBg: 'var(--bg-primary)',
        secondaryBg: 'var(--bg-secondary)',
        cardBg: 'var(--card-bg)',
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
