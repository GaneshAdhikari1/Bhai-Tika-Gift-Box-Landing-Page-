/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#24151c",
        plum: "#631c3a",
        wine: "#8b2f4e",
        saffron: "#d9952d",
        ivory: "#fffaf1",
        rosewash: "#f8e9e8",
        evergreen: "#174f43"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(99, 28, 58, 0.16)",
        card: "0 16px 50px rgba(36, 21, 28, 0.10)"
      },
      fontFamily: {
        sans: ["Inter", "Aptos", "Segoe UI", "Arial", "sans-serif"],
        display: ["Georgia", "Times New Roman", "serif"]
      }
    }
  },
  plugins: []
};
