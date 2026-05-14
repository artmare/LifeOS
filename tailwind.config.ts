import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#08080c",
          soft: "#0e0e16",
          card: "#12121c",
          elevated: "#181826",
        },
        ink: {
          DEFAULT: "#f5f5fa",
          dim: "#a4a4b8",
          muted: "#6c6c82",
        },
        brand: {
          violet: "#8b5cf6",
          indigo: "#6366f1",
          cyan: "#22d3ee",
          pink: "#ec4899",
          gold: "#fbbf24",
          emerald: "#10b981",
        },
        rarity: {
          common: "#9ca3af",
          rare: "#3b82f6",
          epic: "#a855f7",
          legendary: "#f59e0b",
          mythic: "#ec4899",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Inter", "sans-serif"],
        display: ["ui-sans-serif", "system-ui", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(139, 92, 246, 0.5)",
        "glow-cyan": "0 0 40px -10px rgba(34, 211, 238, 0.5)",
        "glow-gold": "0 0 40px -10px rgba(251, 191, 36, 0.6)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px -20px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(139,92,246,0.18), transparent 60%), radial-gradient(ellipse at bottom right, rgba(34,211,238,0.10), transparent 50%)",
        "rarity-legendary":
          "linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #f59e0b 100%)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 20px -5px rgba(139,92,246,0.5)" },
          "50%": { boxShadow: "0 0 40px -5px rgba(139,92,246,0.9)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s linear infinite",
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
