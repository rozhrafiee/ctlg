import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../api/axios";

export default function Reports() {
  const [data, setData] = useState({
    levelProgression: [],
    testCompletion: []
  });

  useEffect(() => {
    // Simulated data - در پروژه واقعی از API می‌گیرید
    setData({
      levelProgression: [
        { month: 'فروردین', avgLevel: 25 },
        { month: 'اردیبهشت', avgLevel: 35 },
        { month: 'خرداد', avgLevel: 48 },
        { month: 'تیر', avgLevel: 62 }
      ],
      testCompletion: [
        { name: 'Placement', completed: 45, pending: 5 },
        { name: 'آزمون 1', completed: 38, pending: 12 },
        { name: 'آزمون 2', completed: 30, pending: 20 }
      ]
    });
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold">گزارش‌های پیشرفته</h1>

      {/* Level Progression */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">روند پیشرفت سطح شناختی</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.levelProgression}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="avgLevel" stroke="#3b82f6" name="میانگین سطح" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Test Completion */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">وضعیت تکمیل آزمون‌ها</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.testCompletion}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" fill="#10b981" name="تکمیل شده" />
            <Bar dataKey="pending" fill="#f59e0b" name="در انتظار" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
