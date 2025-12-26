import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { useAuthStore } from "../../store/authStore";

interface TestItem {
  id: number;
  title: string;
  description: string;
  min_level: number;
  max_level: number;
  is_active: boolean;
  is_placement_test: boolean;
  total_questions: number;
  passing_score: number;
  time_limit_minutes: number;
  related_content_info?: {
    id: number;
    title: string;
    content_type: string;
  };
  questions_count: number;
  sessions_count: number;
}

export default function TestsListPage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'placement' | 'content'>('all');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    loadTests();
  }, [activeTab]);

  const loadTests = async () => {
    try {
      setLoading(true);
      const endpoint = "/api/assessment/tests/";
      const res = await api.get(endpoint);
      
      // فیلتر کردن بر اساس تب فعال
      let filteredTests = res.data;
      
      if (activeTab === 'placement') {
        filteredTests = res.data.filter((t: TestItem) => t.is_placement_test);
      } else if (activeTab === 'content') {
        filteredTests = res.data.filter((t: TestItem) => t.related_content_info);
      }
      
      setTests(filteredTests);
    } catch (err) {
      console.error("خطا در بارگذاری آزمون‌ها:", err);
      setError("خطا در بارگذاری آزمون‌ها");
    } finally {
      setLoading(false);
    }
  };

  const getTestTypeBadge = (test: TestItem) => {
    if (test.is_placement_test) {
      return { text: "تعیین سطح", color: "#d1ecf1", textColor: "#0c5460" };
    } else if (test.related_content_info) {
      return { text: "آزمون محتوا", color: "#d4edda", textColor: "#155724" };
    } else {
      return { text: "عمومی", color: "#f8f9fa", textColor: "#495057" };
    }
  };

  const handleStartTest = async (testId: number, isPlacement: boolean) => {
    if (isPlacement) {
      navigate(`/placement-test`);
      return;
    }

    try {
      const res = await api.post(`/api/assessment/tests/${testId}/start/`);
      if (res.data.session_id) {
        navigate(`/test/${res.data.session_id}`);
      }
    } catch (err: any) {
      if (err.response?.data?.detail) {
        alert(err.response.data.detail);
      } else {
        alert("خطا در شروع آزمون");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div className="spinner"></div>
        <p>در حال بارگذاری آزمون‌ها...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>آزمون‌های در دسترس</h2>
      
      {error && (
        <div style={{
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "15px",
          borderRadius: "6px",
          marginBottom: "20px",
          border: "1px solid #f5c6cb"
        }}>
          {error}
        </div>
      )}

      {/* تب‌های فیلتر */}
      <div style={{ marginBottom: "30px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === 'all' ? "#0d6efd" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          همه آزمون‌ها
        </button>
        <button
          onClick={() => setActiveTab('placement')}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === 'placement' ? "#0d6efd" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          آزمون تعیین سطح
        </button>
        <button
          onClick={() => setActiveTab('content')}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === 'content' ? "#0d6efd" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          آزمون‌های محتوا
        </button>
        <Link
          to="/student/dashboard"
          style={{
            padding: "10px 20px",
            backgroundColor: "#20c997",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            fontSize: "16px",
            marginLeft: "auto"
          }}
        >
          📊 داشبورد آموزشی
        </Link>
      </div>

      {/* پیام اگر آزمون تعیین سطح نداده‌اید */}
      {!user?.has_taken_placement_test && activeTab === 'all' && (
        <div style={{
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "25px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ fontSize: "24px" }}>⚠️</div>
            <div>
              <h4 style={{ margin: "0 0 10px 0", color: "#856404" }}>
                آزمون تعیین سطح را تکمیل نکرده‌اید
              </h4>
              <p style={{ margin: 0, color: "#856404" }}>
                برای دریافت محتواها و آزمون‌های متناسب با سطح خود، ابتدا آزمون تعیین سطح را بدهید.
              </p>
              <button
                onClick={() => navigate('/placement-test')}
                style={{
                  marginTop: "15px",
                  padding: "8px 16px",
                  backgroundColor: "#ffc107",
                  color: "#212529",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                شروع آزمون تعیین سطح
              </button>
            </div>
          </div>
        </div>
      )}

      {/* لیست آزمون‌ها */}
      {tests.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 40px",
          backgroundColor: "#f8f9fa",
          borderRadius: "10px",
          border: "2px dashed #dee2e6"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "20px", color: "#6c757d" }}>📝</div>
          <h3 style={{ color: "#6c757d", marginBottom: "10px" }}>
            {activeTab === 'placement' ? 'آزمون تعیین سطح یافت نشد' : 
             activeTab === 'content' ? 'آزمون محتوا یافت نشد' : 'هیچ آزمونی یافت نشد'}
          </h3>
          <p style={{ color: "#6c757d" }}>
            {activeTab === 'content' ? 
              'هنوز برای محتواهای شما آزمونی ایجاد نشده است.' : 
              'لطفاً بعداً مراجعه کنید.'}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "25px" }}>
          {tests.map((test) => {
            const badge = getTestTypeBadge(test);
            const canTakeTest = !test.is_placement_test || !user?.has_taken_placement_test;
            
            return (
              <div key={test.id} style={{
                backgroundColor: "white",
                borderRadius: "10px",
                padding: "25px",
                border: `2px solid ${test.is_active ? "#28a745" : "#dc3545"}`,
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                opacity: test.is_active ? 1 : 0.7
              }}>
                <div style={{ marginBottom: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <h3 style={{ margin: 0, color: "#333", fontSize: "18px", flex: 1 }}>
                      {test.title}
                    </h3>
                    <span style={{
                      backgroundColor: badge.color,
                      color: badge.textColor,
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      marginLeft: "10px"
                    }}>
                      {badge.text}
                    </span>
                  </div>
                  
                  <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.5", marginBottom: "10px" }}>
                    {test.description}
                  </p>
                  
                  {/* اطلاعات محتوای مرتبط */}
                  {test.related_content_info && (
                    <div style={{
                      backgroundColor: "#e7f3ff",
                      padding: "10px",
                      borderRadius: "6px",
                      marginBottom: "10px",
                      border: "1px solid #b6d4fe"
                    }}>
                      <div style={{ fontSize: "13px", color: "#084298", fontWeight: "bold" }}>
                        📚 محتوای مرتبط:
                      </div>
                      <div style={{ fontSize: "14px", color: "#495057", marginTop: "5px" }}>
                        {test.related_content_info.title}
                      </div>
                      <Link
                        to={`/content/${test.related_content_info.id}`}
                        style={{
                          fontSize: "12px",
                          color: "#0d6efd",
                          textDecoration: "none",
                          marginTop: "5px",
                          display: "inline-block"
                        }}
                      >
                        مشاهده محتوا →
                      </Link>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                    <span style={{
                      backgroundColor: "#f8f9fa",
                      color: "#495057",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}>
                      🎯 سطح: {test.min_level} - {test.max_level}
                    </span>
                    
                    <span style={{
                      backgroundColor: "#e7f3ff",
                      color: "#084298",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}>
                      📝 {test.questions_count || test.total_questions} سوال
                    </span>
                    
                    <span style={{
                      backgroundColor: "#d4edda",
                      color: "#155724",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}>
                      ⏱️ {test.time_limit_minutes} دقیقه
                    </span>
                  </div>
                  
                  <div style={{ fontSize: "13px", color: "#868e96" }}>
                    <div>حداقل نمره قبولی: {test.passing_score}%</div>
                    <div>تعداد شرکت‌کنندگان: {test.sessions_count}</div>
                  </div>
                </div>

                <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => handleStartTest(test.id, test.is_placement_test)}
                    disabled={!test.is_active || !canTakeTest}
                    style={{
                      flex: 1,
                      padding: "10px 15px",
                      backgroundColor: !test.is_active ? "#6c757d" : 
                                      test.is_placement_test && user?.has_taken_placement_test ? "#6c757d" : "#0d6efd",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: test.is_active && canTakeTest ? "pointer" : "not-allowed",
                      fontSize: "15px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                    title={!test.is_active ? "این آزمون غیرفعال است" : 
                           test.is_placement_test && user?.has_taken_placement_test ? "شما قبلاً آزمون تعیین سطح داده‌اید" : ""}
                  >
                    {test.is_placement_test ? "🎯 آزمون تعیین سطح" : "🚀 شروع آزمون"}
                  </button>
                  
                  {!test.is_placement_test && (
                    <button
                      onClick={() => navigate(`/test-info/${test.id}`)}
                      style={{
                        padding: "10px 15px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "15px"
                      }}
                    >
                      اطلاعات بیشتر
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* اطلاعات سطح کاربر */}
      {user && (
        <div style={{
          marginTop: "40px",
          padding: "20px",
          backgroundColor: "#e7f3ff",
          borderRadius: "10px",
          border: "1px solid #b6d4fe"
        }}>
          <h3 style={{ color: "#084298", marginBottom: "15px" }}>📊 اطلاعات سطح شما</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "14px", color: "#495057" }}>سطح فعلی</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#0d6efd" }}>
                {user.cognitive_level || 1}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#495057" }}>آزمون تعیین سطح</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: user.has_taken_placement_test ? "#28a745" : "#dc3545" }}>
                {user.has_taken_placement_test ? "✓ انجام شده" : "⨯ انجام نشده"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#495057" }}>توصیه ما</div>
              <div style={{ fontSize: "16px", color: "#495057", fontWeight: "bold" }}>
                {!user.has_taken_placement_test ? "ابتدا آزمون تعیین سطح بدهید" : 
                 "آزمون‌های سطح خود را انجام دهید"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}