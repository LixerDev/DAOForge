/** @type {import('tailwindcss').Config} */
  module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          forge: { 50: "#f0f4ff", 100: "#dde6ff", 200: "#c0ccff", 300: "#9aabff", 400: "#717fff", 500: "#4f57fb", 600: "#3b38f0", 700: "#302bd6", 800: "#2826ac", 900: "#262888" },
          dark: { 900: "#0a0a0f", 800: "#13131f", 700: "#1a1a2e", 600: "#24243e" }
        },
        fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      },
    },
    plugins: [],
  };
  