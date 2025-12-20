import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../utils/api";
import { useAuthStore } from "../../store/authStore";

interface TestResult {
  id: number;
  test: {
    id: number;
    title: string;
  };
  total_score: number;
  resulting_level: number;
  finished_at: string;
}

export default function TestResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, fetchMe } = useAuthStore();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadResult();
      if (user) {
        setPreviousLevel(user.cognitive_level);
      }
    }
  }, [sessionId]);

  const loadResult = async () => {
    try {
      const res = await api.get(`/api/assessment/sessions/${sessionId}/`);
      setResult(res.data);
      // به‌روزرسانی اطلاعات کاربر برای دریافت سطح جدید
      await fetchMe();
    } catch (err) {
      console.error("خطا در بارگذاری نتیجه:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>در حال بارگذاری نتیجه...</div>;
  if (!result) return <div>نتیجه یافت نشد.</div>;

  const newLevel = result.resulting_level;
  const levelUp = previousLevel !== null && newLevel > previousLevel;
  const currentUserLevel = user?.cognitive_level || newLevel;

  // محاسبه درصد نمره (فرض: حداکثر نمره 100)
  const scorePercentage = Math.min((result.total_score / 100) * 100, 100);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="card" style={{ textAlign: "center", padding: "30px" }}>
        <h2>نتیجه آزمون: {result.test.title}</h2>

        {levelUp && (
          <div
            style={{
              backgroundColor: "#d4edda",
              border: "2px solid #28a745",
              borderRadius: "8px",
              padding: "20px",
              margin: "20px 0",
            }}
          >
            <h3 style={{ color: "#155724", margin: "0 0 10px 0" }}>
              🎉 تبریک! سطح شما افزایش یافت!
            </h3>
            <p style={{ color: "#155724", fontSize: "18px", margin: 0 }}>
              از سطح {previousLevel} به سطح {newLevel} ارتقا یافتید
            </p>
          </div>
        )}

        <div style={{ margin: "30px 0" }}>
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: scorePercentage >= 70 ? "#28a745" : scorePercentage >= 50 ? "#ffc107" : "#dc3545",
              marginBottom: "10px",
            }}
          >
            {result.total_score.toFixed(1)}
          </div>
          <p style={{ fontSize: "18px", color: "#666" }}>نمره شما</p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-around", margin: "30px 0" }}>
          <div className="card" style={{ flex: 1, margin: "0 10px" }}>
            <h3>سطح جدید</h3>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "#007bff" }}>
              {currentUserLevel}
            </div>
          </div>
          <div className="card" style={{ flex: 1, margin: "0 10px" }}>
            <h3>درصد موفقیت</h3>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "#28a745" }}>
              {scorePercentage.toFixed(0)}%
            </div>
          </div>
        </div>

        <div style={{ marginTop: "30px" }}>
          <p style={{ color: "#666" }}>
            تاریخ اتمام: {new Date(result.finished_at).toLocaleString("fa-IR")}
          </p>
        </div>

        <div style={{ marginTop: "30px", display: "flex", gap: "10px", justifyContent: "center" }}>
          <Link to="/tests" className="btn-primary">
            بازگشت به آزمون‌ها
          </Link>
          <Link to="/learning" className="btn-secondary">
            مشاهده محتوای آموزشی
          </Link>
        </div>
      </div>

      {scorePercentage < 50 && (
        <div className="card" style={{ marginTop: "20px", backgroundColor: "#fff3cd", border: "1px solid #ffc107" }}>
          <h3>💡 پیشنهاد</h3>
          <p>
            برای بهبود عملکرد، پیشنهاد می‌کنیم محتوای آموزشی مرتبط با این آزمون را مطالعه کنید.
          </p>
        </div>
      )}
    </div>
  );
}

