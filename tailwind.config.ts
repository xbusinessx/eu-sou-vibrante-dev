import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        space: "#05050b",
        midnight: "#0a1430",
        pearl: "#f7f1e6",
        aurora: "#8ef9ff",
        lavender: "#c9b6ff",
        gold: "#d7b46a",
      },
      fontFamily: {
        sans: ["var(--font-site)"],
        display: ["var(--font-display)"],
      },
      boxShadow: {
        glow: "0 0 46px rgba(142, 249, 255, 0.22)",
        gold: "0 0 44px rgba(215, 180, 106, 0.2)",
      },
      backgroundImage: {
        "cosmic-radial":
          "radial-gradient(circle at 70% 20%, rgba(142, 249, 255, 0.18), transparent 32%), radial-gradient(circle at 20% 15%, rgba(201, 182, 255, 0.16), transparent 30%), linear-gradient(135deg, #05050b 0%, #0a1430 48%, #140d27 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
