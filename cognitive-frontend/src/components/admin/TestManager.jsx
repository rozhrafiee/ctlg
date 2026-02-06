import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function TestManager() {
  const [tests, setTests] = useState([]);

  const load = () => api.get("/assessment/teacher/tests/").then(res => setTests(res.data));

  useEffect(load, []);

  const remove = id => {
    if (confirm("حذف آزمون؟"))
      api.delete(`/assessment/tests/${id}/delete/`).then(load);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">مدیریت آزمون‌ها</h1>

      <div className="space-y-3">
        {tests.map(t => (
          <div key={t.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{t.title}</h3>
                <p className="text-sm text-gray-600">{t.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  نوع: {t.test_type === 'placement' ? 'تعیین سطح' : 'عادی'} | 
                  حداقل سطح: {t.min_level} | 
                  مدت: {t.time_limit_minutes} دقیقه
                </p>
              </div>
              
              <div className="flex gap-2">
                <Link
                  to={`/admin/tests/${t.id}/questions`}
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
          </div>
        ))}
      </div>
    </div>
  );
}
