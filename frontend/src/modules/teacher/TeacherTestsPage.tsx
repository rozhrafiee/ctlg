// src/modules/teacher/TeacherTestsPage.tsx
import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";

interface Test {
  id: number;
  title: string;
  description: string;
  is_active: boolean;
  is_placement_test: boolean;
}

export default function TeacherTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    min_level: 1,
    max_level: 10,
    is_active: true,
    total_questions: 10,
    passing_score: 70,
    time_limit_minutes: 30,
  });

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/assessment/teacher/tests/all/");
      setTests(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      setError("خطا در بارگذاری آزمون‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent, isPlacement = false) => {
    e.preventDefault();
    try {
      await api.post(
        isPlacement
          ? "/api/assessment/teacher/tests/placement/create/"
          : "/api/assessment/teacher/tests/create/",
        { ...form }
      );
      setForm({
        title: "",
        description: "",
        min_level: 1,
        max_level: 10,
        is_active: true,
        total_questions: 10,
        passing_score: 70,
        time_limit_minutes: 30,
      });
      loadTests();
    } catch {
      setError("خطا در ایجاد آزمون");
    }
  };

  if (loading) return <p>در حال بارگذاری...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>📝 مدیریت آزمون‌ها</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={(e) => handleCreate(e, false)} className="card">
        <h3>ایجاد آزمون جدید</h3>
        <input
          placeholder="عنوان"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="توضیحات"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit">ساخت آزمون</button>
        <button type="button" onClick={(e) => handleCreate(e as any, true)}>
          ساخت آزمون تعیین سطح
        </button>
      </form>

      <div style={{ marginTop: 30 }}>
        {tests.map((t) => (
          <div key={t.id} className="card">
            <h4>{t.title}</h4>
            <p>{t.description}</p>
            <Link to={`/teacher/tests/${t.id}`}>مدیریت سوالات</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
