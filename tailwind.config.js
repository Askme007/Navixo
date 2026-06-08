// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    "backdrop-blur",
    "backdrop-blur-sm",
    "backdrop-blur-md",
    "backdrop-blur-xl",
    "bg-white/10",
    "bg-white/5",
  ],
};
