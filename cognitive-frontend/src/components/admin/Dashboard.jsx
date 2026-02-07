import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../api/axios";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContent: 0,
    totalTests: 0,
    pendingReviews: 0,
    levelDistribution: [],
    roleDistribution: [],
    recentActivity: []
  });

  useEffect(() => {
    Promise.all([
      api.get("/users/"),
      api.get("/adaptive/teacher/content/"),
      api.get("/assessment/teacher/tests/"),
      api.get("/assessment/reviews/pending/")
    ]).then(([users, content, tests, reviews]) => {
      
      const levelDist = {};
      users.data.forEach(u => {
        const bracket = Math.floor(u.cognitive_level / 10) * 10;
        levelDist[bracket] = (levelDist[bracket] || 0) + 1;
      });

      const roleDist = {};
      users.data.forEach(u => {
        roleDist[u.role] = (roleDist[u.role] || 0) + 1;
      });

      setStats({
        totalUsers: users.data.length,
        totalContent: content.data.length,
        totalTests: tests.data.length,
        pendingReviews: reviews.data.length,
        levelDistribution: Object.entries(levelDist).map(([level, count]) => ({
          level: `${level}-${Number(level) + 10}`,
          count
        })),
        roleDistribution: Object.entries(roleDist).map(([role, value]) => ({
          name: role === 'student' ? 'دانشجو' : role === 'teacher' ? 'استاد' : 'ادمین',
          value
        }))
      });
    });
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">پنل مدیریت</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="کاربران" value={stats.totalUsers} color="bg-blue-600" />
        <StatCard title="محتوا" value={stats.totalContent} color="bg-green-600" />
        <StatCard title="آزمون‌ها" value={stats.totalTests} color="bg-yellow-600" />
        <StatCard title="در انتظار بررسی" value={stats.pendingReviews} color="bg-red-600" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Level Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">توزیع سطح شناختی</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.levelDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="تعداد کاربران" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">توزیع نقش‌ها</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.roleDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={entry => entry.name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`${color} text-white p-6 rounded-lg shadow-lg`}>
      <h3 className="text-sm opacity-90">{title}</h3>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
  );
}
