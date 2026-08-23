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
        espresso: {
          DEFAULT: "#2C221E",
          dark: "#231B17",
          light: "#3A2E2A",
        },
        gold: {
          DEFAULT: "#846338",
          medium: "#9A7B4F",
          bright: "#D4AF37",
          light: "#F3E7C4",
        },
        canvas: "#E5DFD7",
        surface: {
          DEFAULT: "#FBF9F4",
          alt: "#FAF5EE",
        },
        border: {
          light: "#E8E1D5",
          DEFAULT: "#DACFBF",
          dark: "#C0B29E",
        },
        subtext: {
          DEFAULT: "#6E6359",
          muted: "#9E948A",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #846338 0%, #D4AF37 50%, #9A7B4F 100%)",
        "espresso-gradient": "linear-gradient(180deg, #2C221E 0%, #231B17 100%)",
        "surface-gradient": "linear-gradient(180deg, #FBF9F4 0%, #FAF5EE 100%)",
      },
      boxShadow: {
        luxury: "0 10px 30px -5px rgba(44, 34, 30, 0.08), 0 4px 12px rgba(132, 99, 56, 0.05)",
        "gold-glow": "0 0 20px rgba(212, 175, 55, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
