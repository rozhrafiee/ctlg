import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, BookOpen, Play, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import "@/styles/global-styles.css";
import "@/styles/page-styles.css";

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
    fetchHistory();
  }, []);

  const fetchTests = async () => {
    try {
      const { data } = await api.get('/assessment/tests/');
      setTests(data);
    } catch (error) {
      console.error('خطا در دریافت آزمون‌ها:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/assessment/my-history/');
      setHistory(data);
    } catch (error) {
      console.error('خطا در دریافت تاریخچه:', error);
    }
  };

  const hasAttempted = (testId) => {
    return history.some((h) => h.test === testId);
  };

  const getLastAttempt = (testId) => {
    const attempts = history.filter((h) => h.test === testId);
    if (attempts.length === 0) return null;
    return attempts.reduce((latest, current) =>
      new Date(current.finished_at) > new Date(latest.finished_at) ? current : latest
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">آزمون‌های قابل دسترس</h1>
          <p className="text-slate-600 mt-2">
            آزمون‌های مناسب سطح فعلی شما ({tests.length} آزمون)
          </p>
        </div>

        {tests.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">آزمونی موجود نیست</h2>
            <p className="text-slate-600">
              در حال حاضر آزمونی برای سطح شما موجود نیست
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => {
              const lastAttempt = getLastAttempt(test.id);
              const attempted = hasAttempted(test.id);

              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-6 bg-white h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <Badge
                        className={
                          test.test_type === 'placement'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }
                      >
                        {test.test_type === 'placement' ? 'تعیین سطح' : 'آزمون محتوا'}
                      </Badge>
                      {attempted && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                      {test.title}
                    </h3>

                    {test.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-grow">
                        {test.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{test.time_limit_minutes} دقیقه</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Target className="w-4 h-4" />
                        <span>حداقل سطح: {test.min_level}</span>
                      </div>
                    </div>

                    {lastAttempt && (
                      <div className="bg-slate-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-slate-600 mb-1">آخرین تلاش:</p>
                        <div className="flex items-center justify-between">
                          <Badge
                            className={
                              lastAttempt.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : lastAttempt.status === 'pending_review'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                            }
                          >
                            {lastAttempt.status === 'completed'
                              ? 'تکمیل شده'
                              : lastAttempt.status === 'pending_review'
                              ? 'در انتظار بررسی'
                              : 'در حال انجام'}
                          </Badge>
                          {lastAttempt.total_score && (
                            <span className="text-sm font-bold text-slate-900">
                              {lastAttempt.total_score.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <Link to={`/student/tests/${test.id}/take`} className="mt-auto">
                      <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                        <Play className="w-4 h-4 ml-2" />
                        {attempted ? 'تلاش مجدد' : 'شروع آزمون'}
                      </Button>
                    </Link>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Tests;
