import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import "@/styles/global-styles.css";
import "@/styles/page-styles.css";

export default function TestQuestions() {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({
    text: "",
    question_type: "descriptive",
    points: 5,
    order: 1,
  });

  const load = () =>
    api.get(`/assessment/tests/${id}/questions/`)
      .then(res => setQuestions(res.data));

  useEffect(load, [id]);

  const add = () => {
    api.post(`/assessment/tests/${id}/questions/add/`, form)
      .then(() => {
        setForm({ text: "", question_type: "descriptive", points: 5, order: questions.length + 1 });
        load();
      });
  };

  const remove = qid => {
    if (confirm("حذف شود؟"))
      api.delete(`/assessment/questions/${qid}/delete/`).then(load);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-4">
      <h1 className="text-xl font-bold">سوالات آزمون</h1>

      <div className="bg-white p-4 rounded shadow space-y-3">
        <textarea
          className="w-full border rounded p-2"
          placeholder="متن سوال"
          value={form.text}
          onChange={e => setForm({ ...form, text: e.target.value })}
        />

        <select
          className="w-full border rounded p-2"
          value={form.question_type}
          onChange={e => setForm({ ...form, question_type: e.target.value })}
        >
          <option value="descriptive">تشریحی</option>
          <option value="mcq">چهارگزینه‌ای</option>
        </select>

        <input
          type="number"
          className="w-full border rounded p-2"
          placeholder="امتیاز"
          value={form.points}
          onChange={e => setForm({ ...form, points: Number(e.target.value) })}
        />

        <button
          onClick={add}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          افزودن سوال
        </button>
      </div>

      <div className="space-y-3">
        {questions.map(q => (
          <div key={q.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <p className="font-semibold">{q.text}</p>
              <p className="text-sm text-gray-500">نوع: {q.question_type} | امتیاز: {q.points}</p>
            </div>
            <button
              onClick={() => remove(q.id)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              حذف
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default TestQuestions;