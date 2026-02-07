import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';
import { useAssessment } from '@/hooks/useAssessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Chart as CustomLineChart, ChartBar as CustomBarChart, ChartPie as CustomPieChart } from '@/components/ui/Chart';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { BookOpen, Target, TrendingUp, RefreshCw, Award, Clock } from 'lucide-react';
import ModernNavbar from '@/components/layout/ModernNavbar';
import '@/styles/dashboard-modern-fixed.css'
import "@/styles/global-styles.css";
import "@/styles/page-styles.css"

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    dashboard,
    recommendations,
    learningPath,
    progress,
    isLoading: adaptiveLoading,
    resetLearningPath,
    markRecommendationClicked,
  } = useAdaptiveLearning();

  const {
    availableTests,
    testHistory,
    isLoading: testLoading,
  } = useAssessment();

  const isLoading = adaptiveLoading === true || testLoading === true;

  // ═════════════════════════════════════════════════════
  // 🎨 Loading State
  // ═════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <>
        <ModernNavbar user={user} />
        <div className="dashboard-wrapper">
          <div className="stats-grid">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </>
    );
  }

  // ═════════════════════════════════════════════════════
  // 📊 آماده‌سازی داده‌های نمودارها
  // ═════════════════════════════════════════════════════
  const safeProgress = Array.isArray(progress) ? progress : [];
  const safeTestHistory = Array.isArray(testHistory) ? testHistory : [];
  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];
  const safeAvailableTests = Array.isArray(availableTests) ? availableTests : [];

  const progressChartData = safeProgress
    .filter(p => p.is_completed)
    .slice(-7)
    .map(p => ({
      name: p.content_title?.substring(0, 15) || 'محتوا',
      پیشرفت: p.progress_percent,
    }));

  const activityDistribution = [
    { name: 'تکمیل شده', value: dashboard?.completed_count || 0 },
    { 
      name: 'در حال انجام', 
      value: safeProgress.filter(p => !p.is_completed && p.progress_percent > 0).length 
    },
  ];

  const testScoresData = safeTestHistory
    .slice(0, 5)
    .reverse()
    .map(t => ({
      name: t.test?.title?.substring(0, 10) || 'آزمون',
      نمره: t.total_score || 0,
    }));

  return (
    <>
      {/* Navigation Bar */}
      <ModernNavbar user={user} />
      
      {/* Dashboard Content */}
      <div className="dashboard-wrapper">
        
        {/* ═════════════════════════════════════════════════════
            🎉 خوش‌آمدگویی
            ═════════════════════════════════════════════════════ */}
        <div className="dashboard-header fade-in-up">
          <h1 className="dashboard-title">
            سلام {user?.first_name || 'کاربر'} عزیز! 👋
          </h1>
          <p className="dashboard-subtitle">
            آماده‌اید برای یادگیری امروز؟ بیایید از جایی که رها کردید ادامه دهیم.
          </p>
        </div>

        {/* ═════════════════════════════════════════════════════
            📊 آمار کلیدی
            ═════════════════════════════════════════════════════ */}
        <div className="stats-grid">
          <div className="stat-card fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="stat-icon blue">
              <Target />
            </div>
            <div className="stat-label">سطح شناختی</div>
            <div className="stat-value">{dashboard?.level || user?.cognitive_level || 1}</div>
            <span className="stat-change positive">از 100</span>
          </div>

          <div className="stat-card fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="stat-icon green">
              <BookOpen />
            </div>
            <div className="stat-label">محتوای تکمیل شده</div>
            <div className="stat-value">{dashboard?.completed_count || 0}</div>
            <span className="stat-change positive">محتوا</span>
          </div>

          <div className="stat-card fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="stat-icon purple">
              <Award />
            </div>
            <div className="stat-label">آزمون‌های گذرانده</div>
            <div className="stat-value">{safeTestHistory.length}</div>
            <span className="stat-change positive">آزمون</span>
          </div>

          <div className="stat-card fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="stat-icon orange">
              <TrendingUp />
            </div>
            <div className="stat-label">پیشرفت کلی</div>
            <div className="stat-value">
              {Math.round((dashboard?.completed_count || 0) / Math.max(safeProgress.length, 1) * 100)}%
            </div>
            <span className="stat-change positive">↑ +12%</span>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════
            💡 پیشنهادات
            ═════════════════════════════════════════════════════ */}
        <div className="dashboard-section fade-in-up" style={{animationDelay: '0.5s'}}>
          <div className="section-header">
            <h2 className="section-title">
              <BookOpen className="inline-block ml-2" size={24} />
              پیشنهادات ویژه برای شما
            </h2>
          </div>
          
          {!recommendations || recommendations.length === 0 ? (
            <EmptyState
              title="پیشنهادی موجود نیست"
              description="در حال حاضر محتوای پیشنهادی برای شما وجود ندارد."
              icon={BookOpen}
            />
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
              {safeRecommendations.slice(0, 4).map((rec) => (
                <div 
                  key={rec.id} 
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                    <h4 style={{color: 'white', fontWeight: '600'}}>{rec.content_title}</h4>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#60a5fa',
                      borderRadius: '6px'
                    }}>
                      {rec.recommendation_type === 'next_in_path' ? 'مسیر' :
                       rec.recommendation_type === 'prerequisite' ? 'پیش‌نیاز' : 'پیشنهادی'}
                    </span>
                  </div>
                  <p style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem'}}>
                    {rec.reason || 'پیشنهاد شده'}
                  </p>
                  <Button
                    size="sm"
                    style={{width: '100%'}}
                    onClick={() => {
                      markRecommendationClicked(rec.id);
                      navigate(`/student/content/${rec.content_id || rec.content?.id}`);
                    }}
                  >
                    شروع یادگیری →
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════
            🗺️ مسیر یادگیری
            ═════════════════════════════════════════════════════ */}
        <div className="dashboard-section fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="section-header">
            <h2 className="section-title">
              <TrendingUp className="inline-block ml-2" size={24} />
              مسیر یادگیری شما
            </h2>
            {learningPath && (
              <Button variant="outline" size="sm" onClick={resetLearningPath}>
                <RefreshCw className="ml-2" size={16} />
                بازنشانی
              </Button>
            )}
          </div>

          {!learningPath || !learningPath.items ? (
            <EmptyState
              title="مسیر یادگیری فعالی وجود ندارد"
              description="برای دریافت مسیر یادگیری شخصی‌سازی شده، روی دکمه بازنشانی کلیک کنید"
              icon={TrendingUp}
            />
          ) : (
            <div style={{padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', marginBottom: '1rem'}}>
              <h3 style={{color: 'white', marginBottom: '0.5rem'}}>{learningPath.name}</h3>
              <div style={{background: 'rgba(255,255,255,0.1)', height: '12px', borderRadius: '20px', overflow: 'hidden'}}>
                <div style={{
                  width: `${(learningPath.items.filter(i => i.is_completed).length / learningPath.items.length) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #6d28d9 100%)',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
              <p style={{marginTop: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem'}}>
                {learningPath.items.filter(i => i.is_completed).length} از {learningPath.items.length} تکمیل شده
              </p>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════
            📈 نمودارها
            ═════════════════════════════════════════════════════ */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem'}}>
          <Card>
            <CardHeader>
              <CardTitle>روند پیشرفت محتوا</CardTitle>
            </CardHeader>
            <CardContent>
              {progressChartData.length > 0 ? (
                <CustomLineChart data={progressChartData} dataKey="پیشرفت" height={250} />
              ) : (
                <EmptyState title="داده‌ای موجود نیست" description="پس از تکمیل محتوا نمایش داده می‌شود" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>عملکرد آزمون‌ها</CardTitle>
            </CardHeader>
            <CardContent>
              {testScoresData.length > 0 ? (
                <CustomBarChart data={testScoresData} dataKey="نمره" height={250} />
              ) : (
                <EmptyState title="آزمونی داده نشده" description="پس از شرکت در آزمون نمایش داده می‌شود" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* ═════════════════════════════════════════════════════
            🎯 آزمون‌های موجود
            ═════════════════════════════════════════════════════ */}
        {safeAvailableTests.length > 0 && (
          <div className="dashboard-section fade-in-up" style={{animationDelay: '0.7s'}}>
            <div className="section-header">
              <h2 className="section-title">
                <Clock className="inline-block ml-2" size={24} />
                آزمون‌های موجود
              </h2>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
              {safeAvailableTests.slice(0, 4).map((test) => (
                <div key={test.id} style={{
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '2px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '16px'
                }}>
                  <h3 style={{color: 'white', marginBottom: '0.5rem', fontWeight: '600'}}>{test.title}</h3>
                  <p style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem'}}>
                    ⏱️ {test.time_limit_minutes} دقیقه | 📊 سطح {test.min_level}-{test.max_level}
                  </p>
                  <Button
                    size="sm"
                    style={{width: '100%'}}
                    onClick={() => navigate(`/student/tests/${test.id}/take`)}
                  >
                    شروع آزمون
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentDashboard;
