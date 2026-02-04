import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assessmentAPI } from "../services/api";

const TestForm = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [testData, setTestData] = useState({
    title: "",
    test_type: "general",
    description: "",
    time_limit_minutes: 30,
    target_level: 1,
  });

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (id) {
      const fetchFullTestData = async () => {
        setLoading(true);
        try {
          // فقط از یک endpoint استفاده می‌کنیم که اطلاعات آزمون + سوالات را برمی‌گرداند
          const res = await assessmentAPI.getTestDetails(id);
          const data = res.data;
          setTestData({
            title: data.title || "",
            test_type: data.test_type || "general",
            description: data.description || "",
            time_limit_minutes: data.time_limit_minutes || 30,
            target_level: data.target_level || 1,
          });

          if (data.questions) {
            setQuestions(data.questions.map(q => ({
              ...q,
              id: q.id || Math.random(),
            })));
          }
        } catch (err) {
          console.error("خطا در بارگذاری:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchFullTestData();
    }
  }, [id]);

  const addQuestion = (type) => {
    const newQ = {
      id: Date.now(),
      text: "",
      question_type: type === 'mcq' ? 'mcq' : 'text',
      category: 'logic',
      choices: type === 'mcq' ? [
        { text: "", is_correct: true, order: 1 },
        { text: "", is_correct: false, order: 2 }
      ] : []
    };
    setQuestions([...questions, newQ]);
  };

  const handleQuestionChange = (qId, field, value) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, [field]: value } : q));
  };

  const addChoice = (qId) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return { ...q, choices: [...q.choices, { text: "", is_correct: false, order: q.choices.length + 1 }] };
      }
      return q;
    }));
  };

  const removeChoice = (qId, cIdx) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.choices.length > 2) {
        return { ...q, choices: q.choices.filter((_, index) => index !== cIdx) };
      }
      return q;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) return alert("لطفاً حداقل یک سوال اضافه کنید.");

    // پاکسازی برای ارسال به دیتابیس
    const formattedQuestions = questions.map((q, index) => {
      const { id: _, ...restOfQuestion } = q; 
      return {
        ...restOfQuestion,
        order: index + 1,
        choices: q.question_type === 'mcq' ? q.choices.map((c, cIdx) => {
          const { id: __, ...restOfChoice } = c;
          return { ...restOfChoice, order: cIdx + 1 };
        }) : []
      };
    });

    const payload = {
      ...testData,
      time_limit_minutes: parseInt(testData.time_limit_minutes),
      target_level: testData.test_type === 'placement' ? 0 : parseInt(testData.target_level),
      questions: formattedQuestions
    };

    try {
      if (id) {
        await assessmentAPI.updateTest(id, payload);
        alert("✅ آزمون با موفقیت ویرایش شد!");
      } else {
        await assessmentAPI.createTest(payload);
        alert("✅ آزمون جدید با موفقیت ثبت شد!");
      }
      navigate("/teacher/tests");
    } catch (err) {
      console.error("جزئیات خطای سرور:", err.response?.data);
      alert(`❌ خطا در ذخیره‌سازی: ${JSON.stringify(err.response?.data || "ارتباط با سرور برقرار نشد")}`);
    }
  };

  if (loading) return <div style={styles.center}>در حال بارگذاری اطلاعات آزمون...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{id ? "✏️ ویرایش آزمون" : "🛠️ طراحی آزمون جدید"}</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.card}>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label>عنوان آزمون:</label>
              <input 
                style={styles.input} 
                required 
                value={testData.title}
                onChange={e => setTestData({...testData, title: e.target.value})} 
              />
            </div>
            <div style={styles.field}>
              <label>نوع آزمون:</label>
              <select style={styles.input} value={testData.test_type} onChange={e => setTestData({...testData, test_type: e.target.value})}>
                <option value="general">عمومی (سطح‌بندی شده)</option>
                <option value="placement">تعیین سطح (برای همه)</option>
                <option value="content_based">مرتبط با محتوا</option>
              </select>
            </div>

            {/* فیلد انتخاب سطح هدف - فقط برای آزمون‌های غیر تعیین سطح */}
            {testData.test_type !== 'placement' && (
              <div style={styles.field}>
                <label>مناسب برای سطح:</label>
                <select 
                  style={{...styles.input, border: '1px solid #e67e22'}} 
                  value={testData.target_level} 
                  onChange={e => setTestData({...testData, target_level: e.target.value})}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => (
                    <option key={lvl} value={lvl}>سطح {lvl}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={styles.field}>
              <label>زمان (دقیقه):</label>
              <input 
                type="number" 
                style={styles.input} 
                value={testData.time_limit_minutes} 
                onChange={e => setTestData({...testData, time_limit_minutes: e.target.value})} 
              />
            </div>
          </div>
        </div>

        {questions.map((q, index) => (
          <div key={q.id} style={styles.qCard}>
            <div style={styles.qHeader}>
              <span>سوال {index + 1} ({q.question_type === 'mcq' ? 'تستی' : 'تشریحی'})</span>
              <button type="button" onClick={() => setQuestions(questions.filter(item => item.id !== q.id))} style={styles.delBtn}>حذف سوال</button>
            </div>
            
            <input 
              placeholder="متن سوال را اینجا بنویسید..." 
              style={{...styles.input, marginTop: '10px', marginBottom: '15px'}}
              value={q.text} 
              onChange={e => handleQuestionChange(q.id, 'text', e.target.value)} 
              required 
            />
            
            {q.question_type === 'mcq' && (
              <div style={styles.choiceBox}>
                {q.choices.map((c, cIdx) => (
                  <div key={cIdx} style={styles.choiceRow}>
                    <button type="button" onClick={() => removeChoice(q.id, cIdx)} style={styles.miniDelBtn}>×</button>
                    <input 
                      placeholder={`متن گزینه ${cIdx + 1}`} 
                      style={styles.choiceInput} 
                      value={c.text}
                      onChange={e => {
                        const newChoices = [...q.choices];
                        newChoices[cIdx].text = e.target.value;
                        handleQuestionChange(q.id, 'choices', newChoices);
                      }} 
                      required 
                    />
                    <div style={styles.radioWrapper}>
                      <input 
                        type="radio" 
                        name={`correct-${q.id}`} 
                        checked={c.is_correct}
                        style={styles.radio}
                        onChange={() => {
                          const newChoices = q.choices.map((ch, idx) => ({...ch, is_correct: idx === cIdx}));
                          handleQuestionChange(q.id, 'choices', newChoices);
                        }} 
                      />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => addChoice(q.id)} style={styles.addChoiceBtn}>+ افزودن گزینه جدید</button>
              </div>
            )}
          </div>
        ))}

        <div style={styles.btnRow}>
          <button type="button" onClick={() => addQuestion('mcq')} style={styles.addBtn}>+ سوال تستی</button>
          <button type="button" onClick={() => addQuestion('text')} style={styles.addBtn}>+ سوال تشریحی</button>
        </div>

        <button type="submit" style={styles.submitBtn}>
          {id ? "بروزرسانی تغییرات آزمون" : "ذخیره و انتشار آزمون"}
        </button>
      </form>
    </div>
  );
};

// استایل‌ها
const styles = {
  container: { direction: 'rtl', padding: '20px', maxWidth: '850px', margin: '0 auto', fontFamily: 'Tahoma' },
  title: { textAlign: 'center', color: '#2c3e50', marginBottom: '30px' },
  card: { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' },
  qCard: { background: '#fff', padding: '20px', borderRadius: '12px', borderRight: '5px solid #3498db', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' },
  qHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' },
  choiceBox: { marginTop: '10px', background: '#f8f9fa', padding: '15px', borderRadius: '10px' },
  choiceRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  choiceInput: { flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff' },
  radioWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px' },
  radio: { width: '20px', height: '20px', cursor: 'pointer' },
  miniDelBtn: { background: '#ff7675', color: '#fff', border: 'none', width: '30px', height: '30px', borderRadius: '5px', cursor: 'pointer', fontSize: '18px' },
  addChoiceBtn: { width: '100%', padding: '10px', background: 'none', border: '1px dashed #3498db', color: '#3498db', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' },
  btnRow: { display: 'flex', gap: '10px', marginBottom: '30px' },
  addBtn: { flex: 1, padding: '12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  submitBtn: { width: '100%', padding: '15px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
  delBtn: { background: '#ff7675', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' },
  center: { textAlign: 'center', padding: '100px', fontSize: '1.2rem' }
};

export default TestForm;
