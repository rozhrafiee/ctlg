import { useEffect, useState } from "react";
import api from "../../api/axios";
import "@/styles/global-styles.css";
import "@/styles/page-styles.css";

export default function Grading() {
  const [sessions, setSessions] = useState([]);
  const [detail, setDetail] = useState(null);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    api.get("/assessment/reviews/pending/")
      .then(res => setSessions(res.data));
  }, []);

  const load = id => {
    api.get(`/assessment/sessions/${id}/details/`)
      .then(res => setDetail(res.data));
  };

  const submit = () => {
    api.post(`/assessment/sessions/${detail.session.id}/manual-grade/`, {
      grades: Object.entries(grades).map(([id, score]) => ({
        answer_id: Number(id),
        score: Number(score),
      })),
    }).then(() => {
      alert("نمره ثبت شد");
      window.location.reload();
    });
  };

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6 bg-gray-50 min-h-screen">
      <div>
        <h2 className="font-bold mb-3 text-lg">در انتظار تصحیح</h2>
        {sessions.map(s => (
          <button
            key={s.id}
            onClick={() => load(s.id)}
            className="block w-full bg-white p-4 mb-2 rounded shadow hover:bg-gray-50 text-right"
          >
            <p className="font-semibold">{s.test_title}</p>
            <p className="text-sm text-gray-500">دانشجو: {s.user_full_name}</p>
          </button>
        ))}
      </div>

      {detail && (
        <div>
          <h2 className="font-bold mb-3 text-lg">تصحیح</h2>
          {detail.answers.map(a => (
            <div key={a.id} className="bg-white p-4 mb-3 rounded shadow">
              <p className="font-semibold mb-2">{a.question_text}</p>
              <p className="text-gray-700 italic mb-3">"{a.text_answer}"</p>
              
              <input
                type="number"
                min="0"
                max={a.question.points || 10}
                className="w-full border rounded p-2"
                placeholder="نمره"
                onChange={e =>
                  setGrades({ ...grades, [a.id]: e.target.value })
                }
              />
            </div>
          ))}
          
          <button
            onClick={submit}
            className="w-full px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
          >
            ثبت نمرات
          </button>
        </div>
      )}
    </div>
  );
}
export default Grading;