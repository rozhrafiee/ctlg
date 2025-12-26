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
  related_content_info?: {
    id: number;
    title: string;
    content_type: string;
  };
}

interface ContentProgress {
  content: {
    id: number;
  };
  progress_percent: number;
  completed_at: string | null;
}

export default function RecommendedContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [completedContents, setCompletedContents] = useState<number[]>([]);
  const [contentTests, setContentTests] = useState<Record<number, any>>({});

  useEffect(() => {
    loadContent();
    loadProgress();
  }, []);

  const loadContent = async () => {
    try {
      const res = await api.get("/api/learning/recommended/");
      setItems(res.data);
      
      // برای محتواهای کامل شده، بررسی آزمون مرتبط
      const completedIds = Object.keys(progress)
        .filter(id => progress[parseInt(id)] >= 80)
        .map(id => parseInt(id));
      
      if (completedIds.length > 0) {
        loadContentTests(completedIds);
      }
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
      const completed: number[] = [];
      
      res.data.forEach((p: ContentProgress) => {
        progressMap[p.content.id] = p.progress_percent;
        if (p.progress_percent >= 80) {
          completed.push(p.content.id);
        }
      });
      
      setProgress(progressMap);
      setCompletedContents(completed);
      
      // بارگذاری آزمون‌های محتواهای کامل شده
      if (completed.length > 0) {
        loadContentTests(completed);
      }
    } catch (err) {
      console.error("خطا در بارگذاری پیشرفت:", err);
    }
  };

  const loadContentTests = async (contentIds: number[]) => {
    try {
      const testsMap: Record<number, any> = {};
      
      for (const contentId of contentIds) {
        try {
          const res = await api.get(`/api/assessment/content/${contentId}/test/recommendation/`);
          if (res.data.has_recommendation) {
            testsMap[contentId] = res.data;
          }
        } catch (err) {
          // اگر آزمونی وجود نداشته باشد، خطا نیست
          console.log(`هیچ آزمونی برای محتوای ${contentId} یافت نشد`);
        }
      }
      
      setContentTests(testsMap);
    } catch (err) {
      console.error("خطا در بارگذاری آزمون‌های محتوا:", err);
    }
  };

  const updateProgress = async (contentId: number, percent: number, completed: boolean = false) => {
    try {
      await api.post(`/api/learning/content/${contentId}/progress/`, {
        progress_percent: percent,
        completed: completed,
      });
      
      setProgress((prev) => ({ ...prev, [contentId]: percent }));
      
      // اگر محتوا کامل شد، آزمون مرتبط را بررسی کن
      if (completed || percent >= 80) {
        if (!completedContents.includes(contentId)) {
          setCompletedContents([...completedContents, contentId]);
          await loadContentTests([contentId]);
        }
      }
      
      if (completed) {
        alert("تبریک! محتوا را تکمیل کردید.");
      }
    } catch (err) {
      console.error("خطا در به‌روزرسانی پیشرفت:", err);
    }
  };

  const startContentTest = async (contentId: number) => {
    try {
      const res = await api.post(`/api/assessment/content/${contentId}/test/take/`);
      if (res.data.session_id) {
        window.location.href = `/test/${res.data.session_id}`;
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "خطا در شروع آزمون");
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "text": return "📝";
      case "image": return "🖼️";
      case "video": return "🎬";
      case "scenario": return "🎭";
      default: return "📄";
    }
  };

  if (loading) return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <div className="spinner"></div>
      <p>در حال بارگذاری محتوای پیشنهادی...</p>
    </div>
  );

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>محتوای پیشنهادی برای شما</h2>
      
      {items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>📚</div>
          <h3 style={{ color: "#666", marginBottom: "10px" }}>هیچ محتوایی برای سطح شما موجود نیست</h3>
          <p style={{ color: "#666" }}>سطح شما: {localStorage.getItem('userLevel') || 1}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
          {items.map((c) => {
            const currentProgress = progress[c.id] || 0;
            const isCompleted = currentProgress >= 80;
            const hasTest = contentTests[c.id]?.has_recommendation;
            const testTaken = contentTests[c.id]?.already_taken;
            const testScore = contentTests[c.id]?.score;
            
            return (
              <div key={c.id} className="card" style={{
                backgroundColor: "white",
                borderRadius: "10px",
                padding: "20px",
                border: `2px solid ${isCompleted ? "#28a745" : "#e0e0e0"}`,
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                height: "100%"
              }}>
                <div style={{ marginBottom: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <h3 style={{ margin: 0, color: "#333", fontSize: "18px" }}>
                      {getContentTypeIcon(c.content_type)} {c.title}
                    </h3>
                    {isCompleted && (
                      <span style={{
                        backgroundColor: "#d4edda",
                        color: "#155724",
                        padding: "3px 10px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        ✓ کامل شده
                      </span>
                    )}
                  </div>
                  <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
                    {c.description}
                  </p>
                  <p style={{ fontSize: "14px", color: "#6c757d", marginTop: "10px" }}>
                    سطح: {c.min_level} تا {c.max_level}
                  </p>
                </div>

                {/* پیشرفت */}
                {currentProgress > 0 && (
                  <div style={{ margin: "15px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ fontSize: "14px", color: "#666" }}>پیشرفت:</span>
                      <span style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                        {currentProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div style={{
                      width: "100%",
                      height: "8px",
                      backgroundColor: "#e9ecef",
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${currentProgress}%`,
                        height: "100%",
                        backgroundColor: currentProgress === 100 ? "#28a745" : "#0d6efd",
                        transition: "width 0.3s"
                      }} />
                    </div>
                  </div>
                )}

                {/* نمایش محتوا */}
                <div style={{ flex: 1, marginBottom: "15px" }}>
                  {c.content_type === "text" && (
                    <div style={{
                      maxHeight: "150px",
                      overflow: "hidden",
                      position: "relative"
                    }}>
                      <p style={{ fontSize: "14px", color: "#495057", lineHeight: "1.6" }}>
                        {c.body.substring(0, 300)}...
                      </p>
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "40px",
                        background: "linear-gradient(transparent, white)"
                      }} />
                    </div>
                  )}
                  
                  {c.content_type === "image" && (
                    <div style={{ textAlign: "center" }}>
                      <img 
                        src={c.body} 
                        alt={c.title} 
                        style={{ 
                          maxWidth: "100%", 
                          maxHeight: "150px",
                          borderRadius: "6px",
                          objectFit: "cover"
                        }} 
                      />
                    </div>
                  )}
                  
                  {c.content_type === "video" && (
                    <div style={{ textAlign: "center" }}>
                      <video 
                        src={c.body} 
                        controls 
                        style={{ 
                          maxWidth: "100%", 
                          maxHeight: "150px",
                          borderRadius: "6px"
                        }} 
                      />
                    </div>
                  )}
                </div>

                {/* بخش آزمون مرتبط */}
                {isCompleted && hasTest && (
                  <div style={{
                    marginBottom: "15px",
                    padding: "12px",
                    backgroundColor: testTaken ? "#f8f9fa" : "#e7f3ff",
                    borderRadius: "8px",
                    border: `1px solid ${testTaken ? "#dee2e6" : "#b6d4fe"}`
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "bold", color: "#084298" }}>
                          📊 آزمون مرتبط
                        </div>
                        <div style={{ fontSize: "13px", color: "#495057" }}>
                          {testTaken ? `نمره قبلی: ${testScore}%` : "آماده برای شرکت در آزمون"}
                        </div>
                      </div>
                      {!testTaken && (
                        <button
                          onClick={() => startContentTest(c.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#0d6efd",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "13px"
                          }}
                        >
                          شرکت در آزمون
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* دکمه‌های کنترل پیشرفت */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginTop: "auto" }}>
                  <button
                    onClick={() => updateProgress(c.id, 25)}
                    style={{
                      padding: "8px",
                      backgroundColor: "#e7f3ff",
                      color: "#0d6efd",
                      border: "1px solid #b6d4fe",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    25% تکمیل شد
                  </button>
                  <button
                    onClick={() => updateProgress(c.id, 50)}
                    style={{
                      padding: "8px",
                      backgroundColor: "#e7f3ff",
                      color: "#0d6efd",
                      border: "1px solid #b6d4fe",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    50% تکمیل شد
                  </button>
                  <button
                    onClick={() => updateProgress(c.id, 75)}
                    style={{
                      padding: "8px",
                      backgroundColor: "#d4edda",
                      color: "#155724",
                      border: "1px solid #c3e6cb",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    75% تکمیل شد
                  </button>
                  <button
                    onClick={() => updateProgress(c.id, 100, true)}
                    style={{
                      padding: "8px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}
                  >
                    ✓ کامل شد
                  </button>
                </div>

                {/* لینک مشاهده جزئیات */}
                <div style={{ marginTop: "15px", textAlign: "center" }}>
                  <Link
                    to={`/content/${c.id}`}
                    style={{
                      fontSize: "14px",
                      color: "#0d6efd",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    👁️ مشاهده کامل محتوا
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* داشبورد دانشجو */}
      <div style={{ marginTop: "40px" }}>
        <Link
          to="/student/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 24px",
            backgroundColor: "#20c997",
            color: "white",
            textDecoration: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          📊 مشاهده داشبورد آموزشی
        </Link>
      </div>
    </div>
  );
}