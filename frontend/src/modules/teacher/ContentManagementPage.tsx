// src/modules/teacher/ContentManagementPage.tsx
import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

interface Content {
  id: number;
  title: string;
  description: string;
  content_type: string;
  body: string;
  min_level: number;
  max_level: number;
  difficulty: number;
  is_active: boolean;
  created_at: string;
}

export default function ContentManagementPage() {
  const navigate = useNavigate();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    content_type: "text",
    body: "",
    min_level: 1,
    max_level: 10,
    difficulty: 4,
    is_active: true,
  });

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/adaptive-learning/teacher/contents/");
      setContents(res.data);
    } catch {
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
      difficulty: content.difficulty,
      is_active: content.is_active,
    });
    setShowEditForm(true);
  };

  const handleDelete = async (contentId: number) => {
    if (!confirm("حذف این محتوا؟")) return;

    await api.delete(
      `/api/adaptive-learning/teacher/content/${contentId}/delete/`
    );
    loadContents();
  };

  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingContent) return;

    setFormLoading(true);
    try {
      await api.put(
        `/api/adaptive-learning/teacher/content/${editingContent.id}/update/`,
        editForm
      );
      setShowEditForm(false);
      setEditingContent(null);
      loadContents();
    } catch {
      setError("خطا در به‌روزرسانی محتوا");
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fa-IR");

  if (loading) return <p>در حال بارگذاری...</p>;

  return (
    <div>
      <button onClick={() => navigate("/teacher")}>← بازگشت</button>
      <h2>مدیریت محتواهای آموزشی</h2>

      {error && <div className="error">{error}</div>}

      {showEditForm && editingContent && (
        <form onSubmit={handleUpdateSubmit}>
          <input
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            required
          />
          <textarea
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
          />
          <select
            value={editForm.content_type}
            onChange={(e) =>
              setEditForm({ ...editForm, content_type: e.target.value })
            }
          >
            <option value="text">متن</option>
            <option value="image">تصویر</option>
            <option value="video">ویدیو</option>
            <option value="scenario">سناریو</option>
          </select>

          <button disabled={formLoading}>
            {formLoading ? "..." : "ذخیره"}
          </button>
        </form>
      )}

      <div>
        {contents.map((c) => (
          <div key={c.id}>
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            <small>ایجاد: {formatDate(c.created_at)}</small>
            <div>
              <button onClick={() => handleEdit(c)}>ویرایش</button>
              <button onClick={() => handleDelete(c.id)}>حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
