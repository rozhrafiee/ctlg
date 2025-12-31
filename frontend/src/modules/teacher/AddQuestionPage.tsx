// src/modules/teacher/AddQuestionPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../utils/api";

interface Question {
  id: number;
  text: string;
  question_type: "mcq" | "text";
  order: number;
  choices: {
    id: number;
    text: string;
    is_correct: boolean;
  }[];
}

export default function AddQuestionPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [testTitle, setTestTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    text: "",
    question_type: "mcq" as "mcq" | "text",
    order: 0,
    choices: [
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ],
  });

  useEffect(() => {
    if (!testId) return;
    loadQuestions();
  }, [testId]);

  const loadQuestions = async () => {
    try {
      const res = await api.get(
        `/api/assessment/teacher/tests/${testId}/questions/list/`
      );

      setQuestions(res.data.questions);
      setTestTitle(res.data.test.title);
    } catch {
      setError("خطا در بارگذاری سوالات آزمون");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post(
        `/api/assessment/teacher/tests/${testId}/questions/`,
        {
          text: form.text,
          question_type: form.question_type,
          order: form.order,
          choices:
            form.question_type === "mcq"
              ? form.choices.filter(c => c.text.trim())
              : [],
        }
      );

      setForm({
        text: "",
        question_type: "mcq",
        order: questions.length,
        choices: [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
      });

      loadQuestions();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.text?.[0] ||
          "خطا در ثبت سوال"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (id: number) => {
    if (!confirm("حذف این سوال؟")) return;
    await api.delete(`/api/assessment/teacher/questions/${id}/delete/`);
    loadQuestions();
  };

  if (!testId) return <p>شناسه آزمون نامعتبر است</p>;

  return (
    <div>
      <h2>مدیریت سوالات آزمون</h2>
      <h3>{testTitle}</h3>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <textarea
          value={form.text}
          onChange={e => setForm({ ...form, text: e.target.value })}
          required
        />

        <select
          value={form.question_type}
          onChange={e =>
            setForm({
              ...form,
              question_type: e.target.value as "mcq" | "text",
            })
          }
        >
          <option value="mcq">چندگزینه‌ای</option>
          <option value="text">متنی</option>
        </select>

        <button disabled={loading}>
          {loading ? "در حال ذخیره..." : "ذخیره سوال"}
        </button>
      </form>

      <hr />

      {questions.map(q => (
        <div key={q.id}>
          <strong>{q.text}</strong>
          <button onClick={() => deleteQuestion(q.id)}>حذف</button>
        </div>
      ))}
    </div>
  );
}
