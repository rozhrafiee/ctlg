import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentAPI, authAPI } from "../services/api";

const AvailableTests = () => {
  const [tests, setTests] = useState([]);
  const [userLevel, setUserLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ۱. دریافت اطلاعات پروفایل کاربر برای فهمیدن سطح او
        const profileRes = await authAPI.getMe();
        const currentLevel = profileRes.data.current_level || 1; // فرض بر سطح ۱ اگر تعیین نشده بود
        setUserLevel(currentLevel);

        // ۲. دریافت تمام آزمون‌های فعال
        const testsRes = await assessmentAPI.getAvailableTests();
        
        // ۳. فیلتر کردن هوشمند:
        // آزمون‌های تعیین سطح همیشه نشان داده شوند
        // آزمون‌های عمومی فقط اگر با سطح کاربر برابر باشند
        const filtered = testsRes.data.filter(test => {
          if (test.test_type === 'placement') return true;
          return test.target_level === currentLevel;
        });

        setTests(filtered);
      } catch (err) {
        console.error("خطا در دریافت لیست آزمون‌ها:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div style={styles.center}>در حال بررسی سطح شما و دریافت آزمون‌ها...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>📚 آزمون‌های متناسب با سطح شما</h2>
        <div style={styles.levelBadge}>سطح فعلی شما: {userLevel}</div>
      </header>

      {tests.length === 0 ? (
        <div style={styles.empty}>
          <p>فعلاً آزمون جدیدی برای سطح شما منتشر نشده است.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {tests.map(test => (
            <div key={test.id} style={styles.card}>
              <div style={styles.cardType}>
                {test.test_type === 'placement' ? '🎯 تعیین سطح' : '📝 آزمون دوره‌ای'}
              </div>
              <h3>{test.title}</h3>
              <p style={styles.desc}>{test.description || "توضیحاتی برای این آزمون ثبت نشده است."}</p>
              
              <div style={styles.meta}>
                <span>⏰ زمان: {test.time_limit_minutes} دقیقه</span>
                <span>❓ سوالات: {test.questions_count || 0} عدد</span>
              </div>

              <button 
                onClick={() => navigate(`/take-test/${test.id}`)} 
                style={test.test_type === 'placement' ? styles.btnPlacement : styles.btnStart}
              >
                شروع آزمون
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '40px 20px', direction: 'rtl', fontFamily: 'Tahoma', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '20px' },
  levelBadge: { background: '#3498db', color: '#fff', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'record(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { background: '#fff', borderRadius: '15px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', position: 'relative', border: '1px solid #f0f0f0' },
  cardType: { position: 'absolute', top: '15px', left: '15px', fontSize: '12px', color: '#7f8c8d', background: '#ecf0f1', padding: '4px 8px', borderRadius: '5px' },
  desc: { color: '#636e72', fontSize: '14px', lineHeight: '1.6', height: '45px', overflow: 'hidden' },
  meta: { display: 'flex', justifyContent: 'space-between', margin: '20px 0', fontSize: '13px', color: '#2d3436' },
  btnStart: { width: '100%', padding: '12px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  btnPlacement: { width: '100%', padding: '12px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  empty: { textAlign: 'center', padding: '50px', background: '#f9f9f9', borderRadius: '15px' },
  center: { textAlign: 'center', padding: '100px', fontSize: '18px' }
};

export default AvailableTests;
