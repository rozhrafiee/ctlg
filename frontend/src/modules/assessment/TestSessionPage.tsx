import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../utils/api";
import { useAuthStore } from "../../store/authStore";

interface Choice {
  id: number;
  text: string;
  is_correct: boolean;
  order: number;
}

interface Question {
  id: number;
  text: string;
  question_type: string;
  choices: Choice[];
  order: number;
  points: number;
}

interface TestDetail {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  total_questions: number;
  passing_score: number;
  time_limit_minutes: number;
  related_content_info?: {
    id: number;
    title: string;
    content_type: string;
  };
}

interface SessionInfo {
  session_id: number;
  test_title: string;
  started_at: string;
  expires_at: string | null;
  time_limit_minutes: number;
  total_questions: number;
  passing_score: number;
}

export default function TestSessionPage() {
  const { id } = useParams<{ id: string }>();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!id) return;
    loadTest();
  }, [id]);

  useEffect(() => {
    if (sessionInfo?.expires_at) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expires = new Date(sessionInfo.expires_at!).getTime();
        const remaining = Math.max(0, Math.floor((expires - now) / 1000));
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
          handleAutoSubmit();
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [sessionInfo?.expires_at]);

  const loadTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. دریافت اطلاعات آزمون
      const testRes = await api.get(`/api/assessment/tests/${id}/`);
      setTest(testRes.data);
      
      // 2. شروع جلسه
      try {
        const sessionRes = await api.post(`/api/assessment/tests/${id}/start/`);
        setSessionInfo(sessionRes.data);
        
        // اگر زمان محدودیت دارد، محاسبه زمان باقی‌مانده
        if (sessionRes.data.expires_at) {
          const now = new Date().getTime();
          const expires = new Date(sessionRes.data.expires_at).getTime();
          const remaining = Math.max(0, Math.floor((expires - now) / 1000));
          setTimeLeft(remaining);
        }
      } catch (sessionErr: any) {
        if (sessionErr.response?.data?.detail) {
          if (sessionErr.response.data.detail.includes("فعال")) {
            setError("این آزمون غیرفعال است.");
          } else if (sessionErr.response.data.detail.includes("تعیین سطح")) {
            setError("شما قبلاً آزمون تعیین سطح داده‌اید.");
          } else {
            setError(sessionErr.response.data.detail);
          }
        } else {
          setError("خطا در شروع آزمون");
        }
      }
    } catch (err: any) {
      console.error("خطا در بارگذاری آزمون:", err);
      setError("آزمون یافت نشد یا دسترسی ندارید.");
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceChange = (qId: number, choiceId: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: choiceId }));
  };

  const handleTextAnswerChange = (qId: number, text: string) => {
    setTextAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  const handleQuestionNavigation = (index: number) => {
    if (index >= 0 && index < (test?.questions.length || 0)) {
      setCurrentQuestion(index);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAutoSubmit = async () => {
    if (!sessionInfo?.session_id || !test) return;
    
    setSubmitting(true);
    try {
      const payload = {
        answers: test.questions.map((q) => ({
          question: q.id,
          selected_choice: answers[q.id] ?? null,
          text_answer: textAnswers[q.id] || "",
          time_spent_seconds: 0 // در حالت واقعی باید محاسبه شود
        }))
      };
      
      await api.post(`/api/assessment/sessions/${sessionInfo.session_id}/submit/`, payload);
      navigate(`/tests/result/${sessionInfo.session_id}`);
    } catch (err) {
      console.error("خطا در ارسال خودکار آزمون:", err);
      alert("خطا در ارسال آزمون. لطفاً با پشتیبانی تماس بگیرید.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!sessionInfo?.session_id || !test) return;
    
    // بررسی اینکه آیا همه سوالات پاسخ داده شده‌اند
    const unansweredQuestions = test.questions.filter(q => 
      !answers[q.id] && !textAnswers[q.id]
    );
    
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
      const payload = {
        answers: test.questions.map((q) => ({
          question: q.id,
          selected_choice: answers[q.id] ?? null,
          text_answer: textAnswers[q.id] || "",
          time_spent_seconds: 0 // در حالت واقعی باید محاسبه شود
        }))
      };
      
      await api.post(`/api/assessment/sessions/${sessionInfo.session_id}/submit/`, payload);
      navigate(`/tests/result/${sessionInfo.session_id}`);
    } catch (err: any) {
      console.error("خطا در ارسال آزمون:", err);
      alert(err.response?.data?.detail || "خطا در ارسال آزمون");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div className="spinner"></div>
        <p>در حال بارگذاری آزمون...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px", color: "#dc3545" }}>⚠️</div>
        <h3 style={{ color: "#721c24", marginBottom: "15px" }}>خطا</h3>
        <p style={{ color: "#666", marginBottom: "25px" }}>{error}</p>
        <button
          onClick={() => navigate("/tests")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0d6efd",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          بازگشت به لیست آزمون‌ها
        </button>
      </div>
    );
  }

  if (!test || !sessionInfo) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>آزمون یافت نشد.</p>
      </div>
    );
  }

  const currentQ = test.questions[currentQuestion];
  const totalQuestions = test.questions.length;
  const answeredCount = Object.keys(answers).length + Object.keys(textAnswers).length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* هدر آزمون */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "10px",
        padding: "25px",
        marginBottom: "25px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        border: "1px solid #dee2e6"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: "0 0 10px 0", color: "#333" }}>{test.title}</h2>
            <p style={{ color: "#666", marginBottom: "15px" }}>{test.description}</p>
            
            {test.related_content_info && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#e7f3ff",
                padding: "8px 15px",
                borderRadius: "6px",
                marginBottom: "15px"
              }}>
                <span style={{ color: "#084298" }}>📚</span>
                <span style={{ color: "#084298", fontSize: "14px" }}>
                  مرتبط با: {test.related_content_info.title}
                </span>
              </div>
            )}
          </div>
          
          {/* تایمر */}
          {timeLeft !== null && (
            <div style={{
              backgroundColor: timeLeft < 300 ? "#f8d7da" : "#d4edda",
              color: timeLeft < 300 ? "#721c24" : "#155724",
              padding: "12px 20px",
              borderRadius: "8px",
              textAlign: "center",
              minWidth: "120px"
            }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>
                ⏱️ زمان باقی‌مانده
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "monospace" }}>
                {formatTime(timeLeft)}
              </div>
            </div>
          )}
        </div>

        {/* آمار آزمون */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "5px" }}>سوال فعلی</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#0d6efd" }}>
              {currentQuestion + 1} / {totalQuestions}
            </div>
          </div>
          
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "5px" }}>پاسخ داده شده</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
              {answeredCount}
            </div>
          </div>
          
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "5px" }}>حداقل نمره</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ffc107" }}>
              {test.passing_score}%
            </div>
          </div>
          
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "5px" }}>زمان کل</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#17a2b8" }}>
              {test.time_limit_minutes} دقیقه
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "25px" }}>
        {/* سایدبار سوالات */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "20px",
          width: "300px",
          flexShrink: 0,
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          border: "1px solid #dee2e6"
        }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "18px" }}>
            📋 لیست سوالات
          </h3>
          
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ fontSize: "14px", color: "#666" }}>پیشرفت:</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e9ecef",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${progressPercentage}%`,
                height: "100%",
                backgroundColor: progressPercentage === 100 ? "#28a745" : "#0d6efd",
                transition: "width 0.3s"
              }} />
            </div>
          </div>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "10px",
            marginBottom: "25px"
          }}>
            {test.questions.map((q, index) => {
              const isAnswered = answers[q.id] !== undefined || textAnswers[q.id] !== undefined;
              const isCurrent = index === currentQuestion;
              
              return (
                <button
                  key={q.id}
                  onClick={() => handleQuestionNavigation(index)}
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: isCurrent ? "#0d6efd" : 
                                  isAnswered ? "#28a745" : "#f8f9fa",
                    color: isCurrent ? "white" : 
                          isAnswered ? "white" : "#495057",
                    border: `2px solid ${isCurrent ? "#0d6efd" : 
                             isAnswered ? "#28a745" : "#dee2e6"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "20px", height: "20px", backgroundColor: "#0d6efd", borderRadius: "4px" }}></div>
              <span style={{ fontSize: "14px", color: "#666" }}>سوال فعلی</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "20px", height: "20px", backgroundColor: "#28a745", borderRadius: "4px" }}></div>
              <span style={{ fontSize: "14px", color: "#666" }}>پاسخ داده شده</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "20px", height: "20px", backgroundColor: "#f8f9fa", border: "2px solid #dee2e6", borderRadius: "4px" }}></div>
              <span style={{ fontSize: "14px", color: "#666" }}>بدون پاسخ</span>
            </div>
          </div>
        </div>

        {/* بخش سوال فعلی */}
        <div style={{ flex: 1 }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "30px",
            marginBottom: "25px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            border: "1px solid #dee2e6"
          }}>
            {/* هدر سوال */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "25px" }}>
              <div>
                <div style={{ fontSize: "14px", color: "#6c757d", marginBottom: "5px" }}>
                  سوال شماره {currentQuestion + 1} از {totalQuestions}
                </div>
                <h3 style={{ margin: "0 0 15px 0", color: "#333", fontSize: "20px", lineHeight: "1.5" }}>
                  {currentQ.text}
                </h3>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: currentQ.question_type === "text" ? "#d4edda" : "#e7f3ff",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "bold"
                }}>
                  <span>{currentQ.question_type === "text" ? "📝 پاسخ متنی" : "🔘 چندگزینه‌ای"}</span>
                  <span style={{ 
                    backgroundColor: "white", 
                    color: currentQ.question_type === "text" ? "#155724" : "#084298",
                    padding: "2px 8px", 
                    borderRadius: "10px",
                    fontSize: "12px"
                  }}>
                    {currentQ.points} امتیاز
                  </span>
                </div>
              </div>
              
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "5px" }}>امتیاز</div>
                <div style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#0d6efd",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: "bold",
                  margin: "0 auto"
                }}>
                  {currentQ.points}
                </div>
              </div>
            </div>

            {/* گزینه‌ها */}
            {currentQ.question_type === "mcq" && currentQ.choices.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {currentQ.choices.map((choice, index) => (
                  <label
                    key={choice.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "20px",
                      backgroundColor: answers[currentQ.id] === choice.id ? "#e7f3ff" : "#f8f9fa",
                      border: `2px solid ${answers[currentQ.id] === choice.id ? "#0d6efd" : "#dee2e6"}`,
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <input
                      type="radio"
                      name={`q-${currentQ.id}`}
                      checked={answers[currentQ.id] === choice.id}
                      onChange={() => handleChoiceChange(currentQ.id, choice.id)}
                      style={{ 
                        width: "20px", 
                        height: "20px", 
                        marginLeft: "15px",
                        cursor: "pointer"
                      }}
                    />
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: answers[currentQ.id] === choice.id ? "#0d6efd" : "#6c757d",
                        color: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold"
                      }}>
                        {String.fromCharCode(65 + index)} {/* A, B, C, ... */}
                      </div>
                      <span style={{ 
                        fontSize: "16px", 
                        color: answers[currentQ.id] === choice.id ? "#084298" : "#495057",
                        fontWeight: answers[currentQ.id] === choice.id ? "600" : "normal"
                      }}>
                        {choice.text}
                      </span>
                    </div>
                    {answers[currentQ.id] === choice.id && (
                      <div style={{
                        backgroundColor: "#0d6efd",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        ✓ انتخاب شده
                      </div>
                    )}
                  </label>
                ))}
              </div>
            ) : currentQ.question_type === "text" ? (
              <div>
                <textarea
                  value={textAnswers[currentQ.id] || ""}
                  onChange={(e) => handleTextAnswerChange(currentQ.id, e.target.value)}
                  placeholder="پاسخ خود را در اینجا بنویسید..."
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "20px",
                    border: "2px solid #dee2e6",
                    borderRadius: "10px",
                    fontSize: "16px",
                    resize: "vertical",
                    lineHeight: "1.6",
                    backgroundColor: "#f8f9fa"
                  }}
                />
                <div style={{ marginTop: "15px", fontSize: "14px", color: "#6c757d" }}>
                  💡 پاسخ شما توسط استاد تصحیح خواهد شد.
                </div>
              </div>
            ) : (
              <div style={{
                padding: "30px",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeaa7",
                borderRadius: "10px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "24px", marginBottom: "10px" }}>⚠️</div>
                <p style={{ color: "#856404", marginBottom: "10px" }}>
                  این سوال گزینه‌ای ندارد. لطفاً با پشتیبانی تماس بگیرید.
                </p>
              </div>
            )}
          </div>

          {/* ناوبری و ارسال */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            border: "1px solid #dee2e6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={() => handleQuestionNavigation(currentQuestion - 1)}
                disabled={currentQuestion === 0}
                style={{
                  padding: "12px 24px",
                  backgroundColor: currentQuestion === 0 ? "#6c757d" : "#0d6efd",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: currentQuestion === 0 ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                ← سوال قبلی
              </button>
              
              <button
                onClick={() => handleQuestionNavigation(currentQuestion + 1)}
                disabled={currentQuestion === totalQuestions - 1}
                style={{
                  padding: "12px 24px",
                  backgroundColor: currentQuestion === totalQuestions - 1 ? "#6c757d" : "#0d6efd",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: currentQuestion === totalQuestions - 1 ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                سوال بعدی →
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: "15px 30px",
                  backgroundColor: submitting ? "#6c757d" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  minWidth: "200px",
                  justifyContent: "center"
                }}
              >
                {submitting ? (
                  <>
                    <div style={{
                      width: "20px",
                      height: "20px",
                      border: "3px solid rgba(255, 255, 255, 0.3)",
                      borderTop: "3px solid white",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }}></div>
                    در حال ارسال...
                  </>
                ) : (
                  "✅ ثبت و پایان آزمون"
                )}
              </button>
              
              <div style={{ fontSize: "13px", color: "#6c757d", textAlign: "right" }}>
                {answeredCount} از {totalQuestions} سوال پاسخ داده شده است
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* هشدار زمانی */}
      {timeLeft !== null && timeLeft < 300 && timeLeft > 0 && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "15px 25px",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(220, 53, 69, 0.3)",
          zIndex: 1000,
          animation: "pulse 1s infinite",
          border: "2px solid #f5c6cb"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ fontSize: "24px" }}>⚠️</div>
            <div>
              <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                زمان آزمون در حال اتمام است!
              </div>
              <div>{formatTime(timeLeft)} باقی مانده</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}