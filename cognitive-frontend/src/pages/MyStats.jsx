import { useEffect, useState } from "react";
import { analyticsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const MyStats = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // در برخی سیستم‌ها آیدی کاربر در توکن هست و نیازی به پاس دادن آن نیست
    // اما بر اساس کد شما، از user.id استفاده می‌کنیم
    if (!user?.id) return;

    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await analyticsAPI.getUserStats(user.id);
        setData(res.data);
      } catch (e) {
        console.error("خطا در بارگذاری آمار کاربر", e);
        setError("هنوز آماری برای شما ثبت نشده است یا خطایی در ارتباط با سرور رخ داده است.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  if (loading) return <div style={styles.center}>در حال بارگذاری تحلیل‌های هوشمند...</div>;
  if (error) return <div style={{...styles.center, color: '#e74c3c'}}>{error}</div>;
  if (!data) return <div style={styles.center}>داده‌ای برای نمایش یافت نشد.</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 گزارش وضعیت و تحلیل پیشرفت</h1>
      
      <div style={styles.mainGrid}>
        {/* کارت رتبه و سطح فعلی */}
        <div style={styles.statsCard}>
          <div style={styles.badge}>سطح فعلی: {data.level ?? "در حال ارزیابی"}</div>
          <h2 style={styles.rankText}>رتبه شما: {data.rank ?? "---"}</h2>
          <p style={styles.infoText}>وضعیت کلی: <strong>{data.status_label || "فعال"}</strong></p>
        </div>

        {/* بخش پیشنهادات هوشمند */}
        {Array.isArray(data.recommended) && data.recommended.length > 0 && (
          <div style={styles.recommendCard}>
            <h4 style={{marginTop: 0, color: '#2980b9'}}>🎯 پیشنهادات برای ارتقای سطح:</h4>
            <ul style={styles.list}>
              {data.recommended.map((item, idx) => (
                <li key={idx} style={styles.listItem}>✅ {item.title}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* نمایش تاریخچه تغییرات سطح با استایل تایم‌لاین */}
      {data.level_history && data.level_history.length > 0 && (
        <div style={styles.historySection}>
          <h4 style={styles.sectionTitle}>⏳ تاریخچه تغییرات سطح</h4>
          <div style={styles.timeline}>
            {data.level_history.map((item, idx) => (
              <div key={idx} style={styles.timelineItem}>
                <div style={styles.timelineDot}></div>
                <div style={styles.timelineContent}>
                  <strong>سطح {item.level}</strong>
                  <span style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString("fa-IR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* اطلاعات تکمیلی و بازخورد سیستم */}
      {data.extra_info && (
        <div style={styles.infoBox}>
          <h4 style={{margin: '0 0 10px 0'}}>💡 تحلیل سیستم:</h4>
          <p style={{lineHeight: '1.6', margin: 0}}>{data.extra_info}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { direction: "rtl", padding: "30px", fontFamily: "Tahoma", maxWidth: "900px", margin: "0 auto" },
  title: { textAlign: 'center', color: '#2c3e50', marginBottom: '30px' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' },
  statsCard: { background: 'linear-gradient(135deg, #3498db, #2980b9)', color: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)', textAlign: 'center' },
  recommendCard: { background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #e1f5fe', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  badge: { background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', display: 'inline-block', marginBottom: '15px' },
  rankText: { margin: '10px 0', fontSize: '1.8rem' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: { padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem' },
  historySection: { background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px' },
  sectionTitle: { marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #f1f1f1', paddingBottom: '10px' },
  timeline: { borderRight: '2px solid #3498db', paddingRight: '20px', marginRight: '10px' },
  timelineItem: { position: 'relative', marginBottom: '20px' },
  timelineDot: { position: 'absolute', right: '-27px', top: '5px', width: '12px', height: '12px', background: '#3498db', borderRadius: '50%', border: '2px solid #fff' },
  timelineContent: { display: 'flex', justifyContent: 'space-between', background: '#f8f9fa', padding: '10px 15px', borderRadius: '8px' },
  date: { fontSize: '0.8rem', color: '#95a5a6' },
  infoBox: { background: '#fff8e1', padding: '20px', borderRadius: '10px', borderRight: '5px solid #ffc107', color: '#5d4037' },
  center: { textAlign: 'center', marginTop: '100px', fontSize: '1.2rem' }
};

export default MyStats;