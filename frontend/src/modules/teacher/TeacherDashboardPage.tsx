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
    try {
      // اطمینان از اینکه is_placement_test false است (برای آزمون‌های عادی)
      const payload = {
        ...testForm,
        is_placement_test: false,
      };
      await api.post("/api/assessment/tests/create/", payload);
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
      await loadTests();
    } catch (err: any) {
      setError(err.response?.data?.detail || "خطا در ساخت آزمون");
    } finally {
      setLoading(false);
    }
  };

  const handleContentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // اعتبارسنجی اولیه
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

      {error && <div className="error">{error}</div>}

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
                }
              }}
            >
              {showTestForm ? "انصراف" : "ساخت آزمون جدید"}
            </button>
          </div>

          {showTestForm && (
            <form onSubmit={handleTestSubmit} className="card" style={{ marginBottom: "20px" }}>
              <h3>ساخت آزمون جدید</h3>
              <label>
                عنوان آزمون
                <input
                  value={testForm.title}
                  onChange={(e) =>
                    setTestForm({ ...testForm, title: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                توضیحات
                <textarea
                  value={testForm.description}
                  onChange={(e) =>
                    setTestForm({ ...testForm, description: e.target.value })
                  }
                  rows={3}
                />
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <label>
                  حداقل سطح
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={testForm.min_level}
                    onChange={(e) =>
                      setTestForm({
                        ...testForm,
                        min_level: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </label>
                <label>
                  حداکثر سطح
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={testForm.max_level}
                    onChange={(e) =>
                      setTestForm({
                        ...testForm,
                        max_level: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </label>
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={testForm.is_active}
                  onChange={(e) =>
                    setTestForm({ ...testForm, is_active: e.target.checked })
                  }
                />
                فعال
              </label>

              <div style={{ marginTop: "20px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
                <h4>سوالات ({testForm.questions.length})</h4>
                
                {testForm.questions.map((q, qIndex) => (
                  <div key={qIndex} className="card" style={{ marginBottom: "10px", backgroundColor: "#f8f9fa" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1 }}>
                        <strong>سوال {qIndex + 1}:</strong> {q.text}
                        <p style={{ marginTop: "5px", fontSize: "14px", color: "#666" }}>
                          نوع: {q.question_type === "mcq" ? "چندگزینه‌ای" : "متنی"} | 
                          ترتیب: {q.order} | 
                          گزینه‌ها: {q.choices.length}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIndex)}
                        className="btn-secondary"
                        style={{ marginLeft: "10px" }}
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
                    style={{ marginTop: "10px" }}
                  >
                    + افزودن سوال
                  </button>
                ) : (
                  <div className="card" style={{ marginTop: "10px", backgroundColor: "#fff" }}>
                    <h5>سوال جدید</h5>
                    <label>
                      متن سوال
                      <textarea
                        value={currentQuestion.text}
                        onChange={(e) =>
                          setCurrentQuestion({ ...currentQuestion, text: e.target.value })
                        }
                        rows={3}
                        required
                      />
                    </label>
                    <label>
                      نوع سوال
                      <select
                        value={currentQuestion.question_type}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            question_type: e.target.value as "mcq" | "text",
                          })
                        }
                      >
                        <option value="mcq">چندگزینه‌ای</option>
                        <option value="text">متنی</option>
                      </select>
                    </label>
                    <label>
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
                      />
                    </label>

                    {currentQuestion.question_type === "mcq" && (
                      <div style={{ marginTop: "15px" }}>
                        <h6>گزینه‌ها</h6>
                        {currentQuestion.choices.map((choice, cIndex) => (
                          <div key={cIndex} style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                            <label>
                              متن گزینه {cIndex + 1}
                              <input
                                value={choice.text}
                                onChange={(e) =>
                                  handleChoiceChange(cIndex, "text", e.target.value)
                                }
                                required
                                style={{ width: "100%", marginTop: "5px" }}
                              />
                            </label>
                            <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={choice.is_correct}
                                  onChange={(e) =>
                                    handleChoiceChange(cIndex, "is_correct", e.target.checked)
                                  }
                                />
                                پاسخ صحیح
                              </label>
                              <label>
                                امتیاز:
                                <input
                                  type="number"
                                  step="0.1"
                                  value={choice.score}
                                  onChange={(e) =>
                                    handleChoiceChange(
                                      cIndex,
                                      "score",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  style={{ width: "80px", marginLeft: "5px" }}
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddChoice}
                          className="btn-secondary"
                          style={{ marginTop: "10px" }}
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
                      >
                        ذخیره سوال
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentQuestion(null)}
                        className="btn-secondary"
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "20px" }}>
                {loading ? "در حال ساخت..." : "ساخت آزمون"}
              </button>
            </form>
          )}

          <div className="grid">
            {tests.map((test) => (
              <div key={test.id} className="card">
                <h3>{test.title}</h3>
                <p>{test.description || "بدون توضیحات"}</p>
                <p>
                  سطح: {test.min_level} تا {test.max_level}
                </p>
                <p>وضعیت: {test.is_active ? "فعال" : "غیرفعال"}</p>
                <Link to={`/teacher/tests/${test.id}`} className="btn-secondary">
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
            >
              {showContentForm ? "انصراف" : "ساخت محتوای جدید"}
            </button>
          </div>

          {showContentForm && (
            <form
              onSubmit={handleContentSubmit}
              className="card"
              style={{ marginBottom: "20px" }}
            >
              <h3>ساخت محتوای آموزشی جدید</h3>
              <label>
                عنوان
                <input
                  value={contentForm.title}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, title: e.target.value })
                  }
                  required
                />
              </label>
              <label>
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
                />
              </label>
              <label>
                نوع محتوا
                <select
                  value={contentForm.content_type}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      content_type: e.target.value,
                    })
                  }
                >
                  <option value="text">متن</option>
                  <option value="image">تصویر</option>
                  <option value="video">ویدیو</option>
                  <option value="scenario">سناریو</option>
                </select>
              </label>
              <label>
                محتوا
                <textarea
                  value={contentForm.body}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, body: e.target.value })
                  }
                  rows={5}
                  placeholder="برای متن: HTML، برای تصویر/ویدیو: URL، برای سناریو: JSON"
                />
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <label>
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
                  />
                </label>
                <label>
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
                  />
                </label>
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={contentForm.is_active}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      is_active: e.target.checked,
                    })
                  }
                />
                فعال
              </label>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "در حال ساخت..." : "ساخت محتوا"}
              </button>
            </form>
          )}

          <div className="grid">
            {contents.map((content) => (
              <div key={content.id} className="card">
                <h3>{content.title}</h3>
                <p>{content.description || "بدون توضیحات"}</p>
                <p>نوع: {content.content_type}</p>
                <p>
                  سطح: {content.min_level} تا {content.max_level}
                </p>
                <p>وضعیت: {content.is_active ? "فعال" : "غیرفعال"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

