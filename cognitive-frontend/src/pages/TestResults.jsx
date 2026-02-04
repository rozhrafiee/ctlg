import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assessmentAPI } from "../services/api";

const TestResults = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    assessmentAPI
      .getTestResult(sessionId) // ✅ GET /assessment/results/:id/
      .then((res) => {
        const data = res.data;

        // ✅ map backend → UI (بدون حذف چیزی)
        setResult({
          test_title: data.test?.title,
          score: Math.round(data.total_score),
          level_name: data.level_name,
          answers: (data.answers || []).map((a) => ({
            question_text: a.question_text,
            user_answer:
              a.selected_choice_text || a.text_answer || "",
            correct_answer: a.correct_choice_text,
            is_correct: a.is_correct,
            q_type: a.question_type, // mcq | text
          })),
        });
      })
      .catch((err) => {
        console.error("خطا در دریافت نتایج:", err);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading)
    return (
      <div style={styles.center}>
        در حال تحلیل پاسخ‌ها و محاسبه نمره...
      </div>
    );

  if (!result)
    return (
      <div style={styles.center}>
        <p>نتیجه‌ای یافت نشد.</p>
        <button
          onClick={() => navigate("/student/dashboard")}
          style={styles.btn}
        >
          بازگشت به داشبورد
        </button>
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.summaryCard}>
        <h2 style={{ color: "#2c3e50" }}>{result.test_title}</h2>

        <div style={styles.scoreCircle}>
          <span style={styles.scoreText}>{result.score}</span>
          <small>از ۱۰۰</small>
        </div>

        <p>
          سطح تعیین شده:{" "}
          <strong style={{ color: "#27ae60" }}>
            {result.level_name || "در حال محاسبه"}
          </strong>
        </p>
      </div>

      <h3 style={{ marginBottom: "20px" }}>مرور پاسخ‌ها:</h3>

      {result.answers?.map((ans, idx) => (
        <div
          key={idx}
          style={{
            ...styles.qCard,
            borderRight: `8px solid ${
              ans.is_correct
                ? "#2ecc71"
                : ans.q_type === "text"
                ? "#f1c40f"
                : "#e74c3c"
            }`,
          }}
        >
          <p>
            <strong>سوال {idx + 1}:</strong> {ans.question_text}
          </p>

          <div style={styles.answerDetails}>
            <p>
              پاسخ شما:{" "}
              <span
                style={{
                  color: ans.is_correct ? "#27ae60" : "#c0392b",
                }}
              >
                {ans.user_answer || "بدون پاسخ"}
              </span>
            </p>

            {!ans.is_correct && ans.q_type === "mcq" && (
              <p style={{ color: "#27ae60", marginTop: 5 }}>
                ✅ پاسخ صحیح: {ans.correct_answer}
              </p>
            )}

            {ans.q_type === "text" && (
              <p
                style={{
                  color: "#7f8c8d",
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                }}
              >
                * این سوال تشریحی است و پس از تصحیح استاد نهایی می‌شود.
              </p>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={() => navigate("/student/dashboard")}
        style={styles.submitBtn}
      >
        بازگشت به پنل کاربری
      </button>
    </div>
  );
};

const styles = {
  container: {
    direction: "rtl",
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "Tahoma",
  },
  center: { textAlign: "center", marginTop: "100px" },
  summaryCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "20px",
    textAlign: "center",
    marginBottom: "30px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  scoreCircle: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    border: "5px solid #3498db",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    margin: "20px auto",
  },
  scoreText: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#3498db",
  },
  qCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "15px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  answerDetails: { marginTop: "10px", paddingRight: "15px" },
  submitBtn: {
    width: "100%",
    padding: "15px",
    background: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "20px",
  },
  btn: {
    padding: "10px 20px",
    background: "#95a5a6",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default TestResults;
