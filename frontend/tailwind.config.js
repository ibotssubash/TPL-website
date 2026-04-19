/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#070b14",
        panel: "#111a2b",
        panelSoft: "#17233a",
        accent: "#ef4444",
        accentMuted: "#fb923c"
      },
      boxShadow: {
        glow: "0 0 30px rgba(251, 146, 60, 0.22)"
      }
    }
  },
  plugins: []
};
