import React, { useState, useEffect } from "react";
import { assessmentAPI } from "../services/api";

const TeacherReviews = () => {
  const [pendingSessions, setPendingSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      const response = await assessmentAPI.getPendingReviews();
      setPendingSessions(response.data || []);
    } catch (error) {
      console.error("خطا در بارگذاری:", error);
    } finally {
      setLoading(false);
    }
  };

  const openSession = async (sessionId) => {
    setDetailLoading(true);
    try {
      const res = await assessmentAPI.getSessionDetails(sessionId);
      setSelectedSession(res.data.session);
      setAnswers(res.data.answers || []);
      setGrades({});
    } catch (err) {
      console.error("خطا در دریافت جزئیات جلسه:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleGradeChange = (answerId, value) => {
    const score = value === "" ? "" : Number(value);
    setGrades((prev) => ({ ...prev, [answerId]: score }));
  };

  const submitGrades = async () => {
    if (!selectedSession) return;
    const payloadGrades = Object.entries(grades)
      .filter(([, score]) => score !== "" && !Number.isNaN(score))
      .map(([answerId, score]) => ({ answer_id: Number(answerId), score }));

    if (payloadGrades.length === 0) {
      alert("حداقل یک نمره وارد کنید.");
      return;
    }

    try {
      await assessmentAPI.submitGrade(selectedSession.id, { grades: payloadGrades });
      alert("نمره‌ها با موفقیت ثبت شد.");
      setPendingSessions((prev) => prev.filter((s) => s.id !== selectedSession.id));
      setSelectedSession(null);
      setAnswers([]);
      setGrades({});
    } catch (err) {
      alert("خطا در ثبت نمره‌ها");
    }
  };

  if (loading) return <div style={styles.center}>در حال بارگذاری پاسخ‌های دانشجویان...</div>;

  return (
    <div style={styles.container}>
      <h2 style={{ borderBottom: "2px solid #3498db", paddingBottom: "10px" }}>
        📝 میز تصحیح اساتید
      </h2>

      {pendingSessions.length === 0 ? (
        <div style={styles.empty}>هیچ آزمونی در انتظار تصحیح وجود ندارد.</div>
      ) : (
        <div style={styles.sessionGrid}>
          {pendingSessions.map((s) => (
            <div key={s.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <strong>دانشجو: {s.user_full_name}</strong>
                <span style={styles.dateTag}>{s.started_at?.slice(0, 10) || "-"}</span>
              </div>
              <p>آزمون: {s.test_title}</p>
              <button onClick={() => openSession(s.id)} style={styles.submitBtn}>
                مشاهده و تصحیح
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedSession && (
        <div style={styles.detailCard}>
          <h3>جزئیات آزمون: {selectedSession.test_title}</h3>
          {detailLoading ? (
            <div>در حال بارگذاری...</div>
          ) : (
            <>
              {answers.map((ans) => (
                <div key={ans.id} style={styles.answerRow}>
                  <p><strong>سوال:</strong> {ans.question_text}</p>
                  <p><strong>پاسخ:</strong> {ans.text_answer || "بدون پاسخ"}</p>
                  {ans.question_type === "text" ? (
                    <div style={styles.gradeRow}>
                      <label>نمره (از {ans.question_points || "-"})</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        style={styles.scoreInput}
                        value={grades[ans.id] ?? ""}
                        onChange={(e) => handleGradeChange(ans.id, e.target.value)}
                      />
                    </div>
                  ) : (
                    <div style={styles.autoScore}>نمره تستی: {ans.score_earned}</div>
                  )}
                </div>
              ))}
              <button onClick={submitGrades} style={styles.submitBtn}>
                ثبت نهایی نمره‌ها
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { direction: "rtl", padding: "30px", maxWidth: "900px", margin: "auto", fontFamily: "Tahoma" },
  sessionGrid: { display: "grid", gap: "15px", marginTop: "20px" },
  card: { background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", border: "1px solid #e0e0e0" },
  cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#7f8c8d", fontSize: "0.9rem" },
  dateTag: { fontSize: "0.8rem" },
  submitBtn: { padding: "10px 15px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" },
  empty: { textAlign: "center", padding: "50px", color: "#95a5a6" },
  center: { textAlign: "center", marginTop: "100px" },
  detailCard: { marginTop: "30px", background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee" },
  answerRow: { borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "15px" },
  gradeRow: { display: "flex", gap: "10px", alignItems: "center" },
  scoreInput: { width: "100px", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" },
  autoScore: { color: "#2c3e50", fontSize: "0.9rem" },
};

export default TeacherReviews;
