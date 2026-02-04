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

  useEffect(() => {
    if (sessionId) {
      assessmentAPI.getTestSession(sessionId)
        .then(res => {
          setSession(res.data);
          setTimeLeft((res.data.duration || 30) * 60);
        })
        .catch(() => navigate("/dashboard"));
    }
  }, [sessionId, navigate]);

  const handleFinish = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await assessmentAPI.finishTest(sessionId);
      alert("آزمون با موفقیت ثبت شد.");
      navigate(`/test-results/${sessionId}`);
    } catch (err) {
      alert("خطا در اتمام آزمون.");
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, navigate, isSubmitting]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleFinish]);

  const handleAnswerChange = async (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
    try {
      await assessmentAPI.submitAnswer(sessionId, questionId, {
        [typeof value === 'number' ? 'choice_id' : 'text_answer']: value
      });
    } catch (err) { console.error("Error saving answer"); }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!session) return <div style={{textAlign: 'center', marginTop: '50px'}}>در حال بارگذاری...</div>;

  return (
    <div style={styles.container}>
      <div style={{...styles.timerBox, color: timeLeft < 60 ? 'red' : '#333'}}>
        زمان باقی‌مانده: {formatTime(timeLeft)}
      </div>
      <h2 style={{textAlign: 'center'}}>{session.test_title}</h2>
      {session.questions?.map((q, idx) => (
        <div key={q.id} style={styles.qCard}>
          <p><strong>{idx + 1}. {q.text}</strong></p>
          {q.q_type === 'multiple_choice' ? (
            <div style={styles.choices}>
              {q.choices.map(choice => (
                <label key={choice.id} style={styles.choiceLabel}>
                  <input 
                    type="radio" 
                    name={`q-${q.id}`} 
                    onChange={() => handleAnswerChange(q.id, choice.id)}
                    checked={answers[q.id] === choice.id}
                  /> {choice.text}
                </label>
              ))}
            </div>
          ) : (
            <textarea 
              style={styles.textarea} 
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              placeholder="پاسخ خود را بنویسید..."
            />
          )}
        </div>
      ))}
      <button style={styles.submitBtn} onClick={handleFinish} disabled={isSubmitting}>
        {isSubmitting ? "در حال ثبت..." : "اتمام آزمون"}
      </button>
    </div>
  );
};

const styles = {
  container: { direction: 'rtl', padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Tahoma' },
  timerBox: { position: 'sticky', top: '10px', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', zIndex: 100 },
  qCard: { background: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #eee' },
  choices: { display: 'flex', flexDirection: 'column', gap: '10px' },
  choiceLabel: { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' },
  textarea: { width: '100%', minHeight: '100px', padding: '10px', borderRadius: '6px', marginTop: '10px' },
  submitBtn: { width: '100%', padding: '15px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};

export default TakeTest; 