/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#25D366',
        dark: '#111B21',
        light: '#F0F2F5',
      },
    },
  },
  plugins: [],
};
