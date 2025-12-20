import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../utils/api";

interface Choice {
  id: number;
  text: string;
}

interface Question {
  id: number;
  text: string;
  question_type: string;
  choices: Choice[];
}

interface TestDetail {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export default function TestSessionPage() {
  const { id } = useParams();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    api.get(`/api/assessment/tests/${id}/`).then((res) => setTest(res.data));
    api.post(`/api/assessment/tests/${id}/start/`).then((res) =>
      setSessionId(res.data.id)
    );
  }, [id]);

  const handleChoiceChange = (qId: number, choiceId: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: choiceId }));
  };

  const handleSubmit = async () => {
    if (!sessionId || !test) return;
    const payload = {
      answers: test.questions.map((q) => ({
        question: q.id,
        selected_choice: answers[q.id] ?? null,
        text_answer: ""
      }))
    };
    const res = await api.post(`/api/assessment/sessions/${sessionId}/submit/`, payload);
    navigate(`/tests/result/${sessionId}`);
  };

  if (!test) return <div>در حال بارگذاری آزمون...</div>;

  return (
    <div>
      <h2>{test.title}</h2>
      <p>{test.description}</p>
      {test.questions.map((q) => (
        <div key={q.id} className="card question-card">
          <p>{q.text}</p>
          {q.choices.map((c) => (
            <label key={c.id} className="choice">
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={answers[q.id] === c.id}
                onChange={() => handleChoiceChange(q.id, c.id)}
              />
              {c.text}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit} className="btn-primary">
        ثبت و پایان آزمون
      </button>
    </div>
  );
}


