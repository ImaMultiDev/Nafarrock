import type { Config } from "tailwindcss";

/**
 * Nafarrock - Estética rock/punk oscura
 * Colores: negros, rojos, amarillos ácidos, grises industriales
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta rock/punk
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
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
