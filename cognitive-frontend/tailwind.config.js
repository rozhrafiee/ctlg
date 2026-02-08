/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // اگر فایل‌های دیگر دارید اضافه کنید
  ],
  theme: {
    extend: {
      colors: {
        // رنگ‌های سفارشی اگر نیاز دارید
        primary: "#3b82f6",
        secondary: "#10b981",
      },
      fontFamily: {
        // فونت‌های سفارشی
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}