import { useEffect, useState } from "react";
import { adaptiveLearningAPI } from "../services/api";

const LearningPath = () => {
  const [path, setPath] = useState([]); // مسیرهای یادگیری
  const [loading, setLoading] = useState(true); // وضعیت بارگذاری

  useEffect(() => {
    load(); // بارگذاری داده‌ها هنگام بارگذاری کامپوننت
  }, []);

  const load = async () => {
    setLoading(true); // شروع بارگذاری داده‌ها
    try {
      const res = await adaptiveLearningAPI.learningPath(); // دریافت مسیر یادگیری از API
      setPath(res.data?.results ?? res.data ?? []); // ذخیره داده‌ها در وضعیت
    } catch (e) {
      console.error("خطا در بارگذاری مسیر یادگیری:", e); // گزارش خطا در کنسول
    } finally {
      setLoading(false); // پایان بارگذاری
    }
  };

  if (loading) return <div className="loading">در حال بارگذاری...</div>; // نمایش بارگذاری

  return (
    <div className="container">
      <h1>مسیر یادگیری</h1>
      {path.length === 0 ? (
        <p>مسیر یادگیری موجود نیست.</p> // در صورت عدم وجود مسیر یادگیری
      ) : (
        <ul>
          {path.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>{" "}
              {item.is_locked ? "🔒 قفل" : "✅ باز"} {/* نمایش وضعیت قفل بودن یا باز بودن */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LearningPath;
