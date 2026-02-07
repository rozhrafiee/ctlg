import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Brain,
  BookOpen,
  TrendingUp,
  Users,
  ArrowLeft,
  CheckCircle,
  Sparkles,
} from "lucide-react";

import "@/styles/global-styles.css";
import "@/styles/homepage.css";

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate(
        user.role === "student"
          ? "/student/dashboard"
          : "/teacher/dashboard"
      );
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="home-page min-h-screen bg-slate-50">

      {/* ================= Hero ================= */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10" />

        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/70 backdrop-blur rounded-full border border-gray-200">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700">
              سیستم یادگیری هوشمند
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            سیستم یادگیری هوشمند
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mt-2">
              شناختی
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-700 mb-10">
            یادگیری شخصی‌سازی‌شده بر اساس توانایی‌های شناختی  
            با کمک هوش مصنوعی
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
            >
              <span className="flex items-center gap-2">
                {user ? "ورود به داشبورد" : "شروع یادگیری"}
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </span>
            </button>

            <button
              onClick={() => navigate("/about")}
              className="px-8 py-4 bg-white text-gray-800 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition"
            >
              درباره سیستم
            </button>
          </div>
        </div>
      </section>

      {/* ================= Features ================= */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              امکانات اصلی سیستم
            </h2>
            <p className="text-gray-600">
              ابزارهای ضروری برای یادگیری هوشمند و هدفمند
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Feature
              icon={<Brain />}
              title="ارزیابی شناختی"
              text="سنجش علمی سطح یادگیری"
              color="from-blue-500 to-blue-600"
            />
            <Feature
              icon={<TrendingUp />}
              title="یادگیری تطبیقی"
              text="هماهنگ با سرعت شما"
              color="from-green-500 to-emerald-600"
            />
            <Feature
              icon={<BookOpen />}
              title="مسیر آموزشی"
              text="برنامه‌ریزی دقیق و هدفمند"
              color="from-purple-500 to-violet-600"
            />
            <Feature
              icon={<Users />}
              title="پنل استاد"
              text="تحلیل پیشرفت دانش‌آموزان"
              color="from-pink-500 to-rose-600"
            />
          </div>
        </div>
      </section>

      {/* ================= Steps ================= */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-12">
            شروع فقط در ۳ مرحله
          </h2>

          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <Step number="۱" title="ثبت‌نام" />
            <Step number="۲" title="دریافت برنامه" />
            <Step number="۳" title="شروع یادگیری" />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-black mb-6">
          آماده شروع هستید؟
        </h2>
        <p className="mb-10 text-indigo-100">
          همین حالا یادگیری هوشمند را شروع کنید
        </p>

        <button
          onClick={() => navigate("/register")}
          className="px-10 py-4 bg-white text-indigo-600 font-bold rounded-xl shadow-xl hover:bg-gray-50 transition"
        >
          ثبت‌نام رایگان
        </button>
      </section>

      {/* ================= Footer ================= */}
      <footer className="py-8 bg-gray-900 text-gray-400 text-center text-sm">
        © ۲۰۲۴ سیستم یادگیری هوشمند شناختی
      </footer>
    </div>
  );
}

/* ===== Small Components ===== */

function Feature({ icon, title, text, color }) {
  return (
    <div className="group p-6 rounded-2xl bg-white shadow-md hover:-translate-y-2 transition">
      <div
        className={`w-14 h-14 mb-6 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{text}</p>
      <div className="flex items-center text-sm mt-4 text-indigo-600">
        <CheckCircle className="w-4 h-4 ml-1" />
        تایید شده
      </div>
    </div>
  );
}

function Step({ number, title }) {
  return (
    <div>
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-lg">
        {number}
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    </div>
  );
}

export default HomePage;
