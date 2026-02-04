import React, { useState } from "react";
import { assessmentAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const AddTestForm = () => {
  const navigate = useNavigate();
  const [testData, setTestData] = useState({
    title: "",
    description: "",
    test_type: "regular", // می تواند 'regular' یا 'placement' باشد
    min_level: 1,
    max_level: 10,
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
      const res = await assessmentAPI.createTest({
        ...testData,
        questions: questions // فرض بر این است که بک هند آزمون و سوالات را با هم می پذیرد
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
      <h2>ایجاد آزمون جدید (توسط استاد)</h2>
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
            <option value="regular">آزمون محتوایی (معمولی)</option>
            <option value="placement">آزمون تعیین سطح (Placement)</option>
          </select>
        </div>

        {testData.test_type === 'regular' && (
          <div style={styles.levelRow}>
            <div>
              <label>حداقل سطح (۱-۱۰):</label>
              <input type="number" min="1" max="10" value={testData.min_level} onChange={(e) => setTestData({...testData, min_level: e.target.value})} />
            </div>
            <div>
              <label>حداکثر سطح (۱-۱۰):</label>
              <input type="number" min="1" max="10" value={testData.max_level} onChange={(e) => setTestData({...testData, max_level: e.target.value})} />
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