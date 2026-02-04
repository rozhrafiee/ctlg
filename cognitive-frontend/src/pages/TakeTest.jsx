import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assessmentAPI } from "../services/api";

const TakeTest = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ load session (GET /assessment/teacher/sessions/:id/)
  useEffect(() => {
    if (!sessionId) return;

    assessmentAPI
      .getSessionDetails(sessionId)
      .then((res) => {
        const s = res.data.session;
        setSession({
          id: s.id,
          test_title: s.test.title,
          questions: s.test.questions,
        });

        if (s.expires_at) {
          const seconds =
            (new Date(s.expires_at) - new Date()) / 1000;
          setTimeLeft(Math.max(0, Math.floor(seconds)));
        }
      })
      .catch(() => navigate("/student/dashboard"));
  }, [sessionId, navigate]);

  const handleFinish = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await assessmentAPI.finishTest(sessionId);
      alert("آزمون با موفقیت ثبت شد ✅");
      navigate(`/test-results/${sessionId}`);
    } catch {
      alert("خطا در اتمام آزمون");
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, navigate, isSubmitting]);

  // ⏱ timer
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleFinish]);

  // ✅ submit answer (POST sessions/:id/questions/:qid/answer/)
  const handleAnswerChange = async (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
    try {
      await assessmentAPI.submitAnswer(sessionId, questionId, {
        selected_choice: typeof value === "number" ? value : null,
        text_answer: typeof value === "string" ? value : null,
        time_spent_seconds: 0,
      });
    } catch {
      console.error("خطا در ذخیره پاسخ");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!session)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        در حال بارگذاری...
      </div>
    );

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.timerBox,
          color: timeLeft < 60 ? "red" : "#333",
        }}
      >
        زمان باقی‌مانده: {formatTime(timeLeft)}
      </div>

      <h2 style={{ textAlign: "center" }}>{session.test_title}</h2>

      {session.questions?.map((q, idx) => (
        <div key={q.id} style={styles.qCard}>
          <p>
            <strong>
              {idx + 1}. {q.text}
            </strong>
          </p>

          {q.question_type === "mcq" ? (
            <div style={styles.choices}>
              {q.choices.map((c) => (
                <label key={c.id} style={styles.choiceLabel}>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === c.id}
                    onChange={() =>
                      handleAnswerChange(q.id, c.id)
                    }
                  />{" "}
                  {c.text}
                </label>
              ))}
            </div>
          ) : (
            <textarea
              style={styles.textarea}
              onChange={(e) =>
                handleAnswerChange(q.id, e.target.value)
              }
              placeholder="پاسخ خود را بنویسید..."
            />
          )}
        </div>
      ))}

      <button
        style={styles.submitBtn}
        onClick={handleFinish}
        disabled={isSubmitting}
      >
        {isSubmitting ? "در حال ثبت..." : "اتمام آزمون"}
      </button>
    </div>
  );
};

const styles = {
  container: { direction: "rtl", padding: 20, maxWidth: 800, margin: "0 auto" },
  timerBox: {
    position: "sticky",
    top: 10,
    background: "#fff",
    padding: 15,
    borderRadius: 8,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  qCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    border: "1px solid #eee",
  },
  choices: { display: "flex", flexDirection: "column", gap: 10 },
  choiceLabel: {
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: 6,
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  submitBtn: {
    width: "100%",
    padding: 15,
    background: "#27ae60",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default TakeTest;
