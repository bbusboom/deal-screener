/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"], mono: ["JetBrains Mono", "ui-monospace", "monospace"], display: ["Fraunces", "Georgia", "serif"] },
      colors: {
        ink: "#0f172a", night: "#070b1c",
        brand: { 50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc", 400: "#7b8ff7", 500: "#4f6bed", 600: "#3a55d6", 700: "#2c41a8", 800: "#1d2c6e", 900: "#0c1533" },
        gold: { 50: "#fff8eb", 100: "#ffefcc", 200: "#ffe2b0", 300: "#ffd28a", 400: "#ffb36b", 500: "#ff8a3d", 600: "#e5701f", 700: "#b4530f" },
        pass: { 50: "#e8f8ef", 100: "#c9eed9", 500: "#22a165", 600: "#167a4a", 700: "#0f5c37" },
        fail: { 50: "#fdeeee", 100: "#f9d3d1", 500: "#e0443b", 600: "#b3261e", 700: "#8a1c16" },
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,64,.05), 0 4px 16px -6px rgba(16,24,64,.08)",
        lift: "0 2px 4px rgba(16,24,64,.06), 0 12px 32px -12px rgba(16,24,64,.18)",
        glow: "0 0 0 1px rgba(255,210,138,.35), 0 8px 30px -8px rgba(255,138,61,.55)",
      },
    },
  },
  plugins: [],
}
