import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";

interface TestItem {
  id: number;
  title: string;
  description: string;
  min_level: number;
  max_level: number;
}

export default function TestsListPage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/assessment/tests/").then((res) => {
      setTests(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>در حال بارگذاری آزمون‌ها...</div>;

  return (
    <div>
      <h2>آزمون‌های در دسترس</h2>
      <div className="grid">
        {tests.map((t) => (
          <div key={t.id} className="card">
            <h3>{t.title}</h3>
            <p>{t.description}</p>
            <p>
              سطح: {t.min_level} تا {t.max_level}
            </p>
            <Link to={`/tests/${t.id}`} className="btn-primary">
              شروع آزمون
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}


