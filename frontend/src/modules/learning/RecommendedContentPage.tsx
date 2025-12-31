import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

interface ContentProgress {
  content: { id: number };
  progress_percent: number;
}

interface ContentTestInfo {
  has_recommendation: boolean;
  already_taken: boolean;
  last_score?: number;
  last_passed?: boolean;
}

export default function RecommendedContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [contentTests, setContentTests] = useState<Record<number, ContentTestInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await Promise.all([loadContent(), loadProgress()]);
    setLoading(false);
  };

  const loadContent = async () => {
    const res = await api.get("/api/adaptive-learning/recommended/");
    setItems(res.data);
  };

  const loadProgress = async () => {
    const res = await api.get("/api/adaptive-learning/progress/");
    const map: Record<number, number> = {};

    const completedIds: number[] = [];

    res.data.forEach((p: ContentProgress) => {
      map[p.content.id] = p.progress_percent;
      if (p.progress_percent >= 70) {
        completedIds.push(p.content.id);
      }
    });

    setProgress(map);

    if (completedIds.length > 0) {
      loadContentTests(completedIds);
    }
  };

  const loadContentTests = async (contentIds: number[]) => {
    const tests: Record<number, ContentTestInfo> = {};

    for (const id of contentIds) {
      try {
        const res = await api.get(
          `/api/assessment/content/${id}/test/recommendation/`
        );
        if (res.data.has_recommendation) {
          tests[id] = res.data;
        }
      } catch {
        // no test exists → not an error
      }
    }

    setContentTests(prev => ({ ...prev, ...tests }));
  };

  const updateProgress = async (contentId: number, percent: number) => {
    await api.post(
      `/api/adaptive-learning/content/${contentId}/progress/`,
      { progress_percent: percent }
    );

    setProgress(prev => ({ ...prev, [contentId]: percent }));

    if (percent >= 70 && !contentTests[contentId]) {
      loadContentTests([contentId]);
    }
  };

  const startContentTest = async (contentId: number) => {
    const res = await api.post(
      `/api/assessment/content/${contentId}/test/take/`
    );
    window.location.href = `/test/${res.data.session_id}`;
  };

  if (loading) {
    return <p style={{ padding: 40 }}>در حال بارگذاری...</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>محتوای پیشنهادی</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {items.map(c => {
          const currentProgress = progress[c.id] || 0;
          const isCompleted = currentProgress >= 70;
          const testInfo = contentTests[c.id];

          return (
            <div key={c.id} className="card" style={{ padding: 20 }}>
              <h3>{c.title}</h3>
              <p>{c.description}</p>

              <p>پیشرفت: {currentProgress}%</p>

              {isCompleted && testInfo?.has_recommendation && (
                <div style={{ marginTop: 10 }}>
                  {testInfo.already_taken ? (
                    <p>
                      نمره قبلی: {testInfo.last_score}%
                      {testInfo.last_passed ? " ✅" : " ❌"}
                    </p>
                  ) : (
                    <button onClick={() => startContentTest(c.id)}>
                      شرکت در آزمون
                    </button>
                  )}
                </div>
              )}

              <div style={{ marginTop: 10 }}>
                {[25, 50, 70, 100].map(p => (
                  <button
                    key={p}
                    onClick={() => updateProgress(c.id, p)}
                    style={{ marginRight: 5 }}
                  >
                    {p}%
                  </button>
                ))}
              </div>

              <Link to={`/content/${c.id}`}>مشاهده کامل</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
