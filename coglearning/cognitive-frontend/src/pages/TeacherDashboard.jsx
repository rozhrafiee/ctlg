import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentAPI } from "../services/api"; // اطمینان حاصل کنید که این Import درست است
import { useAuth } from "../contexts/AuthContext";

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [tests, setTests] = useState([]);
  const [stats, setStats] = useState({ pendingReviews: 0, totalStudents: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    // تابعی برای فراخوانی امن داده‌ها
    const fetchData = async () => {
      try {
        // چک کردن وجود تابع قبل از فراخوانی برای جلوگیری از TypeError
        if (assessmentAPI && typeof assessmentAPI.listTests === 'function') {
          const testRes = await assessmentAPI.listTests();
          setTests(testRes.data || []);
        }

        if (assessmentAPI && typeof assessmentAPI.getPendingEssays === 'function') {
          const pendingRes = await assessmentAPI.getPendingEssays();
          setStats(prev => ({ 
            ...prev, 
            pendingReviews: pendingRes.data?.length || 0 
          }));
        }
      } catch (err) {
        console.error("خطا در بارگذاری داده‌های داشبورد:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={styles.container}>
      {/* هدر داشبورد */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>پنل تخصصی اساتید</h1>
          <p style={styles.subTitle}>خوش آمدید استاد <strong>{user?.username || 'گرامی'}</strong> عزیز</p>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>خروج از سامانه</button>
      </header>

      {/* بخش کارت‌های آماری */}
      <section style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderRight: '5px solid #3498db' }}>
          <h3 style={styles.statNumber}>{tests.length}</h3>
          <p style={styles.statLabel}>آزمون‌های طراحی شده</p>
        </div>
        <div style={{ ...styles.statCard, borderRight: '5px solid #e67e22' }}>
          <h3 style={styles.statNumber}>{stats.pendingReviews}</h3>
          <p style={styles.statLabel}>نیاز به تصحیح (تشریحی)</p>
        </div>
        <div style={{ ...styles.statCard, borderRight: '5px solid #2ecc71' }}>
          <h3 style={styles.statNumber}>{user?.students_count || 0}</h3>
          <p style={styles.statLabel}>دانشجویان فعال</p>
        </div>
      </section>

      {/* بخش دسترسی سریع (Quick Actions) */}
      <section style={styles.actionSection}>
        <h3 style={styles.sectionTitle}>دسترسی سریع</h3>
        <div style={styles.actionGrid}>
          <button onClick={() => navigate("/add-test")} style={styles.actionBtnPrimary}>
            ➕ ساخت آزمون جدید
          </button>
          <button onClick={() => navigate("/teacher/reviews")} style={styles.actionBtnSecondary}>
            📝 تصحیح پاسخ‌های تشریحی
          </button>
          <button onClick={() => navigate("/teacher/tests")} style={styles.actionBtnOutline}>
            ⚙️ مدیریت کل آزمون‌ها
          </button>
          <button onClick={() => alert("بخش مدیریت محتوا به زودی اضافه می‌شود")} style={styles.actionBtnOutline}>
            🎬 بارگذاری محتوای آموزشی
          </button>
        </div>
      </section>

      {/* لیست آخرین آزمون‌ها */}
      <section style={{ marginTop: "40px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={styles.sectionTitle}>آخرین آزمون‌های شما در سیستم</h3>
          <button onClick={() => navigate("/teacher/tests")} style={styles.linkBtn}>مشاهده همه</button>
        </div>
        
        <div style={styles.testGrid}>
          {tests && tests.length > 0 ? (
            tests.slice(0, 4).map(test => (
              <div key={test.id} style={styles.testCard}>
                <div style={styles.testBadge}>
                  {test.test_type === 'placement' ? 'تعیین سطح' : 'کلاسی'}
                </div>
                <h4 style={styles.testTitle}>{test.title}</h4>
                <div style={styles.testInfo}>
                  <span>🔢 {test.questions_count || 0} سوال</span>
                  <span>📊 سطح {test.min_level || 1} تا {test.max_level || 10}</span>
                </div>
                <button 
                  onClick={() => navigate(`/edit-test/${test.id}`)} 
                  style={styles.editBtn}
                >
                  ویرایش و جزئیات
                </button>
              </div>
            ))
          ) : (
            <div style={styles.noData}>
              <p>هنوز آزمونی ثبت نکرده‌اید.</p>
              <button onClick={() => navigate("/add-test")} style={styles.smallAddBtn}>همین حالا بسازید</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: { direction: "rtl", padding: "30px", fontFamily: "Tahoma, Arial", backgroundColor: "#fcfcfc", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eee", paddingBottom: "20px" },
  title: { margin: 0, color: "#2c3e50", fontSize: '1.8rem' },
  subTitle: { margin: "5px 0 0 0", color: "#7f8c8d" },
  logoutBtn: { padding: "10px 20px", background: "none", border: "1px solid #e74c3c", color: "#e74c3c", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: '0.3s' },
  
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", margin: "30px 0" },
  statCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.02)", textAlign: "center" },
  statNumber: { margin: '0', fontSize: '2rem', color: '#2c3e50' },
  statLabel: { margin: '5px 0 0 0', color: '#95a5a6', fontSize: '0.9rem' },
  
  actionSection: { background: "#fff", padding: "25px", borderRadius: "15px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  sectionTitle: { margin: "0 0 20px 0", color: "#34495e" },
  actionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" },
  
  actionBtnPrimary: { padding: "15px", background: "#2ecc71", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" },
  actionBtnSecondary: { padding: "15px", background: "#3498db", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" },
  actionBtnOutline: { padding: "15px", background: "#fff", color: "#34495e", border: "1px solid #ddd", borderRadius: "10px", cursor: "pointer" },

  testGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginTop: "20px" },
  testCard: { position: 'relative', background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee", transition: "0.3s shadow" },
  testBadge: { position: 'absolute', top: '10px', left: '10px', fontSize: '0.7rem', background: '#e1f5fe', color: '#0288d1', padding: '3px 8px', borderRadius: '10px' },
  testTitle: { margin: "15px 0 10px 0", fontSize: "1.1rem", color: '#2c3e50' },
  testInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '15px' },
  editBtn: { width: "100%", padding: "10px", background: "#f8f9fa", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", transition: '0.2s' },
  
  linkBtn: { background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', fontWeight: 'bold' },
  noData: { color: "#95a5a6", textAlign: 'center', gridColumn: '1/-1', padding: '40px' },
  smallAddBtn: { marginTop: '10px', padding: '8px 15px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default TeacherDashboard;