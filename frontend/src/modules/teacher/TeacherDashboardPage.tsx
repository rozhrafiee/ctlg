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
  });

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

  const handleTestSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/assessment/tests/create/", testForm);
      setShowTestForm(false);
      setTestForm({
        title: "",
        description: "",
        min_level: 1,
        max_level: 10,
        is_active: true,
      });
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
      setError(err.response?.data?.detail || "خطا در ساخت محتوا");
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
              onClick={() => setShowTestForm(!showTestForm)}
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
              <button type="submit" className="btn-primary" disabled={loading}>
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

