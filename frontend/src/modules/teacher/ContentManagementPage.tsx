// src/modules/teacher/ContentManagementPage.tsx
import { useEffect, useState, FormEvent } from "react";
import { api } from "../../utils/api";

interface Content {
  id: number;
  title: string;
  content_type: string;
  is_active: boolean;
}

export default function ContentManagementPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/api/adaptive-learning/teacher/contents/");
    setContents(res.data);
  };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    await api.post("/api/adaptive-learning/teacher/content/create/", {
      title,
      content_type: "text",
      body,
      min_level: 1,
      max_level: 3,
      is_active: true,
    });
    setTitle("");
    setBody("");
    load();
  };

  const remove = async (id: number) => {
    await api.delete(`/api/adaptive-learning/teacher/content/${id}/delete/`);
    load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>مدیریت محتوا</h2>

      <form onSubmit={create}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان محتوا"
          required
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="متن محتوا"
        />
        <button>ایجاد محتوا</button>
      </form>

      <ul>
        {contents.map((c) => (
          <li key={c.id}>
            {c.title}{" "}
            <button onClick={() => remove(c.id)}>حذف</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
