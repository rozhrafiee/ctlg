/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Municipal palette: professional, trustworthy, user-friendly
        primary: {
          DEFAULT: "#1e4d6b",
          dark: "#153a52",
          light: "#2a6b8f",
          soft: "#e8f2f7",
        },
        secondary: {
          DEFAULT: "#0d7377",
          dark: "#0a5c5f",
          light: "#12989c",
          soft: "#e6f5f5",
        },
        accent: {
          DEFAULT: "#c4a747",
          dark: "#a68b3a",
          light: "#d4b85c",
          soft: "#f9f5e8",
        },
        neutral: {
          50: "#f8fafb",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        background: "#f8fafb",
      },
      fontFamily: {
        sans: ["Vazirmatn", "Vazir", "Tahoma", "Inter", "system-ui", "sans-serif"],
      },
      container: {
        center: true,
        padding: "1rem",
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1400px",
        },
      },
      boxShadow: {
        soft: "0 2px 8px rgba(30, 77, 107, 0.08)",
        card: "0 4px 16px rgba(30, 77, 107, 0.1)",
        elevated: "0 8px 24px rgba(30, 77, 107, 0.12)",
      },
    },
  },
  plugins: [],
};
