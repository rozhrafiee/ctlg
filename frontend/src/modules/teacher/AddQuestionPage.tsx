import { FormEvent, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

interface Question {
  id: number;
  text: string;
  question_type: "mcq" | "text";
  order: number;
  choices: Array<{
    id: number;
    text: string;
    is_correct: boolean;
    // ❌ score حذف شده
  }>;
}

interface ChoiceForm {
  text: string;
  is_correct: boolean;
  // ❌ score حذف شده
}

interface QuestionForm {
  text: string;
  question_type: "mcq" | "text";
  order: number;
  choices: ChoiceForm[];
}

export default function AddQuestionPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  const [testTitle, setTestTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    text: "",
    question_type: "mcq",
    order: 0,
    choices: [
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ],
  });

  useEffect(() => {
    if (testId) {
      loadTestDetails();
      loadQuestions();
    }
  }, [testId]);

  const loadTestDetails = async () => {
    try {
      const res = await api.get(`/api/assessment/tests/${testId}/`);
      setTestTitle(res.data.title);
    } catch (err) {
      console.error("خطا در بارگذاری جزئیات آزمون:", err);
    }
  };

  const loadQuestions = async () => {
    try {
      const res = await api.get(`/api/assessment/tests/${testId}/questions/`);
      setQuestions(res.data);
    } catch (err) {
      console.error("خطا در بارگذاری سوالات:", err);
    }
  };

  const handleChoiceChange = (index: number, field: keyof ChoiceForm, value: any) => {
    const newChoices = [...questionForm.choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    setQuestionForm({ ...questionForm, choices: newChoices });
  };

  const handleAddChoice = () => {
    setQuestionForm({
      ...questionForm,
      choices: [
        ...questionForm.choices,
        { text: "", is_correct: false },
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
      // آماده‌سازی داده‌ها (بدون score)
      const payload = {
        text: questionForm.text,
        question_type: questionForm.question_type,
        order: questionForm.order,
        choices: questionForm.question_type === "mcq" 
          ? questionForm.choices
              .filter(c => c.text.trim() !== "")
              .map(c => ({
                text: c.text,
                is_correct: c.is_correct
              }))
          : []
      };

      await api.post(`/api/assessment/tests/${testId}/questions/`, payload);
      
      alert("✅ سوال با موفقیت اضافه شد");
      
      // ریست فرم
      setQuestionForm({
        text: "",
        question_type: "mcq",
        order: questions.length,
        choices: [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
      });
      setShowQuestionForm(false);
      
      // بارگذاری مجدد سوالات
      await loadQuestions();
      
    } catch (err: any) {
      console.error("Error adding question:", err);
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
      await api.delete(`/api/assessment/questions/${questionId}/`);
      alert("✅ سوال حذف شد");
      await loadQuestions();
    } catch (err) {
      console.error("خطا در حذف سوال:", err);
      alert("خطا در حذف سوال");
    }
  };

  const handleDeleteChoice = async (choiceId: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این گزینه را حذف کنید؟")) {
      return;
    }
    
    try {
      await api.delete(`/api/assessment/choices/${choiceId}/`);
      alert("✅ گزینه حذف شد");
      await loadQuestions();
    } catch (err) {
      console.error("خطا در حذف گزینه:", err);
      alert("خطا در حذف گزینه");
    }
  };

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
          افزودن سوال به آزمون
        </h2>
        <h3 style={{ color: "#666", marginBottom: "25px" }}>
          {testTitle}
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
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          {showQuestionForm ? "✖ انصراف" : "➕ افزودن سوال جدید"}
        </button>
      </div>

      {/* فرم سوال جدید */}
      {showQuestionForm && (
        <form onSubmit={handleSubmitQuestion} style={{
          marginBottom: "40px",
          padding: "25px",
          border: "2px solid #0d6efd",
          borderRadius: "8px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ marginBottom: "20px", color: "#0d6efd", borderBottom: "2px solid #0d6efd", paddingBottom: "10px" }}>
            سوال جدید
          </h3>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "500", fontSize: "16px" }}>
              متن سوال *
              <textarea
                value={questionForm.text}
                onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                rows={4}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "5px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "16px",
                  resize: "vertical"
                }}
                placeholder="متن سوال را وارد کنید..."
              />
            </label>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
                نوع سوال
                <select
                  value={questionForm.question_type}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      question_type: e.target.value as "mcq" | "text",
                      choices: e.target.value === "text" ? [] : [
                        { text: "", is_correct: false },
                        { text: "", is_correct: false },
                      ]
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    border: "1px solid #ced4da",
                    borderRadius: "6px",
                    fontSize: "16px"
                  }}
                >
                  <option value="mcq">چندگزینه‌ای</option>
                  <option value="text">متنی</option>
                </select>
              </label>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
                ترتیب
                <input
                  type="number"
                  min="0"
                  value={questionForm.order}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    border: "1px solid #ced4da",
                    borderRadius: "6px",
                    fontSize: "16px"
                  }}
                />
              </label>
            </div>
          </div>

          {/* بخش گزینه‌ها (فقط برای سوالات چندگزینه‌ای) */}
          {questionForm.question_type === "mcq" && (
            <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "2px solid #dee2e6" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h4 style={{ margin: 0, color: "#495057" }}>
                  گزینه‌ها ({questionForm.choices.length})
                  <span style={{ fontSize: "14px", color: "#6c757d", marginLeft: "10px" }}>
                    (حداقل ۲ گزینه معتبر نیاز است)
                  </span>
                </h4>
                
                <button
                  type="button"
                  onClick={handleAddChoice}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <span>➕</span> افزودن گزینه
                </button>
              </div>
              
              {questionForm.choices.map((choice, cIndex) => (
                <div key={cIndex} style={{
                  marginBottom: "15px",
                  padding: "20px",
                  backgroundColor: choice.is_correct ? "#d4edda" : "#f8f9fa",
                  borderRadius: "8px",
                  border: choice.is_correct ? "2px solid #28a745" : "1px solid #e9ecef",
                  position: "relative"
                }}>
                  <div style={{
                    position: "absolute",
                    top: "-10px",
                    left: "20px",
                    backgroundColor: choice.is_correct ? "#28a745" : "#6c757d",
                    color: "white",
                    padding: "5px 15px",
                    borderRadius: "4px",
                    fontSize: "13px",
                    fontWeight: "bold"
                  }}>
                    گزینه {cIndex + 1}
                    {choice.is_correct && " ✓ صحیح"}
                  </div>
                  
                  <div style={{ display: "flex", gap: "15px", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "10px", fontSize: "15px", fontWeight: "500" }}>
                        متن گزینه *
                        <input
                          value={choice.text}
                          onChange={(e) => handleChoiceChange(cIndex, "text", e.target.value)}
                          required
                          style={{
                            width: "100%",
                            padding: "12px",
                            marginTop: "5px",
                            border: "1px solid #ced4da",
                            borderRadius: "6px",
                            fontSize: "16px"
                          }}
                          placeholder="متن گزینه را وارد کنید..."
                        />
                      </label>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "150px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={choice.is_correct}
                          onChange={(e) => handleChoiceChange(cIndex, "is_correct", e.target.checked)}
                          style={{ width: "18px", height: "18px" }}
                        />
                        <span style={{ 
                          color: choice.is_correct ? "#28a745" : "#6c757d", 
                          fontWeight: choice.is_correct ? "bold" : "normal",
                          fontSize: "15px"
                        }}>
                          پاسخ صحیح
                        </span>
                      </label>
                      
                      {questionForm.choices.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChoice(cIndex)}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px"
                          }}
                        >
                          حذف این گزینه
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div style={{
                backgroundColor: "#e7f3ff",
                border: "1px solid #b6d4fe",
                borderRadius: "6px",
                padding: "15px",
                marginTop: "20px",
                fontSize: "14px",
                color: "#084298"
              }}>
                📝 <strong>نکته:</strong> هر سوال ۱۰ نمره دارد. برای سوالات چندگزینه‌ای، دانش‌آموز باید گزینه صحیح را انتخاب کند.
              </div>
            </div>
          )}
          
          {/* برای سوالات متنی */}
          {questionForm.question_type === "text" && (
            <div style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "6px",
              padding: "15px",
              marginTop: "20px",
              fontSize: "14px",
              color: "#856404"
            }}>
              ⚠️ <strong>توجه:</strong> سوالات متنی نیاز به تصحیح دستی توسط استاد دارند.
              <div style={{ marginTop: "5px" }}>
                • نمره این سوالات به صورت دستی تعیین می‌شود.
                <br/>
                • حداکثر نمره برای هر سوال متنی ۱۰ است.
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: "25px",
              padding: "12px 25px",
              backgroundColor: loading ? "#6c757d" : "#0d6efd",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "17px",
              fontWeight: "bold",
              width: "100%"
            }}
          >
            {loading ? "⏳ در حال ذخیره..." : "💾 ذخیره سوال"}
          </button>
        </form>
      )}

      {/* لیست سوالات موجود */}
      <div>
        <h3 style={{ marginBottom: "20px", color: "#333", borderBottom: "2px solid #dee2e6", paddingBottom: "10px" }}>
          سوالات موجود ({questions.length})
        </h3>
        
        {questions.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "2px dashed #dee2e6"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "20px", color: "#6c757d" }}>📝</div>
            <h4 style={{ color: "#6c757d", marginBottom: "10px" }}>هنوز سوالی اضافه نکرده‌اید</h4>
            <p style={{ color: "#6c757d" }}>برای شروع، روی دکمه "افزودن سوال جدید" کلیک کنید</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {questions.map((question, qIndex) => (
              <div key={question.id} style={{
                backgroundColor: "#fff",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "25px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                      <div style={{
                        backgroundColor: "#0d6efd",
                        color: "white",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: "bold"
                      }}>
                        {qIndex + 1}
                      </div>
                      <h4 style={{ margin: 0, color: "#333", fontSize: "18px" }}>
                        {question.text}
                      </h4>
                    </div>
                    
                    <div style={{ marginLeft: "44px", fontSize: "14px", color: "#6c757d" }}>
                      <span style={{ 
                        backgroundColor: question.question_type === "mcq" ? "#d4edda" : "#fff3cd",
                        color: question.question_type === "mcq" ? "#155724" : "#856404",
                        padding: "4px 12px",
                        borderRadius: "4px",
                        marginRight: "10px"
                      }}>
                        {question.question_type === "mcq" ? "چندگزینه‌ای" : "متنی"}
                      </span>
                      <span>ترتیب: {question.order}</span>
                      {question.question_type === "mcq" && (
                        <span style={{ marginLeft: "15px" }}>
                          گزینه‌ها: {question.choices.length}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    style={{
                      padding: "8px 15px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                      marginLeft: "10px"
                    }}
                  >
                    حذف سوال
                  </button>
                </div>
                
                {/* نمایش گزینه‌ها برای سوالات چندگزینه‌ای */}
                {question.question_type === "mcq" && question.choices.length > 0 && (
                  <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e9ecef" }}>
                    <h5 style={{ marginBottom: "15px", color: "#495057", fontSize: "16px" }}>گزینه‌ها:</h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {question.choices.map((choice, cIndex) => (
                        <div key={choice.id} style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "15px",
                          backgroundColor: choice.is_correct ? "#d4edda" : "#f8f9fa",
                          borderRadius: "6px",
                          border: choice.is_correct ? "2px solid #28a745" : "1px solid #e9ecef"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{
                              backgroundColor: choice.is_correct ? "#28a745" : "#6c757d",
                              color: "white",
                              width: "24px",
                              height: "24px",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                              fontWeight: "bold"
                            }}>
                              {cIndex + 1}
                            </span>
                            <span style={{ 
                              fontSize: "16px",
                              fontWeight: choice.is_correct ? "bold" : "normal",
                              color: choice.is_correct ? "#155724" : "#212529"
                            }}>
                              {choice.text}
                              {choice.is_correct && (
                                <span style={{ 
                                  marginLeft: "8px",
                                  color: "#28a745",
                                  fontSize: "14px"
                                }}>
                                  ✓ پاسخ صحیح
                                </span>
                              )}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteChoice(choice.id)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "13px"
                            }}
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}