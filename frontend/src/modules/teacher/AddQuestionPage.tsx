// src/modules/teacher/AddQuestionPage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState, FormEvent } from "react";
import { api } from "../../utils/api";

export default function AddQuestionPage() {
  const { testId } = useParams<{ testId: string }>();
  const [questions, setQuestions] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    load();
  }, [testId]);

  const load = async () => {
    const res = await api.get(
      `/api/assessment/teacher/tests/${testId}/questions/list/`
    );
    setQuestions(res.data.questions || []);
  };

  const addQuestion = async (e: FormEvent) => {
    e.preventDefault();
    await api.post(`/api/assessment/teacher/tests/${testId}/questions/`, {
      text,
      question_type: "text",
      order: questions.length + 1,
    });
    setText("");
    load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>مدیریت سوالات آزمون</h2>

      <form onSubmit={addQuestion}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="متن سوال"
          required
        />
        <button>افزودن سوال</button>
      </form>

      <ul>
        {questions.map((q) => (
          <li key={q.id}>{q.text}</li>
        ))}
      </ul>
    </div>
  );
}
