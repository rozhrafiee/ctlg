import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ContentManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    content_type: "text",
    min_level: 1,
    max_level: 100,
    difficulty: 50
  });

  const load = () => api.get("/adaptive/teacher/content/").then(res => setItems(res.data));

  useEffect(load, []);

  const create = () => {
    api.post("/adaptive/teacher/content/", form).then(() => {
      alert("ایجاد شد");
      load();
      setForm({ title: "", description: "", content_type: "text", min_level: 1, max_level: 100, difficulty: 50 });
    });
  };

  const remove = id => {
    if (confirm("حذف شود؟"))
      api.delete(`/adaptive/content/${id}/delete/`).then(load);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold">مدیریت محتوا</h1>

      {/* Create Form */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="font-bold">ایجاد محتوای جدید</h2>
        
        <input
          className="w-full border rounded p-2"
          placeholder="عنوان"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="w-full border rounded p-2"
          placeholder="توضیحات"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <select
          className="w-full border rounded p-2"
          value={form.content_type}
          onChange={e => setForm({ ...form, content_type: e.target.value })}
        >
          <option value="text">متن</option>
          <option value="video">ویدیو</option>
          <option value="interactive">تعاملی</option>
        </select>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="number"
            className="border rounded p-2"
            placeholder="حداقل سطح"
            value={form.min_level}
            onChange={e => setForm({ ...form, min_level: Number(e.target.value) })}
          />
          <input
            type="number"
            className="border rounded p-2"
            placeholder="حداکثر سطح"
            value={form.max_level}
            onChange={e => setForm({ ...form, max_level: Number(e.target.value) })}
          />
          <input
            type="number"
            className="border rounded p-2"
            placeholder="سختی (1-100)"
            value={form.difficulty}
            onChange={e => setForm({ ...form, difficulty: Number(e.target.value) })}
          />
        </div>

        <button
          onClick={create}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
        >
          ایجاد محتوا
        </button>
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {items.map(c => (
          <div key={c.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <h3 className="font-bold">{c.title}</h3>
              <p className="text-sm text-gray-600">{c.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                نوع: {c.content_type} | سطح: {c.min_level}-{c.max_level} | سختی: {c.difficulty}
              </p>
            </div>
            <button
              onClick={() => remove(c.id)}
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
