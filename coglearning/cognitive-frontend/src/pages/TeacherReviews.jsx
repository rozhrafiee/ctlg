import React, { useState, useEffect } from "react";
import { assessmentAPI } from "../services/api";

const TeacherReviews = () => {
  const [pendingSubmissions, setPendingSubmissions] = useState([]); 
  const [reviews, setReviews] = useState({}); // ذخیره نمره و فیدبک
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      // این API باید لیست جواب‌هایی که دانشجوها فرستادن و منتظر نمره هستن رو بیاره
      const response = await assessmentAPI.getPendingEssays(); 
      setPendingSubmissions(response.data || []);
    } catch (error) {
      console.error("خطا در بارگذاری:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewChange = (submissionId, field, value) => {
    setReviews((prev) => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value,
      },
    }));
  };

  const handleSubmitScore = async (submissionId) => {
    const reviewData = reviews[submissionId];
    if (!reviewData?.score) return alert("لطفاً ابتدا نمره را وارد کنید");

    try {
      // ارسال نمره نهایی (از 100) و فیدبک استاد به بک‌هند
      await assessmentAPI.submitGrade(submissionId, {
        score: reviewData.score,
        teacher_feedback: reviewData.feedback,
      });
      alert("نمره با موفقیت ثبت شد!");
      // حذف از لیست محلی
      setPendingSubmissions(prev => prev.filter(s => s.id !== submissionId));
    } catch (error) {
      alert("خطا در ثبت نمره");
    }
  };

  if (loading) return <div style={styles.center}>در حال بارگذاری پاسخ‌های دانشجویان...</div>;

  return (
    <div style={styles.container}>
      <h2 style={{borderBottom: '2px solid #3498db', paddingBottom: '10px'}}>📝 میز تصحیح اساتید</h2>
      
      {pendingSubmissions.length === 0 ? (
        <div style={styles.empty}>هیچ پاسخ تشریحی در انتظار تصحیحی وجود ندارد.</div>
      ) : (
        pendingSubmissions.map((sub) => (
          <div key={sub.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <strong>دانشجو: {sub.student_name}</strong>
              <span style={styles.dateTag}>{sub.submit_date}</span>
            </div>
            
            <div style={styles.questionSection}>
              <p><strong>سوال:</strong> {sub.question_text}</p>
              <div style={styles.answerBox}>
                <strong>پاسخ دانشجو:</strong>
                <p>{sub.student_answer}</p>
              </div>
            </div>

            <div style={styles.gradeSection}>
              <div style={{flex: 1}}>
                <label>نمره (از ۱۰۰):</label>
                <input 
                  type="number" 
                  min="0" max="100"
                  style={styles.scoreInput}
                  onChange={(e) => handleReviewChange(sub.id, 'score', e.target.value)}
                />
              </div>
              <div style={{flex: 2}}>
                <label>توضیحات استاد:</label>
                <textarea 
                  style={styles.feedbackArea}
                  placeholder="نکات اصلاحی را اینجا بنویسید..."
                  onChange={(e) => handleReviewChange(sub.id, 'feedback', e.target.value)}
                />
              </div>
              <button onClick={() => handleSubmitScore(sub.id)} style={styles.submitBtn}>
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
  container: { direction: 'rtl', padding: '30px', maxWidth: '900px', margin: 'auto', fontFamily: 'Tahoma' },
  card: { background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#7f8c8d', fontSize: '0.9rem' },
  questionSection: { background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' },
  answerBox: { marginTop: '15px', padding: '10px', borderRight: '4px solid #3498db', background: '#fff' },
  gradeSection: { display: 'flex', gap: '15px', alignItems: 'flex-end', borderTop: '1px solid #eee', paddingTop: '15px' },
  scoreInput: { width: '80px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', display: 'block', marginTop: '5px' },
  feedbackArea: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px', minHeight: '60px' },
  submitBtn: { padding: '12px 20px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  empty: { textAlign: 'center', padding: '50px', color: '#95a5a6' },
  center: { textAlign: 'center', marginTop: '100px' }
};

export default TeacherReviews;