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
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
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

  // داده‌های نمودار آزمون‌ها
  const testScoresData = safeTestHistory
    .slice(0, 5)
    .reverse()
    .map(t => ({
      name: t.test?.title?.substring(0, 10) || 'آزمون',
      نمره: t.total_score || 0,
    }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ═════════════════════════════════════════════════════
          🎉 خوش‌آمدگویی
          ═════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">
          سلام {user?.first_name || 'کاربر'} عزیز! 👋
        </h1>
        <p className="opacity-90">
          آماده‌اید برای یادگیری امروز؟ بیایید از جایی که رها کردید ادامه دهیم.
        </p>
      </div>

      {/* ═════════════════════════════════════════════════════
          📊 آمار کلیدی
          ═════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">سطح شناختی</CardTitle>
            <Target className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.level || user?.cognitive_level || 1}
            </div>
            <p className="text-xs text-gray-500 mt-1">از 100</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${dashboard?.level || user?.cognitive_level || 1}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">محتوای تکمیل شده</CardTitle>
            <BookOpen className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.completed_count || 0}</div>
            <p className="text-xs text-gray-500 mt-1">محتوا</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">آزمون‌های گذرانده</CardTitle>
            <Award className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeTestHistory.length}</div>
            <p className="text-xs text-gray-500 mt-1">آزمون</p>
          </CardContent>
        </Card>
      </div>

      {/* ═════════════════════════════════════════════════════
          💡 پیشنهادات
          ═════════════════════════════════════════════════════ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            پیشنهادات ویژه برای شما
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!recommendations || recommendations.length === 0 ? (
            <EmptyState
              title="پیشنهادی موجود نیست"
              description="در حال حاضر محتوای پیشنهادی برای شما وجود ندارد. با تکمیل محتواها و آزمون‌ها، پیشنهادات جدید دریافت خواهید کرد."
              icon={BookOpen}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeRecommendations.slice(0, 4).map((rec) => (
                <Card key={rec.id} className="border-r-4 border-blue-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold flex-1">{rec.content_title}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {rec.recommendation_type === 'next_in_path' ? 'مسیر یادگیری' :
                         rec.recommendation_type === 'prerequisite' ? 'پیش‌نیاز' :
                         rec.recommendation_type === 'similar' ? 'مشابه' : 'پیشنهادی'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {rec.reason || 'این محتوا با توجه به سطح و علایق شما پیشنهاد شده است'}
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        markRecommendationClicked(rec.id);
                        navigate(`/student/content/${rec.content_id}`);
                      }}
                    >
                      شروع یادگیری
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═════════════════════════════════════════════════════
          🗺️ مسیر یادگیری
          ═════════════════════════════════════════════════════ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            مسیر یادگیری شما
          </CardTitle>
          {learningPath && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetLearningPath}
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              بازنشانی
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!learningPath || !learningPath.items ? (
            <EmptyState
              title="مسیر یادگیری فعالی وجود ندارد"
              description="برای دریافت مسیر یادگیری شخصی‌سازی شده، روی دکمه بازنشانی کلیک کنید"
              icon={TrendingUp}
            />
          ) : (
            <div className="space-y-3">
              <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900">{learningPath.name}</h3>
                <p className="text-sm text-purple-700 mt-1">
                  {learningPath.items.filter(i => i.is_completed).length} از {learningPath.items.length} تکمیل شده
                </p>
              </div>
              {learningPath.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center p-4 rounded-lg border transition-all ${
                    item.is_completed
                      ? 'bg-green-50 border-green-300'
                      : item.is_unlocked
                      ? 'bg-blue-50 border-blue-300 hover:shadow'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center font-bold text-sm mr-3"
                       style={{
                         borderColor: item.is_completed ? '#22c55e' : item.is_unlocked ? '#3b82f6' : '#9ca3af'
                       }}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.content_title}</h4>
                      {item.is_completed && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                          ✓ تکمیل شده
                        </span>
                      )}
                      {!item.is_unlocked && (
                        <span className="text-xs bg-gray-400 text-white px-2 py-0.5 rounded-full">
                          🔒 قفل
                        </span>
                      )}
                    </div>
                  </div>
                  {item.is_unlocked && !item.is_completed && (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/student/content/${item.content_id}`)}
                    >
                      ادامه
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═════════════════════════════════════════════════════
          📈 نمودارها
          ═════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* نمودار پیشرفت محتوا */}
        <Card>
          <CardHeader>
            <CardTitle>روند پیشرفت محتوا</CardTitle>
          </CardHeader>
          <CardContent>
            {progressChartData.length > 0 ? (
              <CustomLineChart
                data={progressChartData}
                dataKey="پیشرفت"
                height={250}
              />
            ) : (
              <EmptyState
                title="داده‌ای موجود نیست"
                description="پس از تکمیل محتوا، نمودار پیشرفت شما نمایش داده می‌شود"
              />
            )}
          </CardContent>
        </Card>

        {/* نمودار نمرات آزمون */}
        <Card>
          <CardHeader>
            <CardTitle>عملکرد آزمون‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {testScoresData.length > 0 ? (
              <CustomBarChart
                data={testScoresData}
                dataKey="نمره"
                height={250}
              />
            ) : (
              <EmptyState
                title="آزمونی داده نشده"
                description="پس از شرکت در آزمون‌ها، نمودار عملکرد شما نمایش داده می‌شود"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* نمودار توزیع فعالیت */}
      <Card>
        <CardHeader>
          <CardTitle>توزیع فعالیت‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomPieChart data={activityDistribution} height={300} />
        </CardContent>
      </Card>

      {/* ═════════════════════════════════════════════════════
          🎯 آزمون‌های موجود
          ═════════════════════════════════════════════════════ */}
      {safeAvailableTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              آزمون‌های موجود
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeAvailableTests.slice(0, 4).map((test) => (
                <Card key={test.id} className="border-r-4 border-orange-500">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{test.title}</h3>
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <p>⏱️ مدت: {test.time_limit_minutes} دقیقه</p>
                      <p>📊 سطح: {test.min_level} تا {test.max_level}</p>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/student/test/${test.id}`)}
                    >
                      شروع آزمون
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentDashboard;
