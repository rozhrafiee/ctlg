import { useEffect, useState } from "react";
import { api } from "../../utils/api";

interface ContentItem {
  id: number;
  title: string;
  description: string;
  content_type: string;
  body: string;
  min_level: number;
  max_level: number;
}

export default function RecommendedContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<number, number>>({});

  useEffect(() => {
    loadContent();
    loadProgress();
  }, []);

  const loadContent = async () => {
    try {
      const res = await api.get("/api/learning/recommended/");
      setItems(res.data);
    } catch (err) {
      console.error("خطا در بارگذاری محتوا:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const res = await api.get("/api/learning/progress/");
      const progressMap: Record<number, number> = {};
      res.data.forEach((p: any) => {
        progressMap[p.content.id] = p.progress_percent;
      });
      setProgress(progressMap);
    } catch (err) {
      console.error("خطا در بارگذاری پیشرفت:", err);
    }
  };

  const updateProgress = async (contentId: number, percent: number, completed: boolean = false) => {
    try {
      await api.post(`/api/learning/content/${contentId}/progress/`, {
        progress_percent: percent,
        completed: completed,
      });
      setProgress((prev) => ({ ...prev, [contentId]: percent }));
      if (completed) {
        alert("تبریک! محتوا را تکمیل کردید.");
      }
    } catch (err) {
      console.error("خطا در به‌روزرسانی پیشرفت:", err);
    }
  };

  if (loading) return <div>در حال بارگذاری محتوای پیشنهادی...</div>;

  return (
    <div>
      <h2>محتوای پیشنهادی برای شما</h2>
      {items.length === 0 ? (
        <div className="card">
          <p>هیچ محتوایی برای سطح شما موجود نیست.</p>
        </div>
      ) : (
        <div className="grid">
          {items.map((c) => (
            <div key={c.id} className="card">
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <p style={{ fontSize: "14px", color: "#666" }}>
                سطح: {c.min_level} تا {c.max_level}
              </p>
              {progress[c.id] !== undefined && (
                <div style={{ margin: "10px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span>پیشرفت:</span>
                    <span>{progress[c.id].toFixed(0)}%</span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      backgroundColor: "#e0e0e0",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress[c.id]}%`,
                        height: "100%",
                        backgroundColor: "#28a745",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>
              )}
              {c.content_type === "text" && <p>{c.body}</p>}
              {c.content_type === "image" && (
                <img src={c.body} alt={c.title} className="content-image" style={{ maxWidth: "100%" }} />
              )}
              {c.content_type === "video" && (
                <video src={c.body} controls className="content-video" style={{ maxWidth: "100%" }} />
              )}
              <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => updateProgress(c.id, 25)}
                  className="btn-secondary"
                  style={{ fontSize: "12px" }}
                >
                  25% تکمیل شد
                </button>
                <button
                  onClick={() => updateProgress(c.id, 50)}
                  className="btn-secondary"
                  style={{ fontSize: "12px" }}
                >
                  50% تکمیل شد
                </button>
                <button
                  onClick={() => updateProgress(c.id, 75)}
                  className="btn-secondary"
                  style={{ fontSize: "12px" }}
                >
                  75% تکمیل شد
                </button>
                <button
                  onClick={() => updateProgress(c.id, 100, true)}
                  className="btn-primary"
                  style={{ fontSize: "12px" }}
                >
                  ✓ تکمیل شد
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


