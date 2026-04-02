import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050510",
        foreground: "#f0f0ff",
        card: "rgba(255, 255, 255, 0.03)",
        "card-hover": "rgba(255, 255, 255, 0.06)",
        border: "rgba(255, 255, 255, 0.06)",
        "border-glow": "rgba(255, 255, 255, 0.12)",
        muted: "rgba(255, 255, 255, 0.4)",
        subtle: "rgba(255, 255, 255, 0.2)",
        success: "#34d399",
        danger: "#f87171",
        warning: "#fbbf24",
        glow: {
          1: "#6366f1",
          2: "#8b5cf6",
          3: "#06b6d4",
        },
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
export default config;
