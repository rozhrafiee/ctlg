import { useState, useEffect, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../utils/api";

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

export default function ContentManagementPage() {
  const navigate = useNavigate();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // فرم ویرایش
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    content_type: "text",
    body: "",
    min_level: 1,
    max_level: 10,
    is_active: true,
  });

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    try {
      setLoading(true);
      // از endpoint جدید استفاده کنید
      const res = await api.get("/api/learning/teacher/contents/");
      setContents(res.data);
    } catch (err) {
      console.error("خطا در بارگذاری محتواها:", err);
      setError("خطا در بارگذاری محتواها");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (content: Content) => {
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
    setShowEditForm(true);
  };

  const handleDelete = async (contentId: number) => {
    if (!window.confirm("آیا مطمئن هستید که می‌خواهید این محتوا را حذف کنید؟")) {
      return;
    }

    try {
      await api.delete(`/api/learning/content/${contentId}/delete/`);
      alert("✅ محتوا با موفقیت حذف شد");
      loadContents(); // بارگذاری مجدد لیست
    } catch (err) {
      console.error("خطا در حذف محتوا:", err);
      alert("خطا در حذف محتوا");
    }
  };

  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingContent) return;

    setFormLoading(true);
    setError(null);

    try {
      await api.put(`/api/learning/content/${editingContent.id}/update/`, editForm);
      alert("✅ محتوا با موفقیت به‌روزرسانی شد");
      setShowEditForm(false);
      setEditingContent(null);
      loadContents(); // بارگذاری مجدد
    } catch (err: any) {
      console.error("خطا در به‌روزرسانی محتوا:", err);
      setError(err.response?.data?.detail || "خطا در به‌روزرسانی محتوا");
    } finally {
      setFormLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div className="spinner"></div>
        <p>در حال بارگذاری محتواها...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <button
          onClick={() => navigate("/teacher")}
          style={{
            padding: "8px 15px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "20px"
          }}
        >
          ← بازگشت به پنل استاد
        </button>
        
        <h2 style={{ color: "#333", marginBottom: "10px" }}>
          مدیریت محتواهای آموزشی
        </h2>
        <p style={{ color: "#666" }}>
          در این صفحه می‌توانید محتواهای آموزشی را مشاهده، ویرایش و حذف کنید.
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "15px",
          borderRadius: "6px",
          marginBottom: "20px",
          border: "1px solid #f5c6cb"
        }}>
          {error}
        </div>
      )}

      {/* فرم ویرایش */}
      {showEditForm && editingContent && (
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
                  setShowEditForm(false);
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

            <form onSubmit={handleUpdateSubmit}>
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
                      borderRadius: "5px",
                      fontSize: "16px"
                    }}
                  />
                </label>
              </div>

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
                      borderRadius: "5px",
                      fontSize: "16px",
                      resize: "vertical"
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
                      borderRadius: "5px",
                      fontSize: "16px"
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
                    placeholder={
                      editForm.content_type === "text" 
                        ? "متن محتوا را وارد کنید..." 
                        : editForm.content_type === "image" || editForm.content_type === "video"
                        ? "URL را وارد کنید..."
                        : "JSON سناریو را وارد کنید..."
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "5px",
                      border: "1px solid #ced4da",
                      borderRadius: "5px",
                      fontSize: "16px",
                      resize: "vertical",
                      fontFamily: editForm.content_type === "scenario" ? "monospace" : "inherit"
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
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "5px",
                        border: "1px solid #ced4da",
                        borderRadius: "5px",
                        fontSize: "16px"
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
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "5px",
                        border: "1px solid #ced4da",
                        borderRadius: "5px",
                        fontSize: "16px"
                      }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span>فعال</span>
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: formLoading ? "#6c757d" : "#0d6efd",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: formLoading ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    fontWeight: "bold"
                  }}
                >
                  {formLoading ? "در حال ذخیره..." : "💾 ذخیره تغییرات"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingContent(null);
                  }}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px"
                  }}
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* لیست محتواها */}
      <div className="grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: "20px"
      }}>
        {contents.length === 0 ? (
          <div style={{
            gridColumn: "1 / -1",
            textAlign: "center",
            padding: "60px 40px",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
            border: "2px dashed #dee2e6"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "20px", color: "#6c757d" }}>📚</div>
            <h3 style={{ color: "#6c757d", marginBottom: "10px" }}>هنوز محتوایی ایجاد نکرده‌اید</h3>
            <p style={{ color: "#6c757d" }}>
              برای ایجاد محتوای جدید، ابتدا به صفحه "محتواهای آموزشی" در پنل استاد بروید.
            </p>
          </div>
        ) : (
          contents.map((content) => (
            <div key={content.id} style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              border: `2px solid ${content.is_active ? "#28a745" : "#dc3545"}`,
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              height: "100%"
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
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
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
                  <div>ایجاد شده در: {formatDate(content.created_at)}</div>
                </div>
              </div>

              <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleEdit(content)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    backgroundColor: "#0d6efd",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  ✏️ ویرایش
                </button>
                <button
                  onClick={() => handleDelete(content.id)}
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
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}