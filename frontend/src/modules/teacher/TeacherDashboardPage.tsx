import { FormEvent, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";

// Interfaces
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
  body: string;
  min_level: number;
  max_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TestExtended {
  id: number;
  title: string;
  description: string;
  min_level: number;
  max_level: number;
  is_active: boolean;
  is_placement_test: boolean;
  total_questions: number;
  passing_score: number;
  time_limit_minutes: number;
  questions_count?: number;
  sessions_count?: number;
  created_at: string;
  updated_at: string;
}


export default function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState<"tests" | "create-content" | "manage-content">("tests");
  const [tests, setTests] = useState<Test[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [showContentForm, setShowContentForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manageContentLoading, setManageContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // فرم‌ها
  const [contentForm, setContentForm] = useState({
    title: "",
    description: "",
    content_type: "text",
    body: "",
    min_level: 1,
    max_level: 10,
    is_active: true,
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    content_type: "text",
    body: "",
    min_level: 1,
    max_level: 10,
    is_active: true,
  });
  const [allTests, setAllTests] = useState<TestExtended[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showPlacementForm, setShowPlacementForm] = useState(false);
  const [testForm, setTestForm] = useState({
   title: "",
   description: "",
   min_level: 1,
   max_level: 10,
   is_active: true,
   is_placement_test: false,
   total_questions: 10,
   passing_score: 70,
   time_limit_minutes: 60,
  });


  

  
  // بارگذاری داده‌ها
  useEffect(() => {
    if (activeTab === "tests") {
      loadAllTests();
    } else if (activeTab === "manage-content") {
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
      setManageContentLoading(true);
      const res = await api.get("/api/learning/teacher/contents/");
      setContents(res.data);
    } catch (err) {
      console.error("خطا در بارگذاری محتواها:", err);
      setError("خطا در بارگذاری محتواها");
    } finally {
      setManageContentLoading(false);
    }
  }; 
  const loadAllTests = async () => {
  try {
    setTestsLoading(true);
    const res = await api.get("/api/assessment/teacher/tests/all/");
    setAllTests(res.data);
  } catch (err) {
    console.error("خطا در بارگذاری آزمون‌ها:", err);
  } finally {
    setTestsLoading(false);
  }
};

const handleCreateTest = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  
  if (!testForm.title.trim()) {
    setError("عنوان آزمون را وارد کنید");
    setLoading(false);
    return;
  }
  
  if (testForm.min_level > testForm.max_level) {
    setError("حداقل سطح نمی‌تواند بیشتر از حداکثر سطح باشد");
    setLoading(false);
    return;
  }
  
  try {
    await api.post("/api/assessment/teacher/tests/create/", testForm);
    alert("✅ آزمون با موفقیت ایجاد شد");
    setShowTestForm(false);
    setTestForm({
      title: "",
      description: "",
      min_level: 1,
      max_level: 10,
      is_active: true,
      is_placement_test: false,
      total_questions: 10,
      passing_score: 70,
      time_limit_minutes: 60,
    });
    await loadAllTests();
  } catch (err: any) {
    console.error("Error creating test:", err);
    setError(err.response?.data?.detail || "خطا در ساخت آزمون");
  } finally {
    setLoading(false);
  }
};

const handleCreatePlacementTest = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  
  if (!testForm.title.trim()) {
    setError("عنوان آزمون تعیین سطح را وارد کنید");
    setLoading(false);
    return;
  }
  
  try {
    await api.post("/api/assessment/teacher/tests/placement/create/", {
      ...testForm,
      is_placement_test: true
    });
    alert("✅ آزمون تعیین سطح با موفقیت ایجاد شد");
    setShowPlacementForm(false);
    setTestForm({
      title: "",
      description: "",
      min_level: 1,
      max_level: 10,
      is_active: true,
      is_placement_test: false,
      total_questions: 10,
      passing_score: 70,
      time_limit_minutes: 60,
    });
    await loadAllTests();
  } catch (err: any) {
    console.error("Error creating placement test:", err);
    setError(err.response?.data?.detail || "خطا در ساخت آزمون تعیین سطح");
  } finally {
    setLoading(false);
  }
};

const handleDeleteTest = async (testId: number) => {
  if (!window.confirm("آیا مطمئن هستید که می‌خواهید این آزمون را حذف کنید؟")) {
    return;
  }

  try {
    await api.delete(`/api/assessment/teacher/tests/${testId}/delete/`);
    alert("✅ آزمون با موفقیت حذف شد");
    await loadAllTests();
  } catch (err) {
    console.error("خطا در حذف آزمون:", err);
    alert("خطا در حذف آزمون");
  }
}

  // مدیریت محتوا
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
      await api.post("/api/learning/content/create/", contentForm);
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
      if (activeTab === "manage-content") {
        await loadContents();
      }
      alert("✅ محتوا با موفقیت ایجاد شد");
    } catch (err: any) {
      console.error("Error creating content:", err);
      setError(err.response?.data?.detail || "خطا در ساخت محتوا");
    } finally {
      setLoading(false);
    }
  };

  const handleEditContent = (content: Content) => {
    setEditingContent(content);
    setEditForm({
      title: content.title,
      description: content.description,
      content_type: content.content_type,
      body: content.body,
      min_level: content.min_level,
      max_level: content.max_level,
      is_active: content.is_active,
    });
    setShowEditModal(true);
  };

  const handleUpdateContent = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingContent) return;

    setLoading(true);
    setError(null);

    try {
      await api.put(`/api/learning/content/${editingContent.id}/update/`, editForm);
      alert("✅ محتوا با موفقیت به‌روزرسانی شد");
      setShowEditModal(false);
      setEditingContent(null);
      await loadContents();
    } catch (err: any) {
      console.error("خطا در به‌روزرسانی محتوا:", err);
      setError(err.response?.data?.detail || "خطا در به‌روزرسانی محتوا");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (contentId: number) => {
    if (!window.confirm("آیا مطمئن هستید که می‌خواهید این محتوا را حذف کنید؟")) {
      return;
    }

    try {
      await api.delete(`/api/learning/content/${contentId}/delete/`);
      alert("✅ محتوا با موفقیت حذف شد");
      await loadContents();
    } catch (err) {
      console.error("خطا در حذف محتوا:", err);
      alert("خطا در حذف محتوا");
    }
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const getContentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      text: "📝 متن",
      image: "🖼️ تصویر",
      video: "🎬 ویدیو",
      scenario: "🎭 سناریو",
    };
    return types[type] || type;
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>پنل استاد</h2>
      
      {/* تب‌ها */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "tests" ? "#0d6efd" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}
          onClick={() => setActiveTab("tests")}
        >
          آزمون‌ها
        </button>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "create-content" ? "#0d6efd" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}
          onClick={() => setActiveTab("create-content")}
        >
          ایجاد محتوای جدید
        </button>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "manage-content" ? "#0d6efd" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}
          onClick={() => setActiveTab("manage-content")}
        >
          مدیریت محتواها
        </button>
      </div>

      {/* خطا */}
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

      {/* تب ایجاد محتوا */}
      {activeTab === "create-content" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setShowContentForm(!showContentForm)}
              style={{
                padding: "10px 20px",
                backgroundColor: showContentForm ? "#dc3545" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              {showContentForm ? "✖ انصراف" : "➕ ساخت محتوای جدید"}
            </button>
          </div>

          {showContentForm && (
            <form onSubmit={handleContentSubmit} style={{ 
              padding: "25px",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              backgroundColor: "#fff"
            }}>
              <h3 style={{ marginBottom: "20px", color: "#333" }}>ساخت محتوای آموزشی جدید</h3>
              
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
                  عنوان *
                  <input
                    value={contentForm.title}
                    onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px"
                    }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
                  توضیحات
                  <textarea
                    value={contentForm.description}
                    onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px"
                    }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
                  نوع محتوا
                  <select
                    value={contentForm.content_type}
                    onChange={(e) => setContentForm({ ...contentForm, content_type: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
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
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
                  محتوا
                  <textarea
                    value={contentForm.body}
                    onChange={(e) => setContentForm({ ...contentForm, body: e.target.value })}
                    rows={5}
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px"
                    }}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
                    حداقل سطح
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={contentForm.min_level}
                      onChange={(e) => setContentForm({ ...contentForm, min_level: parseInt(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "5px",
                        border: "1px solid #ced4da",
                        borderRadius: "4px"
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
                    حداکثر سطح
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={contentForm.max_level}
                      onChange={(e) => setContentForm({ ...contentForm, max_level: parseInt(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "5px",
                        border: "1px solid #ced4da",
                        borderRadius: "4px"
                      }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    checked={contentForm.is_active}
                    onChange={(e) => setContentForm({ ...contentForm, is_active: e.target.checked })}
                  />
                  <span>فعال</span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  padding: "12px 25px",
                  backgroundColor: loading ? "#6c757d" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  width: "100%"
                }}
              >
                {loading ? "در حال ساخت..." : "💾 ساخت محتوا"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* تب مدیریت محتواها */}
      {activeTab === "manage-content" && (
        <div>
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#333" }}>مدیریت محتواهای آموزشی</h3>
            <button
              onClick={() => loadContents()}
              disabled={manageContentLoading}
              style={{
                padding: "8px 15px",
                backgroundColor: manageContentLoading ? "#6c757d" : "#0d6efd",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: manageContentLoading ? "not-allowed" : "pointer"
              }}
            >
              {manageContentLoading ? "در حال بارگذاری..." : "🔄 بارگذاری مجدد"}
            </button>
          </div>

          {manageContentLoading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>در حال بارگذاری محتواها...</p>
            </div>
          ) : contents.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px 40px",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
              border: "2px dashed #dee2e6"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "20px", color: "#6c757d" }}>📚</div>
              <h3 style={{ color: "#6c757d", marginBottom: "10px" }}>هنوز محتوایی ایجاد نکرده‌اید</h3>
              <p style={{ color: "#6c757d" }}>
                برای ایجاد محتوای جدید، به تب "ایجاد محتوای جدید" بروید.
              </p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "20px"
            }}>
              {contents.map((content) => (
                <div key={content.id} style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "20px",
                  border: `2px solid ${content.is_active ? "#28a745" : "#dc3545"}`,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <div style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <h3 style={{ margin: 0, color: "#333", fontSize: "18px" }}>
                        {content.title}
                      </h3>
                      <span style={{
                        backgroundColor: content.is_active ? "#28a745" : "#dc3545",
                        color: "white",
                        padding: "3px 10px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        {content.is_active ? "فعال" : "غیرفعال"}
                      </span>
                    </div>
                    <p style={{ color: "#6c757d", fontSize: "14px", lineHeight: "1.5", marginBottom: "10px" }}>
                      {content.description || "بدون توضیحات"}
                    </p>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                      <span style={{
                        backgroundColor: "#e7f3ff",
                        color: "#084298",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "13px"
                      }}>
                        {getContentTypeLabel(content.content_type)}
                      </span>
                      <span style={{
                        backgroundColor: "#f8f9fa",
                        color: "#495057",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "13px"
                      }}>
                        سطح {content.min_level} - {content.max_level}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#868e96" }}>
                      <div>آخرین ویرایش: {formatDate(content.updated_at)}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleEditContent(content)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        backgroundColor: "#0d6efd",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      ✏️ ویرایش
                    </button>
                    <button
                      onClick={() => handleDeleteContent(content.id)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "tests" && (
  <div>
    <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
      <button
        onClick={() => {
          setShowTestForm(!showTestForm);
          setShowPlacementForm(false);
        }}
        style={{
          padding: "10px 20px",
          backgroundColor: showTestForm ? "#dc3545" : "#28a745",
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
        {showTestForm ? "✖ انصراف" : "➕ ساخت آزمون جدید"}
      </button>
      
      <button
        onClick={() => {
          setShowPlacementForm(!showPlacementForm);
          setShowTestForm(false);
        }}
        style={{
          padding: "10px 20px",
          backgroundColor: showPlacementForm ? "#dc3545" : "#17a2b8",
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
        {showPlacementForm ? "✖ انصراف" : "📊 ساخت آزمون تعیین سطح"}
      </button>
    </div>

    {/* فرم ایجاد آزمون عادی */}
    {showTestForm && (
      <form onSubmit={handleCreateTest} style={{ 
        padding: "25px",
        border: "1px solid #dee2e6",
        borderRadius: "8px",
        backgroundColor: "#fff",
        marginBottom: "30px"
      }}>
        <h3 style={{ marginBottom: "20px", color: "#333" }}>ساخت آزمون جدید</h3>
        
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
            عنوان آزمون *
            <input
              value={testForm.title}
              onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                border: "1px solid #ced4da",
                borderRadius: "4px"
              }}
              placeholder="مثلاً: آزمون سواد رسانه‌ای سطح ۱"
            />
          </label>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
            توضیحات آزمون
            <textarea
              value={testForm.description}
              onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
              rows={3}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                border: "1px solid #ced4da",
                borderRadius: "4px"
              }}
              placeholder="توضیح کوتاه درباره محتوای آزمون"
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
              حداقل سطح
              <input
                type="number"
                min="1"
                max="10"
                value={testForm.min_level}
                onChange={(e) => setTestForm({ ...testForm, min_level: parseInt(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px"
                }}
              />
            </label>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
              حداکثر سطح
              <input
                type="number"
                min="1"
                max="10"
                value={testForm.max_level}
                onChange={(e) => setTestForm({ ...testForm, max_level: parseInt(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px"
                }}
              />
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
              تعداد سوالات
              <input
                type="number"
                min="1"
                max="100"
                value={testForm.total_questions}
                onChange={(e) => setTestForm({ ...testForm, total_questions: parseInt(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px"
                }}
              />
            </label>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
              نمره قبولی (درصد)
              <input
                type="number"
                min="0"
                max="100"
                value={testForm.passing_score}
                onChange={(e) => setTestForm({ ...testForm, passing_score: parseInt(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px"
                }}
              />
            </label>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
              زمان (دقیقه)
              <input
                type="number"
                min="1"
                max="300"
                value={testForm.time_limit_minutes}
                onChange={(e) => setTestForm({ ...testForm, time_limit_minutes: parseInt(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px"
                }}
              />
            </label>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              checked={testForm.is_active}
              onChange={(e) => setTestForm({ ...testForm, is_active: e.target.checked })}
            />
            <span>فعال</span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: "12px 25px",
            backgroundColor: loading ? "#6c757d" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            width: "100%"
          }}
        >
          {loading ? "در حال ساخت..." : "💾 ساخت آزمون"}
        </button>
      </form>
    )}

    {/* فرم ایجاد آزمون تعیین سطح */}
    {showPlacementForm && (
      <form onSubmit={handleCreatePlacementTest} style={{ 
        padding: "25px",
        border: "2px solid #17a2b8",
        borderRadius: "8px",
        backgroundColor: "#f8f9fa",
        marginBottom: "30px"
      }}>
        <h3 style={{ marginBottom: "20px", color: "#0c5460" }}>
          🎯 ساخت آزمون تعیین سطح
          <span style={{ fontSize: "14px", color: "#6c757d", marginLeft: "10px" }}>
            (برای تعیین سطح اولیه دانش‌آموزان)
          </span>
        </h3>
        
        <div style={{ 
          backgroundColor: "#d1ecf1", 
          color: "#0c5460",
          padding: "15px",
          borderRadius: "6px",
          marginBottom: "20px",
          border: "1px solid #bee5eb"
        }}>
          <strong>نکته:</strong> آزمون تعیین سطح برای ارزیابی اولیه دانش‌آموزان استفاده می‌شود.
          سطح دانش‌آموز بر اساس نمره این آزمون تعیین می‌شود.
        </div>
        
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
            عنوان آزمون تعیین سطح *
            <input
              value={testForm.title}
              onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                border: "1px solid #ced4da",
                borderRadius: "4px"
              }}
              placeholder="مثلاً: آزمون تعیین سطح سواد شناختی"
            />
          </label>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
            توضیحات
            <textarea
              value={testForm.description}
              onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
              rows={3}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                border: "1px solid #ced4da",
                borderRadius: "4px"
              }}
              placeholder="توضیح درباره محتوای آزمون تعیین سطح"
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
              تعداد سوالات
              <input
                type="number"
                min="5"
                max="50"
                value={testForm.total_questions}
                onChange={(e) => setTestForm({ ...testForm, total_questions: parseInt(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px"
                }}
              />
            </label>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
              زمان (دقیقه)
              <input
                type="number"
                min="10"
                max="120"
                value={testForm.time_limit_minutes}
                onChange={(e) => setTestForm({ ...testForm, time_limit_minutes: parseInt(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px"
                }}
              />
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: "12px 25px",
            backgroundColor: loading ? "#6c757d" : "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            width: "100%"
          }}
        >
          {loading ? "در حال ساخت..." : "🎯 ساخت آزمون تعیین سطح"}
        </button>
      </form>
    )}

    {/* نمایش همه آزمون‌ها */}
    {testsLoading ? (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>در حال بارگذاری آزمون‌ها...</p>
      </div>
    ) : allTests.length === 0 ? (
      <div style={{
        textAlign: "center",
        padding: "60px 40px",
        backgroundColor: "#f8f9fa",
        borderRadius: "10px",
        border: "2px dashed #dee2e6"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "20px", color: "#6c757d" }}>📝</div>
        <h3 style={{ color: "#6c757d", marginBottom: "10px" }}>هنوز آزمونی ایجاد نکرده‌اید</h3>
        <p style={{ color: "#6c757d" }}>
          برای ایجاد آزمون جدید، روی دکمه‌های بالا کلیک کنید.
        </p>
      </div>
    ) : (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: "20px",
        marginTop: "20px"
      }}>
        {allTests.map((test) => (
          <div key={test.id} style={{
            padding: "20px",
            border: `2px solid ${test.is_active ? "#28a745" : "#dc3545"}`,
            borderRadius: "8px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            position: "relative"
          }}>
            {test.is_placement_test && (
              <div style={{
                position: "absolute",
                top: "-10px",
                right: "20px",
                backgroundColor: "#17a2b8",
                color: "white",
                padding: "5px 15px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "bold",
                zIndex: 1
              }}>
                📊 آزمون تعیین سطح
              </div>
            )}
            
            <h3 style={{ marginBottom: "10px", color: "#333", fontSize: "18px" }}>
              {test.title}
            </h3>
            
            <p style={{ marginBottom: "10px", color: "#6c757d", fontSize: "15px", minHeight: "60px" }}>
              {test.description || "بدون توضیحات"}
            </p>
            
            <div style={{ marginBottom: "15px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                <span style={{
                  backgroundColor: "#e7f3ff",
                  color: "#084298",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "13px"
                }}>
                  سطح {test.min_level} - {test.max_level}
                </span>
                
                <span style={{
                  backgroundColor: test.is_active ? "#d4edda" : "#f8d7da",
                  color: test.is_active ? "#155724" : "#721c24",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: "bold"
                }}>
                  {test.is_active ? "فعال" : "غیرفعال"}
                </span>
                
                {test.questions_count !== undefined && (
                  <span style={{
                    backgroundColor: "#f8f9fa",
                    color: "#495057",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    fontSize: "13px"
                  }}>
                    📝 {test.questions_count} سوال
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: "13px", color: "#868e96" }}>
                <div>حداقل نمره قبولی: {test.passing_score}%</div>
                <div>زمان: {test.time_limit_minutes} دقیقه</div>
                <div>تعداد سوالات: {test.total_questions}</div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link 
                to={`/teacher/tests/${test.id}`}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#0d6efd",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                  textAlign: "center",
                  display: "inline-block"
                }}
              >
                ✏️ مدیریت سوالات
              </Link>
              
              <button
                onClick={() => handleDeleteTest(test.id)}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                🗑️ حذف آزمون
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}



      {/* مودال ویرایش محتوا */}
      {showEditModal && editingContent && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "30px",
            maxWidth: "600px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <h3 style={{ margin: 0, color: "#333" }}>
                ویرایش محتوا: {editingContent.title}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingContent(null);
                  setError(null);
                }}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateContent}>
              {/* فرم ویرایش مشابه فرم ایجاد */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  عنوان *
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ced4da",
                      borderRadius: "5px"
                    }}
                  />
                </label>
              </div>

              {/* بقیه فیلدهای فرم */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  توضیحات
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ced4da",
                      borderRadius: "5px"
                    }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  نوع محتوا
                  <select
                    value={editForm.content_type}
                    onChange={(e) => setEditForm({ ...editForm, content_type: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ced4da",
                      borderRadius: "5px"
                    }}
                  >
                    <option value="text">متن</option>
                    <option value="image">تصویر</option>
                    <option value="video">ویدیو</option>
                    <option value="scenario">سناریو</option>
                  </select>
                </label>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  محتوا
                  <textarea
                    value={editForm.body}
                    onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                    rows={5}
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ced4da",
                      borderRadius: "5px"
                    }}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                    حداقل سطح
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editForm.min_level}
                      onChange={(e) => setEditForm({ ...editForm, min_level: parseInt(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "5px",
                        border: "1px solid #ced4da",
                        borderRadius: "5px"
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                    حداکثر سطح
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editForm.max_level}
                      onChange={(e) => setEditForm({ ...editForm, max_level: parseInt(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "5px",
                        border: "1px solid #ced4da",
                        borderRadius: "5px"
                      }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  />
                  <span>فعال</span>
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: loading ? "#6c757d" : "#0d6efd",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                >
                  {loading ? "در حال ذخیره..." : "💾 ذخیره تغییرات"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingContent(null);
                  }}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}