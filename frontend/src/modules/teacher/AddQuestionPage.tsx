import { FormEvent, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

interface Question {
  id: number;
  text: string;
  question_type: "mcq" | "text";
  order: number;
  points: number;
  choices: Array<{
    id: number;
    text: string;
    is_correct: boolean;
    order: number;
  }>;
}

interface ChoiceForm {
  text: string;
  is_correct: boolean;
  order: number;
}

interface QuestionForm {
  text: string;
  question_type: "mcq" | "text";
  order: number;
  points: number;
  choices: ChoiceForm[];
}

export default function AddQuestionPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  console.log("🚀 AddQuestionPage باز شد. testId:", testId);
  
  const [testTitle, setTestTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    text: "",
    question_type: "mcq",
    order: 0,
    points: 10,
    choices: [
      { text: "", is_correct: false, order: 0 },
      { text: "", is_correct: false, order: 1 },
    ],
  });

  useEffect(() => {
    console.log("🔄 useEffect اجرا شد. testId:", testId);
    
    if (testId) {
      console.log("✅ testId معتبر است. شروع بارگذاری...");
      loadTestDetails();
      loadQuestions();
    } else {
      console.error("❌ testId undefined است!");
      setError("شناسه آزمون معتبر نیست");
    }
  }, [testId]);

  const loadTestDetails = async () => {
    try {
      console.log(`📥 درخواست جزئیات آزمون از: /assessment/teacher/tests/${testId}/`);
      
      // ✅ endpoint مدرس
      const res = await api.get(`/assessment/teacher/tests/${testId}/`);
      
      console.log("✅ جزئیات آزمون دریافت شد:", res.data);
      setTestTitle(res.data.title);
      
    } catch (err: any) {
      console.error("❌ خطا در بارگذاری جزئیات آزمون:", err);
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      
      // ❌ اگر endpoint مدرس کار نکرد، endpoint عمومی را امتحان کن
      try {
        console.log("⚠️ در حال امتحان endpoint عمومی...");
        const res = await api.get(`/assessment/tests/${testId}/`);
        setTestTitle(res.data.title);
      } catch (err2: any) {
        console.error("❌ endpoint عمومی هم کار نکرد");
        setError("آزمون یافت نشد");
      }
    }
  };

  const loadQuestions = async () => {
    try {
      console.log(`📥 درخواست سوالات از: /assessment/teacher/tests/${testId}/questions/list/`);
      
      // ✅ endpoint مدرس برای سوالات
      const res = await api.get(`/assessment/teacher/tests/${testId}/questions/list/`);
      
      console.log("✅ سوالات دریافت شد:", res.data);
      setQuestions(res.data || []);
      
    } catch (err: any) {
      console.error("❌ خطا در بارگذاری سوالات:", err);
      console.error("Status:", err.response?.status);
      
      // ❌ اگر کار نکرد، endpoint عمومی را امتحان کن
      try {
        console.log("⚠️ در حال امتحان endpoint عمومی سوالات...");
        const res = await api.get(`/assessment/tests/${testId}/questions/`);
        setQuestions(res.data || []);
      } catch (err2: any) {
        console.error("❌ endpoint عمومی سوالات هم کار نکرد");
        setQuestions([]); // آرایه خالی
      }
    }
  };

  const handleChoiceChange = (index: number, field: keyof ChoiceForm, value: any) => {
    const newChoices = [...questionForm.choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    setQuestionForm({ ...questionForm, choices: newChoices });
  };

  const handleAddChoice = () => {
    const newOrder = questionForm.choices.length;
    setQuestionForm({
      ...questionForm,
      choices: [
        ...questionForm.choices,
        { text: "", is_correct: false, order: newOrder },
      ],
    });
  };

  const handleRemoveChoice = (index: number) => {
    if (questionForm.choices.length <= 2) return;
    const newChoices = questionForm.choices.filter((_, i) => i !== index);
    setQuestionForm({ ...questionForm, choices: newChoices });
  };

  const handleSubmitQuestion = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!testId) {
      setError("شناسه آزمون معتبر نیست");
      return;
    }
    
    setLoading(true);
    setError(null);

    // اعتبارسنجی
    if (!questionForm.text.trim()) {
      setError("متن سوال را وارد کنید");
      setLoading(false);
      return;
    }

    if (questionForm.question_type === "mcq") {
      const validChoices = questionForm.choices.filter(c => c.text.trim() !== "");
      if (validChoices.length < 2) {
        setError("حداقل ۲ گزینه معتبر وارد کنید");
        setLoading(false);
        return;
      }
      
      const hasCorrectAnswer = validChoices.some(c => c.is_correct);
      if (!hasCorrectAnswer) {
        setError("حداقل یک گزینه باید به عنوان پاسخ صحیح علامت زده شود");
        setLoading(false);
        return;
      }
    }

    try {
      // آماده‌سازی داده‌ها
      const payload = {
        text: questionForm.text,
        question_type: questionForm.question_type,
        order: questionForm.order,
        points: questionForm.points,
        choices: questionForm.question_type === "mcq" 
          ? questionForm.choices
              .filter(c => c.text.trim() !== "")
              .map((c, index) => ({
                text: c.text,
                is_correct: c.is_correct,
                order: index
              }))
          : []
      };

      console.log("📤 ارسال سوال جدید:", payload);
      console.log(`📤 به آدرس: /assessment/teacher/tests/${testId}/questions/`);
      
      // ✅ endpoint مدرس برای افزودن سوال
      await api.post(`/assessment/teacher/tests/${testId}/questions/`, payload);
      
      alert("✅ سوال با موفقیت اضافه شد");
      
      // ریست فرم
      setQuestionForm({
        text: "",
        question_type: "mcq",
        order: questions.length,
        points: 10,
        choices: [
          { text: "", is_correct: false, order: 0 },
          { text: "", is_correct: false, order: 1 },
        ],
      });
      setShowQuestionForm(false);
      
      // بارگذاری مجدد سوالات
      await loadQuestions();
      
    } catch (err: any) {
      console.error("Error adding question:", err);
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.text?.[0] ||
                      "خطا در افزودن سوال";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این سوال را حذف کنید؟")) {
      return;
    }
    
    try {
      console.log(`🗑️ در حال حذف سوال ${questionId}`);
      
      // ✅ endpoint حذف سوال
      await api.delete(`/assessment/teacher/questions/${questionId}/delete/`);
      
      alert("✅ سوال حذف شد");
      await loadQuestions();
    } catch (err: any) {
      console.error("خطا در حذف سوال:", err);
      alert("خطا در حذف سوال");
    }
  };

  // ❌ تابع handleDeleteChoice را حذف کن چون endpoint نداریم

  if (!testId) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>❌ خطا: شناسه آزمون معتبر نیست</h3>
        <p>لطفاً از طریق پنل استاد مجدداً وارد شوید.</p>
        <button
          onClick={() => navigate("/teacher")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0d6efd",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "20px"
          }}
        >
          بازگشت به پنل استاد
        </button>
      </div>
    );
  }

  // نمایش ساده‌تر برای دیباگ
  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/teacher")}
          style={{
            padding: "8px 15px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "15px"
          }}
        >
          ← بازگشت به پنل استاد
        </button>
        
        <h2 style={{ color: "#333", marginBottom: "5px" }}>
          مدیریت سوالات آزمون
        </h2>
        <h3 style={{ color: "#666", marginBottom: "25px" }}>
          {testTitle || `آزمون شماره ${testId}`}
        </h3>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "10px",
          borderRadius: "5px",
          marginBottom: "20px",
          border: "1px solid #f5c6cb"
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: "30px" }}>
        <button
          onClick={() => setShowQuestionForm(!showQuestionForm)}
          style={{
            padding: "12px 20px",
            backgroundColor: showQuestionForm ? "#dc3545" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          {showQuestionForm ? "✖ انصراف" : "➕ افزودن سوال جدید"}
        </button>
      </div>

      {/* فرم سوال - نسخه ساده شده */}
      {showQuestionForm && (
        <form onSubmit={handleSubmitQuestion} style={{
          marginBottom: "40px",
          padding: "25px",
          border: "2px solid #0d6efd",
          borderRadius: "8px",
          backgroundColor: "#fff"
        }}>
          <h3>سوال جدید</h3>
          
          <div style={{ marginBottom: "20px" }}>
            <label>
              متن سوال *
              <textarea
                value={questionForm.text}
                onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                rows={4}
                required
                style={{ width: "100%", padding: "10px", marginTop: "5px" }}
              />
            </label>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: "12px 25px",
              backgroundColor: loading ? "#6c757d" : "#0d6efd",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%"
            }}
          >
            {loading ? "در حال ذخیره..." : "ذخیره سوال"}
          </button>
        </form>
      )}

      {/* لیست سوالات */}
      <div>
        <h3>سوالات موجود ({questions.length})</h3>
        
        {questions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            📝 هنوز سوالی اضافه نکرده‌اید
          </div>
        ) : (
          <div>
            {questions.map((question, index) => (
              <div key={question.id} style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "15px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong>سوال {index + 1}:</strong> {question.text}
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}