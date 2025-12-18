import { useEffect, useState } from "react";
import { api } from "../../utils/api";

interface Overview {
  total_users: number;
  levels_distribution: Record<string, number>;
  total_test_sessions: number;
  average_test_score: number;
  completed_contents: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    api.get("/api/analytics/overview/").then((res) => setData(res.data));
  }, []);

  if (!data) return <div>در حال بارگذاری داشبورد...</div>;

  return (
    <div>
      <h2>داشبورد مدیریتی</h2>
      <div className="grid">
        <div className="card">
          <h3>تعداد کل کاربران</h3>
          <p>{data.total_users}</p>
        </div>
        <div className="card">
          <h3>مجموع جلسات آزمون</h3>
          <p>{data.total_test_sessions}</p>
        </div>
        <div className="card">
          <h3>میانگین نمره آزمون‌ها</h3>
          <p>{data.average_test_score.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>محتوای تکمیل شده</h3>
          <p>{data.completed_contents}</p>
        </div>
      </div>
      <div className="card">
        <h3>توزیع سطح شناختی کاربران</h3>
        <ul>
          {Object.entries(data.levels_distribution).map(([level, count]) => (
            <li key={level}>
              سطح {level}: {count} نفر
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


