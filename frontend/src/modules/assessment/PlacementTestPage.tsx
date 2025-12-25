import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { useAuthStore } from "../../store/authStore";

interface Choice {
  id: number;
  text: string;
}

interface Question {
  id: number;
  text: string;
  question_type: string;
  choices: Choice[];
}

interface TestDetail {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export default function PlacementTestPage() {
  const navigate = useNavigate();
  const { user, fetchMe } = useAuthStore();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role !== "student") {
      navigate("/");
      return;
    }
    loadTest();
  }, [user, navigate]);

  const loadTest = async () => {
    try {
      const res = await api.get("/api/assessment/tests/placement/");
      setTest(res.data);
      // شروع session
      const sessionRes = await api.post(`/api/assessment/tests/${res.data.id}/start/`);
      setSessionId(sessionRes.data.id);
    } catch (err: any) {
      console.error("خطا در بارگذاری آزمون تعیین سطح:", err);
      if (err.response?.status === 404) {
        alert("آزمون تعیین سطح یافت نشد. لطفاً با مدیر سیستم تماس بگیرید.");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceChange = (qId: number, choiceId: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: choiceId }));
  };

  const handleSubmit = async () => {
    if (!sessionId || !test) return;
    
    // بررسی اینکه همه سوالات پاسخ داده شده‌اند
    const unansweredQuestions = test.questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      if (!confirm(`${unansweredQuestions.length} سوال بدون پاسخ باقی مانده است. آیا می‌خواهید ادامه دهید؟`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        answers: test.questions.map((q) => ({
          question: q.id,
          selected_choice: answers[q.id] ?? null,
          text_answer: "",
        })),
      };
      await api.post(`/api/assessment/sessions/${sessionId}/submit/`, payload);
      // به‌روزرسانی اطلاعات کاربر
      await fetchMe();
      // هدایت به صفحه نتیجه
      navigate(`/tests/result/${sessionId}`);
    } catch (err) {
      console.error("خطا در ارسال آزمون:", err);
      alert("خطا در ارسال آزمون. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>در حال بارگذاری آزمون تعیین سطح...</div>;
  if (!test) return <div>آزمون تعیین سطح یافت نشد.</div>;

  return (
    <div className="placement-test-container">
      <div className="card placement-test-header">
        <h2 className="placement-test-title">
          📋 آزمون تعیین سطح سواد شناختی
        </h2>
        <p className="placement-test-description">
          {test.description || "این آزمون برای تعیین سطح اولیه سواد شناختی شما طراحی شده است. لطفاً به تمام سوالات با دقت پاسخ دهید."}
        </p>
        <p className="placement-test-time">
          ⏱️ زمان تقریبی: {test.questions.length * 2} دقیقه
        </p>
      </div>

      {test.questions.map((q, index) => (
        <div key={q.id} className="card question-card">
          <div className="question-header">
            <span className="question-number">{index + 1}</span>
            <p className="question-text">{q.text}</p>
          </div>
          {q.choices.map((c) => (
            <label
              key={c.id}
              className={`choice ${answers[q.id] === c.id ? "choice-selected" : ""}`}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={answers[q.id] === c.id}
                onChange={() => handleChoiceChange(q.id, c.id)}
              />
              {c.text}
            </label>
          ))}
        </div>
      ))}

      <div className="placement-test-footer">
        <div className="questions-remaining">
          {test.questions.length - Object.keys(answers).length} سوال باقی مانده
        </div>
        <button
          onClick={handleSubmit}
          className="btn-primary btn-submit-test"
          disabled={submitting}
        >
          {submitting ? "در حال ارسال..." : "✓ ثبت و پایان آزمون"}
        </button>
      </div>
    </div>
  );
}

