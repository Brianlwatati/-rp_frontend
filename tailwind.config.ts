import type { Config } from "tailwindcss";

// Reads each color from a CSS custom property (set per-theme in globals.css)
// as "R G B" channels, so Tailwind's opacity modifiers (e.g. bg-base-800/60)
// keep working across themes.
const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: withOpacity("--color-base-950"), // app background
          900: withOpacity("--color-base-900"), // sidebar / topbar
          800: withOpacity("--color-base-800"), // panel
          700: withOpacity("--color-base-700"), // panel hover / border
          600: withOpacity("--color-base-600"), // divider
        },
        ink: {
          100: withOpacity("--color-ink-100"), // primary text
          300: withOpacity("--color-ink-300"), // secondary text
          500: withOpacity("--color-ink-500"), // muted text
        },
        signal: {
          cyan: withOpacity("--color-signal-cyan"),
          amber: withOpacity("--color-signal-amber"),
          green: withOpacity("--color-signal-green"),
          red: withOpacity("--color-signal-red"),
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "badge-rise": {
          "0%": { transform: "translateY(16px) rotate(-2deg)", opacity: "0" },
          "100%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
        },
        "punch": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "badge-rise": "badge-rise 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
        "punch": "punch 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
