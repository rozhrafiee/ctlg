import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, FileText, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, pending

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/assessment/my-history/');
      setHistory(data);
    } catch (error) {
      console.error('خطا در دریافت تاریخچه:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return item.status === 'completed';
    if (filter === 'pending') return item.status === 'pending_review';
    return true;
  });

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return {
          label: 'تکمیل شده',
          color: 'bg-green-100 text-green-700',
          icon: CheckCircle,
        };
      case 'pending_review':
        return {
          label: 'در انتظار بررسی',
          color: 'bg-amber-100 text-amber-700',
          icon: Clock,
        };
      case 'in_progress':
        return {
          label: 'در حال انجام',
          color: 'bg-blue-100 text-blue-700',
          icon: AlertCircle,
        };
      default:
        return {
          label: 'نامشخص',
          color: 'bg-slate-100 text-slate-700',
          icon: FileText,
        };
    }
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">تاریخچه آزمون‌ها</h1>
          <p className="text-slate-600">مشاهده تمام آزمون‌هایی که شرکت کرده‌اید</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? 'bg-indigo-600' : ''}
          >
            همه ({history.length})
          </Button>
          <Button
            onClick={() => setFilter('completed')}
            variant={filter === 'completed' ? 'default' : 'outline'}
            className={filter === 'completed' ? 'bg-green-600' : ''}
          >
            تکمیل شده ({history.filter((h) => h.status === 'completed').length})
          </Button>
          <Button
            onClick={() => setFilter('pending')}
            variant={filter === 'pending' ? 'default' : 'outline'}
            className={filter === 'pending' ? 'bg-amber-600' : ''}
          >
            در انتظار ({history.filter((h) => h.status === 'pending_review').length})
          </Button>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">تاریخچه‌ای وجود ندارد</h2>
            <p className="text-slate-600">
              {filter === 'all'
                ? 'هنوز آزمونی نداده‌اید'
                : `هیچ آزمون ${
                    filter === 'completed' ? 'تکمیل شده' : 'در انتظار بررسی'
                  } وجود ندارد`}
            </p>
            {filter === 'all' && (
              <Link to="/student/tests">
                <Button className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-500">
                  مشاهده آزمون‌های موجود
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => {
              const statusInfo = getStatusInfo(item.status);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            item.status === 'completed'
                              ? 'bg-green-100'
                              : item.status === 'pending_review'
                              ? 'bg-amber-100'
                              : 'bg-slate-100'
                          }`}
                        >
                          <StatusIcon
                            className={`w-6 h-6 ${
                              item.status === 'completed'
                                ? 'text-green-600'
                                : item.status === 'pending_review'
                                ? 'text-amber-600'
                                : 'text-slate-600'
                            }`}
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {item.test_title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {item.finished_at
                                  ? new Date(item.finished_at).toLocaleDateString('fa-IR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })
                                  : 'نامشخص'}
                              </span>
                            </div>
                            {item.started_at && item.finished_at && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {Math.round(
                                    (new Date(item.finished_at) - new Date(item.started_at)) /
                                      1000 /
                                      60
                                  )}{' '}
                                  دقیقه
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>

                        {item.total_score !== null && item.total_score !== undefined && (
                          <div className="text-center">
                            <p className="text-3xl font-bold text-slate-900">
                              {item.total_score.toFixed(1)}
                            </p>
                            <p className="text-xs text-slate-600">نمره</p>
                          </div>
                        )}

                        <Link to={`/student/results/${item.id}`}>
                          <Button variant="outline" className="whitespace-nowrap">
                            مشاهده جزئیات
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Teacher Feedback */}
                    {item.teacher_feedback && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          بازخورد استاد:
                        </p>
                        <p className="text-sm text-blue-800">{item.teacher_feedback}</p>
                      </div>
                    )}
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

export default History;
