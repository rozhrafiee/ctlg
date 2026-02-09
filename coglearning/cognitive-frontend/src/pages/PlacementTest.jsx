
import React, { useEffect, useState } from "react";
import { assessmentAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const PlacementTest = () => {
  const [test, setTest] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const initTest = async () => {
      try {
        // ۱. دریافت لیست آزمون‌های در دسترس برای دانشجو
        const res = await assessmentAPI.getAvailableTests();
        const allTests = res.data || [];
        
        // پیدا کردن آزمون تعیین سطح اصلی (Placement)
        // این بخش تضمین می‌کند که دانشجو فقط آزمون تعیین سطح را ببیند
        const placementTest = allTests.find(t => t.test_type === 'placement');
        
        if (placementTest) {
          const detailRes = await assessmentAPI.getTestDetail(placementTest.id);
          setTest(detailRes.data);
          
          // ۲. شروع خودکار نشست آزمون برای این تست خاص
          try {
            const sessionRes = await assessmentAPI.startTest(placementTest.id);
            if (sessionRes.data && sessionRes.data.id) {
              setSessionId(sessionRes.data.id);
            }
          } catch (sessionErr) {
            console.error("خطا در ایجاد نشست:", sessionErr);
          }
        }
      } catch (err) {
        console.error("خطا در بارگذاری آزمون:", err);
      } finally {
        setLoading(false);
      }
    };
    initTest();
  }, []);

  const handleOptionChange = (questionId, choiceId) => {
    setAnswers({ ...answers, [questionId]: choiceId });
  };

  const handleSubmit = async () => {
    if (!sessionId) {
      alert("خطا: نشست آزمون یافت نشد. لطفا صفحه را رفرش کنید.");
      return;
    }

    const questions = test?.questions || [];
    if (Object.keys(answers).length < questions.length) {
      alert(`لطفاً به تمام سوالات پاسخ دهید تا سطح دقیق شما مشخص شود.`);
      return;
    }

    setSubmitting(true);
    try {
      // ۱. ارسال تمام پاسخ‌ها به صورت موازی برای سرعت بیشتر
      const answerPromises = Object.entries(answers).map(([qId, cId]) =>
        assessmentAPI.submitAnswer(sessionId, qId, { selected_choice: cId })
      );
      await Promise.all(answerPromises);

      // ۲. اعلام پایان آزمون و دریافت سطح جدید
      const finishRes = await assessmentAPI.finishTest(sessionId);
      const score = finishRes.data.score ?? "نامشخص";
      alert(`تبریک! آزمون با موفقیت به پایان رسید.\nامتیاز شما: ${score}`);
      
      // ۳. انتقال به داشبورد اصلی شهروند
      navigate("/dashboard"); 
    } catch (err) {
      console.error("خطا در ثبت نهایی:", err);
      alert("خطا در ارسال پاسخ‌ها. لطفا اتصالات خود را بررسی کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={styles.center}>در حال آماده‌سازی سوالات تعیین سطح...</div>;
  
  if (!test) return (
    <div style={styles.center}>
      <p>آزمون تعیین سطحی توسط استاد تعریف نشده است.</p>
      <button onClick={() => navigate("/dashboard")} style={styles.smallBtn}>بازگشت به داشبورد</button>
    </div>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.mainTitle}>سنجش سطح شناختی اولیه</h1>
        <div style={styles.userInfo}>
          <span>دانشجو: <strong>{user?.username || 'کاربر مهمان'}</strong></span>
          <span style={styles.badge}>آزمون جامع ورودی</span>
        </div>
      </header>

      <div style={styles.questionsList}>
        {test.questions?.map((q, index) => (
          <div key={q.id} style={styles.card}>
            <h3 style={styles.questionText}>{index + 1}. {q.text}</h3>
            <div style={styles.options}>
              {q.choices?.map((choice) => (
                <label key={choice.id} style={{
                  ...styles.optionLabel,
                  backgroundColor: answers[q.id] === choice.id ? '#e3f2fd' : '#fff',
                  borderColor: answers[q.id] === choice.id ? '#3498db' : '#eee'
                }}>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={choice.id}
                    checked={answers[q.id] === choice.id}
                    onChange={() => handleOptionChange(q.id, choice.id)}
                    style={styles.radioInput}
                  />
                  <span style={styles.choiceText}>{choice.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <button 
          onClick={handleSubmit} 
          disabled={submitting || !sessionId} 
          style={submitting || !sessionId ? styles.btnDisabled : styles.btn}
        >
          {submitting ? "در حال تحلیل هوشمند سطح شما..." : "تایید و مشاهده نتیجه نهایی"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '850px', margin: '40px auto', padding: '20px', direction: 'rtl', fontFamily: 'Tahoma, Segoe UI' },
  header: { borderBottom: '3px solid #3498db', marginBottom: '30px', paddingBottom: '20px', textAlign: 'center' },
  mainTitle: { color: '#2c3e50', fontSize: '1.8rem', margin: '0 0 10px 0' },
  userInfo: { display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', color: '#7f8c8d' },
  badge: { backgroundColor: '#e1f5fe', color: '#0288d1', padding: '4px 12px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold' },
  card: { background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' },
  questionText: { fontSize: '1.15rem', marginBottom: '20px', color: '#34495e', lineHeight: '1.6' },
  options: { display: 'flex', flexDirection: 'column', gap: '12px' },
  optionLabel: { display: 'flex', alignItems: 'center', padding: '15px', borderRadius: '10px', cursor: 'pointer', transition: '0.3s', border: '1px solid' },
  radioInput: { marginLeft: '15px', width: '18px', height: '18px' },
  choiceText: { fontSize: '1rem', color: '#2c3e50' },
  footer: { marginTop: '40px', textAlign: 'center' },
  btn: { width: '100%', padding: '18px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(46,204,113,0.3)' },
  btnDisabled: { width: '100%', padding: '18px', backgroundColor: '#bdc3c7', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'not-allowed' },
  center: { textAlign: 'center', marginTop: '120px', fontSize: '1.3rem', color: '#7f8c8d' },
  smallBtn: { marginTop: '20px', padding: '10px 20px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default PlacementTest;
