import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, FileText, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Dashboard from '../student/Dashboard';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    totalTests: 0,
    totalContent: 0,
    pendingReviews: 0,
  });
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/assessment/teacher/tests/all/'),
      api.get('/adaptive-learning/teacher/contents/'),
      api.get('/assessment/teacher/reviews/pending/'),
    ])
      .then(([tests, contents, pending]) => {
        setStats({
          totalTests: tests.data.length,
          totalContent: contents.data.length,
          pendingReviews: pending.data.length,
        });
        setRecentTests(tests.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ icon: Icon, label, value, color, link }) => (
    <Link to={link}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-r-4 ${color} cursor-pointer transition-all hover:shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{label}</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
          </div>
          <Icon className="w-12 h-12 text-gray-400 opacity-50" />
        </div>
      </motion.div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          داشبورد استاد
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          مدیریت محتوا، آزمون‌ها و تصحیح دانشجویان
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={FileText}
          label="تعداد آزمون‌ها"
          value={stats.totalTests}
          color="border-blue-600"
          link="/teacher/tests"
        />
        <StatCard
          icon={BookOpen}
          label="تعداد محتواها"
          value={stats.totalContent}
          color="border-green-600"
          link="/teacher/content"
        />
        <StatCard
          icon={AlertCircle}
          label="در انتظار تصحیح"
          value={stats.pendingReviews}
          color="border-red-600"
          link="/teacher/grading"
        />
      </div>

      {/* Recent Tests */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Clock className="ml-2 w-6 h-6 text-blue-600" />
          آخرین آزمون‌ها
        </h2>

        {recentTests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">هنوز آزمونی ایجاد نکرده‌اید</p>
        ) : (
          <div className="space-y-3">
            {recentTests.map((test) => (
              <motion.div
                key={test.id}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{test.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    نوع: {test.test_type === 'placement' ? 'تعیین سطح' : 'محتوایی'}
                  </p>
                </div>
                <Link
                  to={`/teacher/tests/${test.id}/questions`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  مشاهده سوالات
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Link to="/teacher/tests/create">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 space-x-reverse"
          >
            <FileText className="w-5 h-5" />
            <span className="font-semibold">ایجاد آزمون جدید</span>
          </motion.button>
        </Link>

        <Link to="/teacher/content/create">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 space-x-reverse"
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold">ایجاد محتوا جدید</span>
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
export default Dashboard;