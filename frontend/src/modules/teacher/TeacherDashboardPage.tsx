import { FormEvent, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";

interface Test {
  id: number;
  title: string;
  description: string;
  min_level: number;
  max_level: number;
  is_active: boolean;
  is_placement_test: boolean;
}

interface Content {
  id: number;
  title: string;
  description: string;
  content_type: string;
  min_level: number;
  max_level: number;
  is_active: boolean;
}

export default function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState<"tests" | "content">("tests");
  const [tests, setTests] = useState<Test[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // فرم آزمون
  const [testForm, setTestForm] = useState({
    title: "",
    description: "",
    min_level: 1,
    max_level: 10,
    is_active: true,
    is_placement_test: false,
    questions: [] as Array<{
      text: string;
      question_type: "mcq" | "text";
      order: number;
      choices: Array<{ text: string; is_correct: boolean; score: number }>;
    }>,
  });

  const [currentQuestion, setCurrentQuestion] = useState<{
    text: string;
    question_type: "mcq" | "text";
    order: number;
    choices: Array<{ text: string; is_correct: boolean; score: number }>;
  } | null>(null);

  // فرم محتوا
  const [contentForm, setContentForm] = useState({
    title: "",
    description: "",
    content_type: "text",
    body: "",
    min_level: 1,
    max_level: 10,
    is_active: true,
  });

  useEffect(() => {
    if (activeTab === "tests") {
      loadTests();
    } else {
      loadContents();
    }
  }, [activeTab]);

  const loadTests = async () => {
    try {
      const res = await api.get("/api/assessment/tests/");
      setTests(res.data);
    } catch (err) {
      console.error("خطا در بارگذاری آزمون‌ها:", err);
    }
  };

  const loadContents = async () => {
    try {
      const res = await api.get("/api/learning/recommended/");
      setContents(res.data);
    } catch (err) {
      console.error("خطا در بارگذاری محتواها:", err);
    }
  };

  const handleAddQuestionToForm = () => {
    setCurrentQuestion({
      text: "",
      question_type: "mcq",
      order: testForm.questions.length,
      choices: [
        { text: "", is_correct: false, score: 0 },
        { text: "", is_correct: false, score: 0 },
      ],
    });
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion) return;
    if (currentQuestion.text.trim() === "") {
      setError("متن سوال را وارد کنید");
      return;
    }
    if (currentQuestion.question_type === "mcq" && currentQuestion.choices.length < 2) {
      setError("حداقل ۲ گزینه برای سوال چندگزینه‌ای لازم است");
      return;
    }
    setTestForm({
      ...testForm,
      questions: [...testForm.questions, currentQuestion],
    });
    setCurrentQuestion(null);
    setError(null);
  };

  const handleRemoveQuestion = (index: number) => {
    setTestForm({
      ...testForm,
      questions: testForm.questions.filter((_, i) => i !== index),
    });
  };

  const handleChoiceChange = (index: number, field: string, value: any) => {
    if (!currentQuestion) return;
    const newChoices = [...currentQuestion.choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    setCurrentQuestion({ ...currentQuestion, choices: newChoices });
  };

  const handleAddChoice = () => {
    if (!currentQuestion) return;
    setCurrentQuestion({
      ...currentQuestion,
      choices: [
        ...currentQuestion.choices,
        { text: "", is_correct: false, score: 0 },
      ],
    });
  };

  const handleTestSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // اعتبارسنجی آزمون تعیین سطح
    if (testForm.is_placement_test) {
      // برای آزمون تعیین سطح، بررسی‌های خاص
      if (testForm.questions.length < 5) {
        setError("آزمون تعیین سطح باید حداقل ۵ سوال داشته باشد");
        setLoading(false);
        return;
      }
      
      // بررسی سطح برای آزمون تعیین سطح
      if (testForm.min_level !== 1 || testForm.max_level !== 10) {
        setError("آزمون تعیین سطح باید سطح ۱ تا ۱۰ باشد");
        setLoading(false);
        return;
      }
    }
    
    try {
      // فیلتر کردن choices خالی و سوالات بدون متن
      const cleanedQuestions = testForm.questions
        .filter(q => q.text.trim() !== "")
        .map(q => ({
          ...q,
          choices: q.question_type === "mcq" 
            ? q.choices.filter(c => c.text.trim() !== "")
            : []
        }))
        .filter(q => {
          if (q.question_type === "mcq") {
            return q.choices.length >= 2;
          }
          return true;
        });
      
      // اگر هیچ سوال معتبری نداریم
      if (cleanedQuestions.length === 0) {
        setError("حداقل یک سوال معتبر وارد کنید");
        setLoading(false);
        return;
      }
      
      // ایجاد payload برای ارسال
      const payload = {
        title: testForm.title,
        description: testForm.description,
        min_level: testForm.min_level,
        max_level: testForm.max_level,
        is_active: testForm.is_active,
        is_placement_test: testForm.is_placement_test,
        questions: cleanedQuestions,
      };
      
      console.log("ارسال آزمون:", payload);
      
      const response = await api.post("/api/assessment/tests/create/", payload);
      
      alert(testForm.is_placement_test ? 
        "✅ آزمون تعیین سطح با موفقیت ایجاد شد" : 
        "✅ آزمون عادی با موفقیت ایجاد شد"
      );
      
      // ریست فرم
      setShowTestForm(false);
      setTestForm({
        title: "",
        description: "",
        min_level: 1,
        max_level: 10,
        is_active: true,
        is_placement_test: false,
        questions: [],
      });
      setCurrentQuestion(null);
      
      // بارگذاری مجدد لیست آزمون‌ها
      await loadTests();
      
    } catch (err: any) {
      console.error("Error creating test:", err);
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.error ||
                      err.response?.data?.non_field_errors?.[0] ||
                      err.response?.data?.is_placement_test?.[0] ||
                      "خطا در ساخت آزمون";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleContentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!contentForm.title.trim()) {
      setError("عنوان محتوا را وارد کنید");
      setLoading(false);
      return;
    }
    
    if (contentForm.min_level > contentForm.max_level) {
      setError("حداقل سطح نمی‌تواند بیشتر از حداکثر سطح باشد");
      setLoading(false);
      return;
    }
    
    try {
      await api.post("/api/learning/content/", contentForm);
      setShowContentForm(false);
      setContentForm({
        title: "",
        description: "",
        content_type: "text",
        body: "",
        min_level: 1,
        max_level: 10,
        is_active: true,
      });
      await loadContents();
    } catch (err: any) {
      console.error("Error creating content:", err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.content_type?.[0] ||
                          err.response?.data?.title?.[0] ||
                          err.response?.data?.non_field_errors?.[0] ||
                          "خطا در ساخت محتوا";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>پنل استاد</h2>
      <div className="tabs" style={{ marginBottom: "20px" }}>
        <button
          className={activeTab === "tests" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("tests")}
        >
          آزمون‌ها
        </button>
        <button
          className={activeTab === "content" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("content")}
        >
          محتواهای آموزشی
        </button>
      </div>

      {error && (
        <div className="error" style={{
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

      {activeTab === "tests" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <button
              className="btn-primary"
              onClick={() => {
                setShowTestForm(!showTestForm);
                if (showTestForm) {
                  setCurrentQuestion(null);
                  setTestForm({
                    title: "",
                    description: "",
                    min_level: 1,
                    max_level: 10,
                    is_active: true,
                    is_placement_test: false,
                    questions: [],
                  });
                  setError(null);
                }
              }}
            >
              {showTestForm ? "انصراف" : "ساخت آزمون جدید"}
            </button>
          </div>

          {showTestForm && (
            <form onSubmit={handleTestSubmit} className="card" style={{ 
              marginBottom: "20px", 
              padding: "20px",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              backgroundColor: "#fff"
            }}>
              <h3 style={{ marginBottom: "20px", color: "#333" }}>
                {testForm.is_placement_test ? "ساخت آزمون تعیین سطح" : "ساخت آزمون جدید"}
              </h3>
              
              <label style={{ display: "block", marginBottom: "15px" }}>
                عنوان آزمون
                <input
                  value={testForm.title}
                  onChange={(e) =>
                    setTestForm({ ...testForm, title: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    border: "1px solid #ced4da",
                    borderRadius: "4px"
                  }}
                  placeholder="مثال: آزمون سواد رسانه‌ای مقدماتی"
                />
              </label>
              
              <label style={{ display: "block", marginBottom: "15px" }}>
                توضیحات
                <textarea
                  value={testForm.description}
                  onChange={(e) =>
                    setTestForm({ ...testForm, description: e.target.value })
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    border: "1px solid #ced4da",
                    borderRadius: "4px"
                  }}
                  placeholder="توضیح کوتاه درباره آزمون..."
                />
              </label>
              
              <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <label style={{ flex: 1 }}>
                  حداقل سطح
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={testForm.min_level}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setTestForm({
                        ...testForm,
                        min_level: testForm.is_placement_test ? 1 : value,
                      });
                    }}
                    required
                    disabled={testForm.is_placement_test}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginTop: "5px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      backgroundColor: testForm.is_placement_test ? "#f8f9fa" : "#fff"
                    }}
                  />
                </label>
                <label style={{ flex: 1 }}>
                  حداکثر سطح
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={testForm.max_level}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setTestForm({
                        ...testForm,
                        max_level: testForm.is_placement_test ? 10 : value,
                      });
                    }}
                    required
                    disabled={testForm.is_placement_test}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginTop: "5px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      backgroundColor: testForm.is_placement_test ? "#f8f9fa" : "#fff"
                    }}
                  />
                </label>
              </div>
              
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <input
                    type="checkbox"
                    checked={testForm.is_active}
                    onChange={(e) =>
                      setTestForm({ ...testForm, is_active: e.target.checked })
                    }
                    style={{ margin: 0 }}
                  />
                  <span>فعال</span>
                </label>
                
                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <input
                    type="checkbox"
                    checked={testForm.is_placement_test}
                    onChange={(e) => {
                      const isPlacement = e.target.checked;
                      setTestForm({ 
                        ...testForm, 
                        is_placement_test: isPlacement,
                        min_level: isPlacement ? 1 : testForm.min_level,
                        max_level: isPlacement ? 10 : testForm.max_level,
                      });
                    }}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontWeight: "bold", color: testForm.is_placement_test ? "#0d6efd" : "#333" }}>
                    آزمون تعیین سطح اولیه
                  </span>
                </label>
                
                {testForm.is_placement_test && (
                  <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '5px',
                    padding: '10px',
                    margin: '10px 0',
                    fontSize: '14px',
                    color: '#856404'
                  }}>
                    ⚠️ <strong>توجه:</strong> این آزمون برای تعیین سطح اولیه دانش‌آموزان استفاده می‌شود.
                    <br/>
                    • سطح به صورت خودکار ۱ تا ۱۰ تنظیم شد.
                    <br/>
                    • حداقل ۵ سوال نیاز است.
                    <br/>
                    • هر دانش‌آموز فقط یک بار می‌تواند این آزمون را بدهد.
                  </div>
                )}
              </div>

              <div style={{ marginTop: "20px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
                <h4 style={{ marginBottom: "15px" }}>
                  سوالات ({testForm.questions.length})
                  {testForm.is_placement_test && testForm.questions.length < 5 && (
                    <span style={{ color: "#dc3545", fontSize: "14px", marginLeft: "10px" }}>
                      (حداقل ۵ سوال نیاز است)
                    </span>
                  )}
                </h4>
                
                {testForm.questions.map((q, qIndex) => (
                  <div key={qIndex} className="card" style={{ 
                    marginBottom: "10px", 
                    backgroundColor: "#f8f9fa",
                    padding: "15px",
                    border: "1px solid #e9ecef",
                    borderRadius: "6px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: "#495057" }}>سوال {qIndex + 1}:</strong> {q.text}
                        <p style={{ marginTop: "5px", fontSize: "14px", color: "#6c757d" }}>
                          نوع: {q.question_type === "mcq" ? "چندگزینه‌ای" : "متنی"} | 
                          ترتیب: {q.order} | 
                          گزینه‌ها: {q.choices.length}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIndex)}
                        className="btn-secondary"
                        style={{ 
                          marginLeft: "10px",
                          padding: "5px 10px",
                          fontSize: "14px",
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

                {!currentQuestion ? (
                  <button
                    type="button"
                    onClick={handleAddQuestionToForm}
                    className="btn-secondary"
                    style={{ 
                      marginTop: "10px",
                      padding: "10px 15px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    + افزودن سوال
                  </button>
                ) : (
                  <div className="card" style={{ 
                    marginTop: "10px", 
                    backgroundColor: "#fff",
                    padding: "20px",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px"
                  }}>
                    <h5 style={{ marginBottom: "15px", color: "#495057" }}>سوال جدید</h5>
                    <label style={{ display: "block", marginBottom: "15px" }}>
                      متن سوال
                      <textarea
                        value={currentQuestion.text}
                        onChange={(e) =>
                          setCurrentQuestion({ ...currentQuestion, text: e.target.value })
                        }
                        rows={3}
                        required
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginTop: "5px",
                          border: "1px solid #ced4da",
                          borderRadius: "4px"
                        }}
                        placeholder="متن سوال را وارد کنید..."
                      />
                    </label>
                    <label style={{ display: "block", marginBottom: "15px" }}>
                      نوع سوال
                      <select
                        value={currentQuestion.question_type}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            question_type: e.target.value as "mcq" | "text",
                            choices: e.target.value === "text" ? [] : currentQuestion.choices
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginTop: "5px",
                          border: "1px solid #ced4da",
                          borderRadius: "4px"
                        }}
                      >
                        <option value="mcq">چندگزینه‌ای</option>
                        <option value="text">متنی</option>
                      </select>
                    </label>
                    <label style={{ display: "block", marginBottom: "15px" }}>
                      ترتیب
                      <input
                        type="number"
                        min="0"
                        value={currentQuestion.order}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginTop: "5px",
                          border: "1px solid #ced4da",
                          borderRadius: "4px"
                        }}
                      />
                    </label>

                    {currentQuestion.question_type === "mcq" && (
                      <div style={{ marginTop: "15px" }}>
                        <h6 style={{ marginBottom: "10px", color: "#6c757d" }}>گزینه‌ها</h6>
                        {currentQuestion.choices.map((choice, cIndex) => (
                          <div key={cIndex} style={{ 
                            marginBottom: "10px", 
                            padding: "15px", 
                            backgroundColor: choice.is_correct ? "#d4edda" : "#f8f9fa", 
                            borderRadius: "4px",
                            border: choice.is_correct ? "1px solid #c3e6cb" : "1px solid #e9ecef"
                          }}>
                            <label style={{ display: "block", marginBottom: "5px" }}>
                              متن گزینه {cIndex + 1}
                              <input
                                value={choice.text}
                                onChange={(e) =>
                                  handleChoiceChange(cIndex, "text", e.target.value)
                                }
                                required
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  marginTop: "5px",
                                  border: "1px solid #ced4da",
                                  borderRadius: "4px"
                                }}
                                placeholder="متن گزینه را وارد کنید..."
                              />
                            </label>
                            <div style={{ display: "flex", gap: "15px", marginTop: "10px", alignItems: "center" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <input
                                  type="checkbox"
                                  checked={choice.is_correct}
                                  onChange={(e) =>
                                    handleChoiceChange(cIndex, "is_correct", e.target.checked)
                                  }
                                />
                                <span style={{ color: choice.is_correct ? "#28a745" : "#6c757d", fontWeight: choice.is_correct ? "bold" : "normal" }}>
                                  پاسخ صحیح
                                </span>
                              </label>
                              <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <span>امتیاز:</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="10"
                                  value={choice.score}
                                  onChange={(e) =>
                                    handleChoiceChange(
                                      cIndex,
                                      "score",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: "80px",
                                    padding: "4px 8px",
                                    border: "1px solid #ced4da",
                                    borderRadius: "4px"
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddChoice}
                          className="btn-secondary"
                          style={{ 
                            marginTop: "10px",
                            padding: "8px 12px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        >
                          + افزودن گزینه
                        </button>
                      </div>
                    )}

                    <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={handleSaveQuestion}
                        className="btn-primary"
                        style={{
                          padding: "10px 15px",
                          backgroundColor: "#0d6efd",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        ذخیره سوال
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentQuestion(null)}
                        className="btn-secondary"
                        style={{
                          padding: "10px 15px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
                style={{ 
                  marginTop: "20px",
                  padding: "12px 20px",
                  backgroundColor: loading ? "#6c757d" : "#0d6efd",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                {loading ? "در حال ساخت..." : testForm.is_placement_test ? "ساخت آزمون تعیین سطح" : "ساخت آزمون"}
              </button>
            </form>
          )}

          <div className="grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            marginTop: "20px"
          }}>
            {tests.map((test) => (
              <div key={test.id} className="card" style={{
                padding: "20px",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                backgroundColor: "#fff"
              }}>
                <h3 style={{ marginBottom: "10px", color: "#333" }}>{test.title}</h3>
                {test.is_placement_test && (
                  <div style={{
                    backgroundColor: "#d1ecf1",
                    color: "#0c5460",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    marginBottom: "10px",
                    display: "inline-block"
                  }}>
                    📊 آزمون تعیین سطح
                  </div>
                )}
                <p style={{ marginBottom: "10px", color: "#6c757d" }}>
                  {test.description || "بدون توضیحات"}
                </p>
                <p style={{ marginBottom: "5px", fontSize: "14px" }}>
                  <strong>سطح:</strong> {test.min_level} تا {test.max_level}
                </p>
                <p style={{ marginBottom: "15px", fontSize: "14px" }}>
                  <strong>وضعیت:</strong> 
                  <span style={{ color: test.is_active ? "#28a745" : "#dc3545", marginLeft: "5px" }}>
                    {test.is_active ? "فعال" : "غیرفعال"}
                  </span>
                </p>
                <Link 
                  to={`/teacher/tests/${test.id}`} 
                  className="btn-secondary"
                  style={{
                    display: "inline-block",
                    padding: "8px 15px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                >
                  مشاهده و افزودن سوال
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "content" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <button
              className="btn-primary"
              onClick={() => setShowContentForm(!showContentForm)}
              style={{
                padding: "10px 15px",
                backgroundColor: "#0d6efd",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              {showContentForm ? "انصراف" : "ساخت محتوای جدید"}
            </button>
          </div>

          {showContentForm && (
            <form
              onSubmit={handleContentSubmit}
              className="card"
              style={{ 
                marginBottom: "20px", 
                padding: "20px",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                backgroundColor: "#fff"
              }}
            >
              <h3 style={{ marginBottom: "20px", color: "#333" }}>ساخت محتوای آموزشی جدید</h3>
              <label style={{ display: "block", marginBottom: "15px" }}>
                عنوان
                <input
                  value={contentForm.title}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, title: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    border: "1px solid #ced4da",
                    borderRadius: "4px"
                  }}
                />
              </label>
              <label style={{ display: "block", marginBottom: "15px" }}>
                توضیحات
                <textarea
                  value={contentForm.description}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    border: "1px solid #ced4da",
                    borderRadius: "4px"
                  }}
                />
              </label>
              <label style={{ display: "block", marginBottom: "15px" }}>
                نوع محتوا
                <select
                  value={contentForm.content_type}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      content_type: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    border: "1px solid #ced4da",
                    borderRadius: "4px"
                  }}
                >
                  <option value="text">متن</option>
                  <option value="image">تصویر</option>
                  <option value="video">ویدیو</option>
                  <option value="scenario">سناریو</option>
                </select>
              </label>
              <label style={{ display: "block", marginBottom: "15px" }}>
                محتوا
                <textarea
                  value={contentForm.body}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, body: e.target.value })
                  }
                  rows={5}
                  placeholder="برای متن: HTML، برای تصویر/ویدیو: URL، برای سناریو: JSON"
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    border: "1px solid #ced4da",
                    borderRadius: "4px"
                  }}
                />
              </label>
              <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <label style={{ flex: 1 }}>
                  حداقل سطح
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={contentForm.min_level}
                    onChange={(e) =>
                      setContentForm({
                        ...contentForm,
                        min_level: parseInt(e.target.value),
                      })
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginTop: "5px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px"
                    }}
                  />
                </label>
                <label style={{ flex: 1 }}>
                  حداکثر سطح
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={contentForm.max_level}
                    onChange={(e) =>
                      setContentForm({
                        ...contentForm,
                        max_level: parseInt(e.target.value),
                      })
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginTop: "5px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px"
                    }}
                  />
                </label>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <input
                  type="checkbox"
                  checked={contentForm.is_active}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      is_active: e.target.checked,
                    })
                  }
                  style={{ margin: 0 }}
                />
                <span>فعال</span>
              </label>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
                style={{
                  padding: "12px 20px",
                  backgroundColor: loading ? "#6c757d" : "#0d6efd",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                {loading ? "در حال ساخت..." : "ساخت محتوا"}
              </button>
            </form>
          )}

          <div className="grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px"
          }}>
            {contents.map((content) => (
              <div key={content.id} className="card" style={{
                padding: "20px",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                backgroundColor: "#fff"
              }}>
                <h3 style={{ marginBottom: "10px", color: "#333" }}>{content.title}</h3>
                <p style={{ marginBottom: "10px", color: "#6c757d" }}>
                  {content.description || "بدون توضیحات"}
                </p>
                <p style={{ marginBottom: "5px", fontSize: "14px" }}>
                  <strong>نوع:</strong> {content.content_type}
                </p>
                <p style={{ marginBottom: "5px", fontSize: "14px" }}>
                  <strong>سطح:</strong> {content.min_level} تا {content.max_level}
                </p>
                <p style={{ marginBottom: "15px", fontSize: "14px" }}>
                  <strong>وضعیت:</strong> 
                  <span style={{ color: content.is_active ? "#28a745" : "#dc3545", marginLeft: "5px" }}>
                    {content.is_active ? "فعال" : "غیرفعال"}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}