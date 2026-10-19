import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        base: ["16px", { lineHeight: "1.5" }],
        sm: ["15px", { lineHeight: "1.5" }],
      },
      colors: {
        background: "#F3F7F6",
        primary: {
          DEFAULT: "#2F8F83",
          foreground: "#ffffff",
          light: "#E4F3F1",
          dark: "#236F65",
        },
        card: "#ffffff",
        border: "#E2EEEC",
        text: {
          DEFAULT: "#1F2D2B",
          muted: "#5A7370",
        },
        success: {
          DEFAULT: "#22A665",
          light: "#E8F8F1",
          foreground: "#155740",
        },
        warning: {
          DEFAULT: "#E8962A",
          light: "#FEF3E2",
          foreground: "#7C4D0D",
        },
        danger: {
          DEFAULT: "#D94F4F",
          light: "#FDECEA",
          foreground: "#7A1F1F",
        },
        info: {
          DEFAULT: "#3B7FC4",
          light: "#EBF3FC",
          foreground: "#1D4C7A",
        },
      },
      borderRadius: {
        DEFAULT: "12px",
        lg: "14px",
        md: "10px",
        sm: "8px",
        xs: "6px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(31, 45, 43, 0.06)",
        sm: "0 1px 2px 0 rgba(31, 45, 43, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
