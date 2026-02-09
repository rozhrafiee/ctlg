/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3b82f6",
          dark: "#2563eb",
          light: "#dbeafe",
        },
        secondary: "#10b981",
        accent: "#f59e0b", // رنگ نارنجی برای دکمه‌های هشدار یا مهم
        background: "#f8fafc", // رنگ ملایم برای کل صفحه
      },
      fontFamily: {
        // برای فارسی بهتر است از فونت‌هایی مثل Vazir یا IRANSans استفاده کنید
        // اگر ندارید، این ترتیب بهترین نمایش را در ویندوز و موبایل دارد
        sans: ["Tahoma", "Inter", "system-ui", "sans-serif"],
      },
      container: {
        center: true,
        padding: '1rem', // جلوگیری از چسبیدن محتوا به لبه‌های صفحه
      },
    },
  },
  plugins: [
    // این پلاگین‌ها رو اگر نصب نداری حتما نصب کن (npm install @tailwindcss/forms @tailwindcss/typography)
    // این‌ها ظاهر اینپوت‌ها و متن‌های طولانی رو خودکار اصلاح می‌کنن
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
}