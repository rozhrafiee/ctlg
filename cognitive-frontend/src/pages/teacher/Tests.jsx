import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import "@/styles/global-styles.css";
import "@/styles/page-styles.css";

export default function Tests() {
  const [tests, setTests] = useState([]);

  const load = () =>
    api.get("/assessment/teacher/tests/").then(res => setTests(res.data));

  useEffect(load, []);

  const remove = id => {
    if (confirm("حذف شود؟"))
      api.delete(`/assessment/tests/${id}/delete/`).then(load);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">آزمون‌ها</h1>

      {tests.map(t => (
        <div key={t.id} className="bg-white p-4 mb-3 rounded shadow">
          <h2 className="font-bold">{t.title}</h2>
          <p className="text-sm text-gray-500">نوع: {t.test_type}</p>
          <p className="text-sm">حداقل سطح: {t.min_level}</p>

          <div className="flex gap-2 mt-3">
            <Link
              to={`/teacher/tests/${t.id}/questions`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              سوالات
            </Link>
            <button
              onClick={() => remove(t.id)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              حذف
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
export default Tests;