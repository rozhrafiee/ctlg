import { useEffect, useState } from "react";
import { assessmentAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Exams.css";

export default function Exams() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth(); 
  // فرض: user.has_taken_placement از بک میاد

  useEffect(() => {
    // ✅ اگر دانشجو تعیین سطح نداده → مستقیم بفرست placement
    if (user?.role === "student" && user?.has_taken_placement === false) {
      navigate("/placement-test");
      return;
    }

    fetchTests();
  }, [user]);

  const fetchTests = async () => {
    try {
      const res = await assessmentAPI.getAvailableTests();

      // ✅ حذف آزمون تعیین سطح از لیست
      const filteredTests = (res.data || []).filter(
        (test) => test.test_type !== "placement"
      );

      setTests(filteredTests);
    } catch (err) {
      console.error("Failed to load exams:", err);
      alert("خطا در دریافت لیست آزمون‌ها");
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (testId) => {
    try {
      const res = await assessmentAPI.startTest(testId);

      // ✅ هماهنگ با بک
      const sessionId = res.data.session_id || res.data.id;

      navigate(`/test-session/${sessionId}`);
    } catch (err) {
      console.error("Failed to start test:", err);
      alert(err.response?.data?.detail || "امکان شروع آزمون وجود ندارد");
    }
  };

  if (loading) {
    return <p>در حال بارگذاری آزمون‌ها...</p>;
  }

  if (!tests.length) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        در حال حاضر آزمونی متناسب با سطح شما وجود ندارد.
      </p>
    );
  }

  return (
    <div className="exams-page">
      <h2>آزمون‌های در دسترس</h2>

      <div className="exam-list">
        {tests.map((test) => {
          const canStart = test.is_active === true;

          return (
            <div key={test.id} className="exam-card">
              <h3>{test.title}</h3>

              <p>
                <strong>نوع آزمون:</strong>{" "}
                {test.test_type === "general"
                  ? "عمومی"
                  : test.test_type === "content_based"
                  ? "محتوایی"
                  : "—"}
              </p>

              <p>
                <strong>مدت زمان:</strong>{" "}
                {test.time_limit_minutes} دقیقه
              </p>

              {test.target_level && (
                <p>
                  <strong>مناسب سطح:</strong> {test.target_level}
                </p>
              )}

              {!test.is_active && (
                <p style={{ color: "gray" }}>
                  این آزمون غیرفعال است
                </p>
              )}

              <button
                onClick={() => startTest(test.id)}
                disabled={!canStart}
              >
                شروع آزمون
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
