import React, { useState, useEffect } from "react";
import { assessmentAPI } from "../services/api";

const GradeTest = ({ sessionId, onBack }) => {
  const [session, setSession] = useState(null);
  const [essayGrades, setEssayGrades] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assessmentAPI.getSessionDetails(sessionId)
      .then((res) => {
        setSession({ ...res.data.session, answers: res.data.answers || [] });
        setLoading(false);
      })
      .catch(() => {
        alert("خطا در بارگذاری اطلاعات");
        onBack();
      });
  }, [sessionId, onBack]);

  const handleScoreChange = (ansId, value, maxScore) => {
    const score = parseFloat(value);
    if (!Number.isNaN(maxScore) && score > maxScore) {
      alert(`نمره نمی‌تواند بیشتر از ${maxScore} باشد.`);
      return;
    }
    setEssayGrades({ ...essayGrades, [ansId]: score });
  };

  const handleSubmit = async () => {
    try {
      const grades = Object.entries(essayGrades).map(([id, score]) => ({
        answer_id: Number(id),
        score,
      }));
      await assessmentAPI.submitGrade(sessionId, { grades });
      alert("تصحیح با موفقیت نهایی شد.");
      onBack();
    } catch (err) {
      alert("خطا در ثبت نمرات تشریحی");
    }
  };

  if (loading) return <div style={styles.center}>در حال بارگذاری پاسخ‌ها...</div>;
  if (!session) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>تصحیح آزمون: {session.test_title}</h2>
          <button onClick={onBack} style={styles.backBtn}>بازگشت</button>
        </div>
        <p>دانشجو: <strong>{session.user_full_name}</strong></p>
        <hr />

        {session.answers.map((ans) => (
          <div key={ans.id} style={styles.questionBox}>
            <p><strong>سوال:</strong> {ans.question_text}</p>
            <p><strong>پاسخ دانشجو:</strong> <span style={styles.userAnswer}>{ans.text_answer || "بدون پاسخ"}</span></p>

            {ans.question_type === "text" ? (
              <div style={styles.gradingArea}>
                <label>نمره استاد (از {ans.question_points || "-"}): </label>
                <input
                  type="number"
                  step="0.5"
                  style={styles.scoreInput}
                  onChange={(e) => handleScoreChange(ans.id, e.target.value, ans.question_points)}
                />
              </div>
            ) : (
              <div style={styles.autoScore}>
                <span>نمره تستی:</span> <strong>{ans.score_earned}</strong>
              </div>
            )}
          </div>
        ))}

        <button onClick={handleSubmit} style={styles.submitBtn}>
          ثبت نهایی و بستن پرونده آزمون
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { direction: "rtl", padding: "20px", fontFamily: "Tahoma" },
  card: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  backBtn: { background: "#95a5a6", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" },
  questionBox: { borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "15px" },
  userAnswer: { display: "block", background: "#f9f9f9", padding: "10px", borderRadius: "5px", marginTop: "5px", color: "#2c3e50" },
  gradingArea: { marginTop: "10px", color: "#d35400", fontWeight: "bold" },
  scoreInput: { width: "80px", padding: "5px", marginRight: "10px", border: "1px solid #d35400", borderRadius: "4px" },
  autoScore: { marginTop: "10px", fontSize: "0.9rem" },
  submitBtn: { width: "100%", padding: "15px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1.1rem", fontWeight: "bold" },
  center: { textAlign: "center", marginTop: "50px" },
};

export default GradeTest;
