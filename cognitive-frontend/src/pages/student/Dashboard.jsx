import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Target, TrendingUp, Award, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchRecommendations();
    fetchHistory();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/adaptive/dashboard/');
      setDashboardData(data);
    } catch (error) {
      console.error('خطا در دریافت داده‌های داشبورد:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data } = await api.get('/adaptive/recommendations/');
      setRecommendations(data.slice(0, 3));
    } catch (error) {
      console.error('خطا در دریافت پیشنهادها:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/assessment/my-history/');
      setHistory(data.slice(0, 5));
    } catch (error) {
      console.error('خطا در دریافت تاریخچه:', error);
    }
  };

  const handleRecommendationClick = async (recId) => {
    try {
      await api.post(`/adaptive/recommendations/${recId}/click/`);
    } catch (error) {
      console.error('خطا در ثبت کلیک:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const chartData = history.map((item, idx) => ({
    name: `آزمون ${idx + 1}`,
    score: item.total_score || 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">داشبورد یادگیری</h1>
            <p className="text-slate-600 mt-1">پیشرفت و عملکرد شما</p>
          </div>
          <Badge className="px-4 py-2 text-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            سطح {dashboardData?.level || 1}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">سطح فعلی</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardData?.level || 1}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">محتوای تکمیل شده</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardData?.completed_count || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">آزمون‌های شرکت کرده</p>
                <p className="text-2xl font-bold text-slate-900">{history.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">مسیر یادگیری</p>
                <p className="text-2xl font-bold text-slate-900">
                  {dashboardData?.active_path ? 'فعال' : 'غیرفعال'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <Card className="lg:col-span-2 p-6 bg-white">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">روند عملکرد</h2>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400">
                هنوز آزمونی نداده‌اید
              </div>
            )}
          </Card>

          {/* Recommendations */}
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">پیشنهادها</h2>
            </div>
            <div className="space-y-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <Link
                    key={rec.id}
                    to={`/student/content/${rec.content.id}`}
                    onClick={() => handleRecommendationClick(rec.id)}
                    className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-slate-900 text-sm">{rec.content.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="text-xs bg-indigo-100 text-indigo-700">
                        سطح {rec.content.min_level}-{rec.content.max_level}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        اولویت: {rec.priority_weight}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">
                  پیشنهادی موجود نیست
                </p>
              )}
            </div>
            <Link to="/student/learning-path">
              <Button className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500">
                مشاهده مسیر یادگیری
              </Button>
            </Link>
          </Card>
        </div>

        {/* Recent Tests */}
        <Card className="p-6 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">آزمون‌های اخیر</h2>
          </div>
          <div className="space-y-2">
            {history.length > 0 ? (
              history.map((item) => (
                <Link
                  key={item.id}
                  to={`/student/results/${item.id}`}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.status === 'completed'
                          ? 'bg-green-500'
                          : item.status === 'pending_review'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-slate-900">{item.test_title}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(item.finished_at).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        item.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'pending_review'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }
                    >
                      {item.status === 'completed'
                        ? 'تکمیل شده'
                        : item.status === 'pending_review'
                        ? 'در انتظار بررسی'
                        : 'در حال انجام'}
                    </Badge>
                    {item.total_score && (
                      <span className="font-bold text-slate-900">{item.total_score.toFixed(1)}%</span>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-slate-500 py-8">هنوز آزمونی نداده‌اید</p>
            )}
          </div>
          <Link to="/student/history">
            <Button variant="outline" className="w-full mt-4">
              مشاهده تاریخچه کامل
            </Button>
          </Link>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
