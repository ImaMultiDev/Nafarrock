import type { Config } from "tailwindcss";

/**
 * Nafarrock - Estética punk-rock agresiva
 * Colores: negros puros, rojo sangre, amarillo ácido, rosa neón, blanco cortante
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        nav: "1470px", // Menú completo (no hamburguesa) a partir de este ancho
      },
      colors: {
        punk: {
          black: "#0a0a0a",
          red: "#E60026",
          blood: "#b91c1c",
          yellow: "#ffd60a",
          green: "#00C853",
          acid: "#c8ff00",
          pink: "#ff006e",
          white: "#f8f8f8",
        },
        rock: {
          50: "#fef7ee",
          100: "#fcedd7",
          200: "#f8d7ae",
          300: "#f3bc7a",
          400: "#ed9a45",
          500: "#e97c1f",
          600: "#da6215",
          700: "#b44a13",
          800: "#8f3b17",
          900: "#743216",
          950: "#3f1709",
        },
        void: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#1a1a1a",
          950: "#0d0d0d",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        punch: ["var(--font-punch)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      animation: {
        glitch: "glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite",
        "glitch-slow": "glitch 2s ease-in-out both infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "flicker": "flicker 0.15s infinite",
      },
      keyframes: {
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-3px, 3px)" },
          "40%": { transform: "translate(-3px, -3px)" },
          "60%": { transform: "translate(3px, 3px)" },
          "80%": { transform: "translate(3px, -3px)" },
          "100%": { transform: "translate(0)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
      maxWidth: {
        "content-wide": "min(1600px, 92vw)",
      },
      minHeight: {
        "hero-cap": "min(100dvh, 820px)",
      },
      spacing: {
        "section-gap": "clamp(1.5rem, 4vh, 3rem)",
      },
      backgroundImage: {
        noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        "grid-punk": "linear-gradient(rgba(0,200,83,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,83,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
