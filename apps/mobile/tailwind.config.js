const { createPreset } = require('nativewind/preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './providers/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [createPreset()],
  theme: {
    extend: {
      colors: {
        primary: '#5A67D8',
        accent: '#38B2AC',
        warning: '#F6AD55',
        error: '#E53E3E',
        background: '#F7FAFC',
        graphite: '#1A202C',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 10px 30px rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [],
};
