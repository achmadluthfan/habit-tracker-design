import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f7f3ee",
        card: "#fffcf8",
        muted: "#f0ebe3",
        border: "#e8e0d4",
        "border-strong": "#d4c9b8",
        ink: "#2d2520",
        "ink-mid": "#6b5e52",
        "ink-muted": "#9e8e80",
        accent: "#e8825a",
        "accent-light": "#fae8df",
        gold: "#c9a96e",
        "gold-light": "#f5eddb",
        green: "#4caf7d",
        "green-light": "#dff4eb",
        blue: "#6b9fd4",
        "blue-light": "#deeaf7",
        purple: "#9b7fd4",
        "purple-light": "#ede5f7",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "DM Mono", "monospace"],
        display: ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        sm: "0 1px 3px rgba(45,37,32,0.06)",
        md: "0 4px 16px rgba(45,37,32,0.08)",
        lg: "0 8px 32px rgba(45,37,32,0.10)",
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
