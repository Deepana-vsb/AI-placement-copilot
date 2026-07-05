import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Lavender AI Design System ── */
        "primary":    "#7C3AED",
        "primary-hover": "#6D28D9",
        "accent":     "#06B6D4",
        "background": "#FCFCFF",
        "navbar":     "#312E81",
        "sidebar":    "#4338CA",
        "card":       "#FFFFFF",
        "heading":    "#1F2937",
        "body-text":  "#6B7280",
        "placeholder":"#94A3B8",
        "border":     "#E5E7EB",
        "border-light": "#F3F4F6",
        "table-alt":  "#F8FAFC",

        /* ── Semantic aliases (used in legacy JSX) ── */
        "secondary":  "#06B6D4",

        /* Text on surfaces */
        "on-surface":         "#1F2937",
        "on-surface-variant": "#6B7280",
        "on-background":      "#1F2937",
        "on-primary":         "#FFFFFF",
        "on-secondary":       "#FFFFFF",

        /* Status colours */
        "error":              "#DC2626",
        "error-container":    "#FFF1F2",
        "on-error":           "#FFFFFF",
        "on-error-container": "#BE123C",

        /* Container tints */
        "secondary-container":     "rgba(6,182,212,0.10)",
        "primary-container":       "rgba(124,58,237,0.10)",
        "on-secondary-container":  "#7C3AED",
        "on-primary-container":    "#7C3AED",
        "on-secondary-fixed":      "#7C3AED",
        "on-secondary-fixed-variant": "#7C3AED",

        /* Outline / borders */
        "outline":         "#E5E7EB",
        "outline-variant": "#F3F4F6",

        /* Legacy surfaces (kept for backward compat) */
        "surface":                    "#FCFCFF",
        "surface-dim":                "#F3F4F6",
        "surface-container":          "#FFFFFF",
        "surface-container-high":     "rgba(124,58,237,0.08)",
        "surface-container-highest":  "#F8FAFC",
        "surface-container-lowest":   "#FCFCFF",
        "surface-container-low":      "#FAFAFA",
        "surface-variant":            "#F8FAFC",
        "surface-bright":             "#FFFFFF",
        "surface-tint":               "#7C3AED",
        "inverse-surface":            "#1F2937",
        "inverse-on-surface":         "#FFFFFF",
        "inverse-primary":            "#C4B5FD",
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "-apple-system", "sans-serif"],
      },
      spacing: {
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "40px",
        "gutter": "24px",
        "container-max": "1280px",
        "base": "4px",
      },
      borderRadius: {
        "DEFAULT": "8px",
        "sm":   "6px",
        "md":   "10px",
        "lg":   "12px",
        "xl":   "16px",
        "2xl":  "20px",
        "3xl":  "24px",
        "full": "9999px",
      },
      boxShadow: {
        "card":  "0 8px 24px rgba(0,0,0,0.08)",
        "hover": "0 16px 40px rgba(0,0,0,0.14)",
        "btn":   "0 4px 12px rgba(124,58,237,0.30)",
        "ring":  "0 0 0 4px rgba(124,58,237,0.15)",
      },
      keyframes: {
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-ring": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(6,182,212,0.40)" },
          "50%":      { boxShadow: "0 0 0 12px rgba(6,182,212,0.00)" },
        },
      },
      animation: {
        "fade-in-up":  "fade-in-up 0.4s ease both",
        "scale-in":    "scale-in 0.3s ease both",
        "pulse-ring":  "pulse-ring 2s ease-in-out infinite",
        "slide-up":    "fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
