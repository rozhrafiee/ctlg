import React, { useState } from "react";
import { assessmentAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const AddTestForm = () => {
  const navigate = useNavigate();
  const [testData, setTestData] = useState({
    title: "",
    description: "",
    test_type: "general",
    time_limit_minutes: 30,
    target_level: 1,
  });

  const [questions, setQuestions] = useState([
    { text: "", choices: [{ text: "", is_correct: false }, { text: "", is_correct: false }] }
  ]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: "", choices: [{ text: "", is_correct: false }, { text: "", is_correct: false }] }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ۱. ابتدا خود آزمون را می سازیم
      await assessmentAPI.createTest({
        ...testData,
        time_limit_minutes: parseInt(testData.time_limit_minutes),
        target_level: parseInt(testData.target_level),
        questions
      });
      
      alert(testData.test_type === 'placement' ? "آزمون تعیین سطح با موفقیت ساخته شد" : "آزمون معمولی ساخته شد");
      navigate("/teacher/tests");
    } catch (err) {
      console.error(err);
      alert("خطا در ساخت آزمون");
    }
  };

  return (
    <div style={styles.container}>
      <h2>ایجاد آزمون جدید (توسط مسئول شهری/مدرس)</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.section}>
          <label>عنوان آزمون:</label>
          <input 
            type="text" 
            value={testData.title} 
            onChange={(e) => setTestData({...testData, title: e.target.value})} 
            required 
            style={styles.input}
          />
        </div>

        <div style={styles.section}>
          <label>نوع آزمون:</label>
          <select 
            value={testData.test_type} 
            onChange={(e) => setTestData({...testData, test_type: e.target.value})}
            style={styles.input}
          >
            <option value="general">آزمون عمومی</option>
            <option value="placement">آزمون تعیین سطح (Placement)</option>
            <option value="content_based">مرتبط با محتوا</option>
          </select>
        </div>

        {testData.test_type !== 'placement' && (
          <div style={styles.levelRow}>
            <div>
              <label>سطح هدف:</label>
              <input type="number" min="1" max="100" value={testData.target_level} onChange={(e) => setTestData({...testData, target_level: e.target.value})} />
            </div>
            <div>
              <label>زمان (دقیقه):</label>
              <input type="number" min="1" value={testData.time_limit_minutes} onChange={(e) => setTestData({...testData, time_limit_minutes: e.target.value})} />
            </div>
          </div>
        )}

        <hr />
        <h3>سوالات آزمون</h3>
        {questions.map((q, qIndex) => (
          <div key={qIndex} style={styles.questionBox}>
            <input 
              placeholder={`متن سوال ${qIndex + 1}`} 
              value={q.text} 
              onChange={(e) => {
                const newQs = [...questions];
                newQs[qIndex].text = e.target.value;
                setQuestions(newQs);
              }}
              style={styles.input}
            />
            {/* در اینجا می توانی بخش اضافه کردن گزینه ها را هم بگذاری */}
          </div>
        ))}

        <button type="button" onClick={handleAddQuestion} style={styles.addBtn}>+ افزودن سوال جدید</button>
        <button type="submit" style={styles.submitBtn}>ذخیره و انتشار آزمون</button>
      </form>
    </div>
  );
};

const styles = {
  container: { direction: 'rtl', padding: '30px', maxWidth: '800px', margin: 'auto' },
  section: { marginBottom: '15px' },
  input: { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' },
  levelRow: { display: 'flex', gap: '20px', marginBottom: '15px' },
  questionBox: { background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '10px' },
  addBtn: { background: '#3498db', color: '#fff', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' },
  submitBtn: { background: '#2ecc71', color: '#fff', border: 'none', padding: '15px', borderRadius: '5px', width: '100%', marginTop: '20px', fontSize: '1.1rem', cursor: 'pointer' }
};

export default AddTestForm;
