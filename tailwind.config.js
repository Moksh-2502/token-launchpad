/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#10B981",
        accent: "#8B5CF6",
        background: "#F9FAFB",
        foreground: "#111827"
      }
    }
  },
  plugins: []
}
