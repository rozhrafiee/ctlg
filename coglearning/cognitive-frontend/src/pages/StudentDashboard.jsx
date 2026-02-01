import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contentAPI, assessmentAPI } from '../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [activeTests, setActiveTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const progressPercent = (user?.cognitive_level / 10) * 100;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, testsRes] = await Promise.all([
          contentAPI.getAvailableContent(),
          assessmentAPI.getAvailableTests()
        ]);
        setContents(contentRes.data);
        setActiveTests(testsRes.data);
      } catch (err) {
        console.error("خطا در بارگذاری داده‌ها:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const startTest = (testId) => {
    assessmentAPI.startSession(testId).then(res => {
      navigate(`/take-test/${res.data.id}`);
    });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.welcome}>خوش آمدید، {user?.username} عزیز 🌸</h1>
          <p style={styles.subText}>امروز چه چیزی یاد می‌گیریم؟</p>
        </div>
        <div style={styles.levelCard}>
          <span style={styles.levelLabel}>سطح شناختی فعلی</span>
          <div style={styles.levelNumber}>{user?.cognitive_level || 1}</div>
        </div>
      </header>

      {!user?.has_taken_placement && (
        <div style={styles.placementBanner}>
          <div>
            <h3>🎯 سطح خود را دقیق‌تر تعیین کنید!</h3>
            <p>با شرکت در آزمون تعیین سطح، محتواهای اختصاصی دریافت کنید.</p>
          </div>
          <button style={styles.placementBtn} onClick={() => navigate('/placement-test')}>شروع تعیین سطح</button>
        </div>
      )}

      <section style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span>میزان ارتقای سطح شما</span>
          <span>{progressPercent}% تا تسلط کامل</span>
        </div>
        <div style={styles.progressBarBg}>
          <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }}></div>
        </div>
      </section>

      <div style={styles.mainGrid}>
        <section style={styles.contentSection}>
          <h2 style={styles.sectionTitle}>📝 آزمون‌های فعال برای شما</h2>
          <div style={styles.testGrid}>
            {activeTests.length > 0 ? activeTests.map(test => (
              <div key={test.id} style={styles.testCard}>
                <div>
                  <h4 style={{margin: '0 0 5px 0'}}>{test.title}</h4>
                  <span style={styles.timeTag}>⏱ زمان: {test.duration} دقیقه</span>
                </div>
                <button style={styles.testBtn} onClick={() => startTest(test.id)}>شروع آزمون</button>
              </div>
            )) : <p style={{color: '#95a5a6'}}>آزمون جدیدی فعلاً موجود نیست.</p>}
          </div>

          <h2 style={{...styles.sectionTitle, marginTop: '40px'}}>📚 محتواهای مناسب سطح شما</h2>
          {loading ? (
            <p>در حال جستجوی محتوای مناسب...</p>
          ) : contents.length > 0 ? (
            <div style={styles.contentGrid}>
              {contents.map((item) => (
                <div key={item.id} style={styles.contentCard}>
                  <div style={styles.contentIcon}>{item.type === 'video' ? '🎥' : '📄'}</div>
                  <h3>{item.title}</h3>
                  <p>{item.description?.substring(0, 60)}...</p>
                  <div style={styles.cardFooter}>
                    <span style={styles.timeTag}>⏱ {item.study_time} دقیقه</span>
                    <button style={styles.startBtn} onClick={() => navigate(`/content/${item.id}`)}>مطالعه</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>محتوایی یافت نشد.</div>
          )}
        </section>

        <aside style={styles.sidebar}>
          <div style={styles.statBox}>
            <h3>📊 آمار فعالیت</h3>
            <div style={styles.statItem}>
              <span>آزمون‌های گذرانده:</span>
              <strong>{user?.completed_exams || 0}</strong>
            </div>
            <div style={styles.statItem}>
              <span>آخرین نمره:</span>
              <strong style={{color: '#27ae60'}}>{user?.last_score || 0}/100</strong>
            </div>
            <button 
              style={styles.resultsLink} 
              onClick={() => navigate('/my-results')}
            >
              مشاهده کارنامه‌ها و پاسخ‌ها
            </button>
          </div>

          <div style={{...styles.statBox, marginTop: '20px', background: '#fff3cd'}}>
            <h3>💡 نکته شناختی</h3>
            <p style={{fontSize: '0.9rem', lineHeight: '1.6'}}>
              مطالعه مداوم محتواهای سطح {user?.cognitive_level} باعث تقویت حافظه کاری شما می‌شود.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

// شیء استایل کاملاً یکپارچه شده (بدون نیاز به گسترش متغیرهای دیگر)
const styles = {
  container: { direction: 'rtl', padding: '30px', fontFamily: 'Tahoma, Segoe UI', backgroundColor: '#f4f7f6', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  welcome: { fontSize: '1.8rem', color: '#2c3e50', margin: 0 },
  subText: { color: '#7f8c8d', marginTop: '5px' },
  levelCard: { background: '#fff', padding: '15px 25px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', textAlign: 'center' },
  levelLabel: { fontSize: '0.8rem', color: '#95a5a6', display: 'block' },
  levelNumber: { fontSize: '2rem', fontWeight: 'bold', color: '#3498db' },
  progressSection: { background: '#fff', padding: '20px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 'bold' },
  progressBarBg: { background: '#ecf0f1', height: '12px', borderRadius: '6px' },
  progressBarFill: { background: 'linear-gradient(90deg, #3498db, #2ecc71)', height: '100%', borderRadius: '6px', transition: 'width 1s ease-in-out' },
  mainGrid: { display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px' },
  sectionTitle: { fontSize: '1.3rem', marginBottom: '20px', color: '#2c3e50' },
  contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
  contentCard: { background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee' },
  contentIcon: { fontSize: '2rem', marginBottom: '10px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' },
  timeTag: { fontSize: '0.8rem', color: '#95a5a6' },
  startBtn: { padding: '8px 15px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  sidebar: { display: 'flex', flexDirection: 'column' },
  statBox: { background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #eee' },
  statItem: { display: 'flex', justifyContent: 'space-between', margin: '10px 0', fontSize: '0.9rem' },
  emptyState: { textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '15px', color: '#95a5a6' },
  
  // استایل‌های جدید مربوط به آزمون
  placementBanner: { background: 'linear-gradient(135deg, #f39c12, #e67e22)', color: '#fff', padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  placementBtn: { padding: '10px 20px', background: '#fff', color: '#e67e22', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  testGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' },
  testCard: { background: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #e0e6ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  testBtn: { background: '#27ae60', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' },
  resultsLink: { width: '100%', marginTop: '15px', background: 'none', border: '1px solid #3498db', color: '#3498db', padding: '8px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' },
};

export default StudentDashboard;