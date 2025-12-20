import { FormEvent, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

interface TestDetail {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

interface Question {
  id: number;
  text: string;
  question_type: string;
  order: number;
  choices: Choice[];
}

interface Choice {
  id: number;
  text: string;
}

export default function AddQuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [questionForm, setQuestionForm] = useState({
    text: "",
    question_type: "mcq",
    order: 0,
    choices: [
      { text: "", is_correct: false, score: 0 },
      { text: "", is_correct: false, score: 0 },
    ],
  });

  useEffect(() => {
    if (id) {
      loadTest();
    }
  }, [id]);

  const loadTest = async () => {
    try {
      const res = await api.get(`/api/assessment/tests/${id}/`);
      setTest(res.data);
    } catch (err) {
      console.error("خطا در بارگذاری آزمون:", err);
    }
  };

  const handleAddChoice = () => {
    setQuestionForm({
      ...questionForm,
      choices: [
        ...questionForm.choices,
        { text: "", is_correct: false, score: 0 },
      ],
    });
  };

  const handleChoiceChange = (index: number, field: string, value: any) => {
    const newChoices = [...questionForm.choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    setQuestionForm({ ...questionForm, choices: newChoices });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (questionForm.question_type === "mcq" && questionForm.choices.length < 2) {
      setError("حداقل ۲ گزینه برای سوال چندگزینه‌ای لازم است");
      setLoading(false);
      return;
    }

    try {
      await api.post(`/api/assessment/tests/${id}/questions/`, questionForm);
      setShowForm(false);
      setQuestionForm({
        text: "",
        question_type: "mcq",
        order: 0,
        choices: [
          { text: "", is_correct: false, score: 0 },
          { text: "", is_correct: false, score: 0 },
        ],
      });
      await loadTest();
    } catch (err: any) {
      setError(err.response?.data?.detail || "خطا در افزودن سوال");
    } finally {
      setLoading(false);
    }
  };

  if (!test) return <div>در حال بارگذاری...</div>;

  return (
    <div>
      <h2>مدیریت سوالات: {test.title}</h2>
      <button
        className="btn-secondary"
        onClick={() => navigate("/teacher")}
        style={{ marginBottom: "20px" }}
      >
        بازگشت به پنل استاد
      </button>

      <div style={{ marginBottom: "20px" }}>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "انصراف" : "افزودن سوال جدید"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: "20px" }}>
          <h3>سوال جدید</h3>
          <label>
            متن سوال
            <textarea
              value={questionForm.text}
              onChange={(e) =>
                setQuestionForm({ ...questionForm, text: e.target.value })
              }
              rows={3}
              required
            />
          </label>
          <label>
            نوع سوال
            <select
              value={questionForm.question_type}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  question_type: e.target.value,
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
              value={questionForm.order}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  order: parseInt(e.target.value) || 0,
                })
              }
            />
          </label>

          {questionForm.question_type === "mcq" && (
            <div>
              <h4>گزینه‌ها</h4>
              {questionForm.choices.map((choice, index) => (
                <div key={index} className="card" style={{ marginBottom: "10px" }}>
                  <label>
                    متن گزینه
                    <input
                      value={choice.text}
                      onChange={(e) =>
                        handleChoiceChange(index, "text", e.target.value)
                      }
                      required
                    />
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={choice.is_correct}
                      onChange={(e) =>
                        handleChoiceChange(index, "is_correct", e.target.checked)
                      }
                    />
                    پاسخ صحیح
                  </label>
                  <label>
                    امتیاز
                    <input
                      type="number"
                      step="0.1"
                      value={choice.score}
                      onChange={(e) =>
                        handleChoiceChange(
                          index,
                          "score",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </label>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddChoice}
                className="btn-secondary"
              >
                افزودن گزینه
              </button>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "در حال افزودن..." : "افزودن سوال"}
          </button>
        </form>
      )}

      <div>
        <h3>سوالات موجود ({test.questions.length})</h3>
        {test.questions.length === 0 ? (
          <p>هنوز سوالی اضافه نشده است.</p>
        ) : (
          <div className="grid">
            {test.questions.map((q) => (
              <div key={q.id} className="card">
                <h4>{q.text}</h4>
                <p>نوع: {q.question_type === "mcq" ? "چندگزینه‌ای" : "متنی"}</p>
                <p>ترتیب: {q.order}</p>
                {q.choices.length > 0 && (
                  <div>
                    <strong>گزینه‌ها:</strong>
                    <ul>
                      {q.choices.map((c) => (
                        <li key={c.id}>{c.text}</li>
                      ))}
                    </ul>
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

