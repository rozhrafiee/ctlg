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

interface PlacementTestResponse {
  test: TestDetail;
  message: string;
}

interface StartSessionResponse {
  session_id: number;
  test_title: string;
  started_at: string;
  is_placement_test: boolean;
  message: string;
}

interface AnswerPayload {
  question: number;
  selected_choice: number | null;
  text_answer: string;
}

interface SubmitSessionRequest {
  answers: AnswerPayload[];
}

export default function PlacementTestPage() {
  const navigate = useNavigate();
  const { user, fetchMe } = useAuthStore();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // بررسی نقش کاربر
    if (user && user.role !== "student") {
      navigate("/");
      return;
    }
    
    // بارگذاری آزمون
    loadTest();
  }, [user, navigate]);

  const loadTest = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setTest(null);
      setSessionId(null);
      setAnswers({});
      
      console.log("📡 دریافت اطلاعات آزمون تعیین سطح...");
      
      // 1. دریافت اطلاعات آزمون تعیین سطح
      const testRes = await api.get<PlacementTestResponse>("/api/assessment/tests/placement/");
      console.log("✅ پاسخ دریافت آزمون:", testRes.data);
      
      // بررسی ساختار پاسخ
      if (!testRes.data?.test) {
        throw new Error("ساختار پاسخ آزمون نامعتبر است");
      }
      
      const testData = testRes.data.test;
      
      if (!testData.id) {
        throw new Error("شناسه آزمون نامعتبر است");
      }
      
      console.log("🆔 شناسه آزمون:", testData.id);
      console.log("📝 تعداد سوالات:", testData.questions?.length || 0);
      setTest(testData);
      
      // 2. شروع جلسه آزمون
      console.log("🚀 شروع جلسه آزمون...");
      const endpoint = `/api/assessment/tests/${testData.id}/start/`;
      console.log("🔗 Endpoint:", endpoint);
      
      const sessionRes = await api.post<StartSessionResponse>(endpoint);
      
      console.log("✅ پاسخ شروع جلسه:", sessionRes.data);
      
      if (!sessionRes.data?.session_id) {
        throw new Error("شناسه جلسه در پاسخ وجود ندارد");
      }
      
      const newSessionId = sessionRes.data.session_id;
      setSessionId(newSessionId);
      console.log("🎉 جلسه با موفقیت شروع شد. شناسه جلسه:", newSessionId);
      
    } catch (err: any) {
      console.error("❌ خطا در بارگذاری آزمون تعیین سطح:", err);
      
      let errorMessage = "خطا در بارگذاری آزمون تعیین سطح";
      
      if (err.response) {
        console.error("📊 وضعیت خطا:", err.response.status);
        console.error("📦 داده‌های خطا:", err.response.data);
        
        if (err.response.status === 404) {
          errorMessage = "آزمون تعیین سطح یافت نشد. لطفاً با مدیر سیستم تماس بگیرید.";
        } else if (err.response.status === 400) {
          errorMessage = err.response.data.detail || "شما قبلاً آزمون تعیین سطح داده‌اید.";
        } else if (err.response.status === 403) {
          errorMessage = "شما مجوز دسترسی به این آزمون را ندارید.";
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceChange = (qId: number, choiceId: number): void => {
    setAnswers((prev) => ({ ...prev, [qId]: choiceId }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!sessionId || !test) {
      alert("جلسه آزمون نامعتبر است");
      return;
    }
    
    // بررسی اینکه همه سوالات پاسخ داده شده‌اند
    const unansweredQuestions = test.questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      const confirmSubmit = window.confirm(
        `${unansweredQuestions.length} سوال بدون پاسخ باقی مانده است. آیا می‌خواهید ادامه دهید؟`
      );
      if (!confirmSubmit) {
        return;
      }
    }

    setSubmitting(true);
    
    try {
      // ساخت payload برای ارسال پاسخ‌ها
      const payload: SubmitSessionRequest = {
        answers: test.questions.map((q): AnswerPayload => ({
          question: q.id,
          selected_choice: answers[q.id] ?? null,
          text_answer: "",
        })),
      };
      
      console.log("📤 ارسال پاسخ‌ها...", payload);
      
      // ارسال پاسخ‌ها
      await api.post(`/api/assessment/sessions/${sessionId}/submit/`, payload);
      
      // به‌روزرسانی اطلاعات کاربر
      await fetchMe();
      
      // هدایت به صفحه نتیجه
      navigate(`/tests/result/${sessionId}`);
      
    } catch (err: any) {
      console.error("❌ خطا در ارسال آزمون:", err);
      
      let errorMessage = "خطا در ارسال آزمون";
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      alert(`${errorMessage}. لطفاً دوباره تلاش کنید.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = (): void => {
    setError(null);
    loadTest();
  };

  const handleCancel = (): void => {
    if (window.confirm("آیا مطمئن هستید که می‌خواهید آزمون را لغو کنید؟ پیشرفت شما ذخیره نخواهد شد.")) {
      navigate("/dashboard");
    }
  };

  // صفحه loading
  if (loading) {
    return (
      <div className="placement-test-container">
        <div className="card loading-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <h2>⏳ در حال بارگذاری آزمون تعیین سطح...</h2>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '30px auto'
          }}></div>
          <p>لطفاً چند لحظه صبر کنید</p>
        </div>
      </div>
    );
  }

  // صفحه خطا
  if (error) {
    return (
      <div className="placement-test-container">
        <div className="card error-card" style={{ textAlign: 'center', padding: '50px 40px', border: '2px solid #e53e3e', background: '#fff5f5' }}>
          <h2 style={{ color: '#c53030' }}>⚠️ خطا در بارگذاری آزمون</h2>
          <p className="error-message" style={{ color: '#742a2a', margin: '25px 0', padding: '15px', background: '#fed7d7', borderRadius: '8px' }}>
            {error}
          </p>
          <div className="error-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <button onClick={handleRetry} className="btn btn-primary">
              🔄 تلاش مجدد
            </button>
            <button onClick={() => navigate("/dashboard")} className="btn btn-secondary">
              ↩️ بازگشت به داشبورد
            </button>
          </div>
        </div>
      </div>
    );
  }

  // بررسی اینکه آیا test و sessionId وجود دارند
  if (!test || !sessionId) {
    return (
      <div className="placement-test-container">
        <div className="card error-card" style={{ textAlign: 'center', padding: '50px 40px' }}>
          <h2>⚠️ اطلاعات آزمون نامعتبر است</h2>
          <p className="error-message">لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.</p>
          <div className="error-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <button onClick={handleRetry} className="btn btn-primary">
              🔄 تلاش مجدد
            </button>
            <button onClick={() => navigate("/dashboard")} className="btn btn-secondary">
              ↩️ بازگشت به داشبورد
            </button>
          </div>
        </div>
      </div>
    );
  }

  // صفحه اصلی آزمون
  return (
    <div className="placement-test-container">
      <div className="card placement-test-header">
        <h2 className="placement-test-title">
          📋 آزمون تعیین سطح سواد شناختی
        </h2>
        <p className="placement-test-description">
          {test.description || "این آزمون برای تعیین سطح اولیه سواد شناختی شما طراحی شده است. لطفاً به تمام سوالات با دقت پاسخ دهید."}
        </p>
        <div className="test-info" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <div className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: '20px' }}>
            <span className="info-label">⏱️ زمان تقریبی:</span>
            <span className="info-value">{test.questions.length * 2} دقیقه</span>
          </div>
          <div className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: '20px' }}>
            <span className="info-label">🔢 تعداد سوالات:</span>
            <span className="info-value">{test.questions.length}</span>
          </div>
          <div className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: '20px' }}>
            <span className="info-label">🆔 شناسه جلسه:</span>
            <span className="info-value session-id" style={{ background: 'white', color: '#3182ce', padding: '2px 10px', borderRadius: '10px', fontFamily: 'monospace' }}>
              {sessionId}
            </span>
          </div>
        </div>
      </div>

      <div className="questions-container">
        {test.questions.map((q, index) => (
          <div key={q.id} className="card question-card">
            <div className="question-header">
              <span className="question-number">{index + 1}</span>
              <div className="question-content">
                <p className="question-text">{q.text}</p>
                {q.question_type === "mcq" && q.choices.length === 0 && (
                  <p className="warning-text" style={{ color: '#d69e2e', fontSize: '0.9rem', marginTop: '8px', padding: '8px 12px', background: '#fefcbf', borderRadius: '6px', display: 'inline-block' }}>
                    ⚠️ این سوال گزینه‌ای ندارد!
                  </p>
                )}
              </div>
            </div>
            
            {q.question_type === "mcq" && q.choices.length > 0 && (
              <div className="choices-container">
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
                      disabled={submitting}
                      className="choice-input"
                    />
                    <span className="choice-text">{c.text}</span>
                    {answers[q.id] === c.id && (
                      <span className="selected-indicator" style={{ color: '#4299e1', fontWeight: 'bold', fontSize: '1.2rem', marginLeft: '10px' }}>
                        ✓
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
            
            {q.question_type !== "mcq" && (
              <div className="text-answer-container" style={{ marginTop: '20px' }}>
                <textarea
                  className="text-answer-input"
                  placeholder="پاسخ خود را بنویسید..."
                  disabled
                  rows={3}
                  style={{ width: '100%', padding: '15px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                />
                <p className="info-text" style={{ color: '#718096', fontSize: '0.9rem', marginTop: '10px', fontStyle: 'italic' }}>
                  این نوع سوال در نسخه فعلی پشتیبانی نمی‌شود.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="placement-test-footer">
        <div className="questions-stats" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', flexWrap: 'wrap', gap: '20px' }}>
          <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1, minWidth: '150px' }}>
            <span className="stat-label" style={{ color: '#718096', fontWeight: 600 }}>پاسخ داده شده:</span>
            <span className="stat-value answered" style={{ color: '#38a169', fontWeight: 700, fontSize: '1.2rem' }}>
              {Object.keys(answers).length}
            </span>
          </div>
          <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1, minWidth: '150px' }}>
            <span className="stat-label" style={{ color: '#718096', fontWeight: 600 }}>کل سوالات:</span>
            <span className="stat-value total" style={{ color: '#4299e1', fontWeight: 700, fontSize: '1.2rem' }}>
              {test.questions.length}
            </span>
          </div>
          <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1, minWidth: '150px' }}>
            <span className="stat-label" style={{ color: '#718096', fontWeight: 600 }}>باقی مانده:</span>
            <span className="stat-value remaining" style={{ color: '#e53e3e', fontWeight: 700, fontSize: '1.2rem' }}>
              {test.questions.length - Object.keys(answers).length}
            </span>
          </div>
        </div>
        
        <div className="progress-bar-container" style={{ margin: '30px 0', position: 'relative', height: '20px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <div 
            className="progress-bar" 
            style={{ 
              width: `${(Object.keys(answers).length / test.questions.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4299e1, #38b2ac)',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }}
          ></div>
          <div className="progress-text" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            {Math.round((Object.keys(answers).length / test.questions.length) * 100)}% تکمیل
          </div>
        </div>
        
        <div className="submit-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #e2e8f0' }}>
          <button
            onClick={handleCancel}
            className="btn btn-secondary"
            disabled={submitting}
          >
            ❌ انصراف
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary btn-submit-test"
            disabled={submitting || Object.keys(answers).length === 0}
            title={Object.keys(answers).length === 0 ? "حداقل به یک سوال پاسخ دهید" : ""}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            {submitting ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                در حال ارسال...
              </>
            ) : (
              "✅ ثبت و پایان آزمون"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
