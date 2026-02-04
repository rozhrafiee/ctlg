import React, { useState, useEffect } from "react";
import { assessmentAPI } from "../services/api";

const TeacherReviews = () => {
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      // ✅ GET /assessment/teacher/reviews/pending/
      const res = await assessmentAPI.getPendingReviews();

      // ✅ map TestSession → UI-friendly structure
      const mapped = res.data.flatMap((session) =>
        session.answers
          .filter((a) => a.question_type === "text")
          .map((a) => ({
            id: a.id, // answer_id (مهم)
            session_id: session.id,
            student_name: session.user_full_name,
            submit_date: session.finished_at,
            question_text: a.question_text,
            student_answer: a.text_answer,
          }))
      );

      setPendingSubmissions(mapped);
    } catch (err) {
      console.error("خطا در بارگذاری:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewChange = (answerId, field, value) => {
    setReviews((prev) => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        [field]: value,
      },
    }));
  };

  const handleSubmitScore = async (answerId, sessionId) => {
    const reviewData = reviews[answerId];
    if (!reviewData?.score)
      return alert("لطفاً ابتدا نمره را وارد کنید");

    try {
      // ✅ POST /assessment/teacher/sessions/:id/grade/
      await assessmentAPI.submitManualGrade(sessionId, {
        grades: [
          {
            answer_id: answerId,
            score: Number(reviewData.score),
          },
        ],
      });

      alert("نمره با موفقیت ثبت شد ✅");

      setPendingSubmissions((prev) =>
        prev.filter((s) => s.id !== answerId)
      );
    } catch (err) {
      console.error(err);
      alert("خطا در ثبت نمره");
    }
  };

  if (loading)
    return (
      <div style={styles.center}>
        در حال بارگذاری پاسخ‌های دانشجویان...
      </div>
    );

  return (
    <div style={styles.container}>
      <h2 style={{ borderBottom: "2px solid #3498db", paddingBottom: 10 }}>
        📝 میز تصحیح اساتید
      </h2>

      {pendingSubmissions.length === 0 ? (
        <div style={styles.empty}>
          هیچ پاسخ تشریحی در انتظار تصحیحی وجود ندارد.
        </div>
      ) : (
        pendingSubmissions.map((sub) => (
          <div key={sub.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <strong>دانشجو: {sub.student_name}</strong>
              <span style={styles.dateTag}>{sub.submit_date}</span>
            </div>

            <div style={styles.questionSection}>
              <p>
                <strong>سوال:</strong> {sub.question_text}
              </p>
              <div style={styles.answerBox}>
                <strong>پاسخ دانشجو:</strong>
                <p>{sub.student_answer}</p>
              </div>
            </div>

            <div style={styles.gradeSection}>
              <div>
                <label>نمره:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  style={styles.scoreInput}
                  onChange={(e) =>
                    handleReviewChange(sub.id, "score", e.target.value)
                  }
                />
              </div>

              <button
                onClick={() =>
                  handleSubmitScore(sub.id, sub.session_id)
                }
                style={styles.submitBtn}
              >
                ثبت نمره نهایی
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: { direction: "rtl", padding: 30, maxWidth: 900, margin: "auto" },
  card: { background: "#fff", borderRadius: 12, padding: 20, marginBottom: 25 },
  cardHeader: { display: "flex", justifyContent: "space-between" },
  questionSection: { background: "#f8f9fa", padding: 15, borderRadius: 8 },
  answerBox: { marginTop: 15, padding: 10, borderRight: "4px solid #3498db" },
  gradeSection: { display: "flex", gap: 15, alignItems: "flex-end" },
  scoreInput: { width: 80, padding: 10 },
  submitBtn: { background: "#27ae60", color: "#fff", padding: "12px 20px" },
  empty: { textAlign: "center", padding: 50 },
  center: { textAlign: "center", marginTop: 100 },
};

export default TeacherReviews;
