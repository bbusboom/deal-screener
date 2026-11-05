/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"], mono: ["JetBrains Mono", "ui-monospace", "monospace"] },
      colors: {
        ink: "#0f172a", brand: { 50: "#eef4fb", 100: "#d9e6f5", 500: "#2563a6", 600: "#1f4e79", 700: "#173b5c", 900: "#0b1f33" },
        pass: { 50: "#e9f7ef", 600: "#1e7a4c" }, fail: { 50: "#fdecea", 600: "#b3261e" },
      },
      boxShadow: { card: "0 1px 2px rgba(15,23,42,.04), 0 1px 8px rgba(15,23,42,.04)" },
    },
  },
  plugins: [],
}
