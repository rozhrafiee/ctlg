import { useEffect, useState } from "react";
import { analyticsAPI } from "../services/api";

const MyStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // در برخی سیستم‌ها آیدی کاربر در توکن هست و نیازی به پاس دادن آن نیست
    // اما بر اساس کد شما، از user.id استفاده می‌کنیم
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await analyticsAPI.myStats();
        setData(res.data);
      } catch (e) {
        console.error("خطا در بارگذاری آمار کاربر", e);
        setError("هنوز آماری برای شما ثبت نشده است یا خطایی در ارتباط با سرور رخ داده است.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <div style={styles.center}>در حال بارگذاری تحلیل‌های هوشمند...</div>;
  if (error) return <div style={{...styles.center, color: '#e74c3c'}}>{error}</div>;
  if (!data) return <div style={styles.center}>داده‌ای برای نمایش یافت نشد.</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 گزارش وضعیت و تحلیل پیشرفت</h1>
      
      <div style={styles.mainGrid}>
        <div style={styles.statsCard}>
          <div style={styles.badge}>میانگین حافظه: {data.avg_memory_score ?? 0}</div>
          <h2 style={styles.rankText}>میانگین تمرکز: {data.avg_focus_score ?? 0}</h2>
          <p style={styles.infoText}>میانگین منطق: <strong>{data.avg_logic_score ?? 0}</strong></p>
        </div>

        <div style={styles.recommendCard}>
          <h4 style={{marginTop: 0, color: '#2980b9'}}>📌 خلاصه آزمون‌ها</h4>
          <ul style={styles.list}>
            <li style={styles.listItem}>تعداد آزمون‌های تکمیل‌شده: {data.total_tests_completed ?? 0}</li>
            <li style={styles.listItem}>آخرین بروزرسانی: {data.last_updated ? new Date(data.last_updated).toLocaleDateString("fa-IR") : "-"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { direction: "rtl", padding: "30px", fontFamily: "Tahoma", maxWidth: "900px", margin: "0 auto" },
  title: { textAlign: 'center', color: '#2c3e50', marginBottom: '30px' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' },
  statsCard: { background: 'linear-gradient(135deg, #3498db, #2980b9)', color: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)', textAlign: 'center' },
  infoText: { margin: '10px 0', fontSize: '0.95rem' },
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
