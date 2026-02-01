import { useEffect, useState } from "react";
import { adaptiveLearningAPI } from "../services/api";

const Recommended = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adaptiveLearningAPI.recommended();
      setItems(res.data?.results ?? res.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">در حال بارگذاری...</div>;

  return (
    <div className="container">
      <h1>پیشنهادات هوشمند</h1>
      {items.length === 0 ? (
        <p>محتوایی برای پیشنهاد وجود ندارد.</p>
      ) : (
        <ul>
          {items.map((c) => (
            <li key={c.id}>
              <strong>{c.title}</strong>
              {typeof c.min_level !== "undefined" && (
                <span> — سطح {c.min_level} تا {c.max_level}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Recommended;
