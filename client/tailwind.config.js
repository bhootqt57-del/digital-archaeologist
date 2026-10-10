/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0B0D12",
        surface: "#11151D",
        panel: "#171D28",
        borderMuted: "#273244",
        accentCyan: "#55D6E8",
        accentViolet: "#9B8AFB"
      }
    }
  },
  plugins: []
};
