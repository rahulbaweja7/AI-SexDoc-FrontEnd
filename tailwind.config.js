/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#3b82f6',
          coral: '#ff6b6b',
        },
      },
      boxShadow: {
        glow: '0 10px 30px rgba(59,130,246,0.25)',
      },
    },
  },
  plugins: [],
};
