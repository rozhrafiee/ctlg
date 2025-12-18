import { useEffect, useState } from "react";
import { api } from "../../utils/api";

interface ContentItem {
  id: number;
  title: string;
  description: string;
  content_type: string;
  body: string;
}

export default function RecommendedContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/learning/recommended/").then((res) => {
      setItems(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>در حال بارگذاری محتوای پیشنهادی...</div>;

  return (
    <div>
      <h2>محتوای پیشنهادی برای شما</h2>
      <div className="grid">
        {items.map((c) => (
          <div key={c.id} className="card">
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            {c.content_type === "text" && <p>{c.body}</p>}
            {c.content_type === "image" && (
              <img src={c.body} alt={c.title} className="content-image" />
            )}
            {c.content_type === "video" && (
              <video src={c.body} controls className="content-video" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


