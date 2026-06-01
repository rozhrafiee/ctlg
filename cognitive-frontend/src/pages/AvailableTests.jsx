import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentAPI, authAPI } from "../services/api";

const SORT_ALGOS = [
  { value: "bubble", label: "Bubble Sort" },
  { value: "merge", label: "Merge Sort" },
];

const SEARCH_ALGOS = [
  { value: "linear", label: "Linear Search" },
  { value: "binary", label: "Binary Search (عنوان دقیق)" },
];

const SORT_FIELDS = [
  { value: "title", label: "عنوان" },
  { value: "min_level", label: "سطح" },
  { value: "time_limit_minutes", label: "زمان" },
];

const AvailableTests = () => {
  const [tests, setTests] = useState([]);
  const [userLevel, setUserLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catalogMeta, setCatalogMeta] = useState(null);
  const [filters, setFilters] = useState({
    q: "",
    sort_algo: "bubble",
    search_algo: "linear",
    sort_by: "title",
    sort_order: "asc",
  });
  const navigate = useNavigate();

  const fetchData = useCallback(async (params = filters) => {
    setLoading(true);
    try {
      const profileRes = await authAPI.getMe();
      const profile = profileRes.data;
      setUserLevel(profile.cognitive_level || 1);

      const queryParams = {
        ...params,
        sort_algo: params.sort_algo || profile.preferred_sort_algorithm || "bubble",
        search_algo: params.search_algo || profile.preferred_search_algorithm || "linear",
        sort_by: params.sort_by || profile.default_sort_field || "title",
      };

      const testsRes = await assessmentAPI.getAvailableTests(queryParams);
      setTests(testsRes.data || []);
      setCatalogMeta(testsRes.catalogMeta || null);
    } catch (err) {
      console.error("خطا در دریافت لیست آزمون‌ها:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(filters);
  };

  if (loading && tests.length === 0) {
    return <div style={styles.center}>در حال بررسی سطح شما و دریافت آزمون‌ها...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>📚 آزمون‌های متناسب با سطح شما</h2>
        <div style={styles.levelBadge}>سطح فعلی شما: {userLevel}</div>
      </header>

      <form onSubmit={handleSearch} style={styles.filterBar}>
        <input
          name="q"
          value={filters.q}
          onChange={handleFilterChange}
          placeholder="جستجو در عنوان/توضیحات..."
          style={styles.searchInput}
        />
        <select name="search_algo" value={filters.search_algo} onChange={handleFilterChange} style={styles.select}>
          {SEARCH_ALGOS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select name="sort_algo" value={filters.sort_algo} onChange={handleFilterChange} style={styles.select}>
          {SORT_ALGOS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select name="sort_by" value={filters.sort_by} onChange={handleFilterChange} style={styles.select}>
          {SORT_FIELDS.map((o) => (
            <option key={o.value} value={o.value}>مرتب: {o.label}</option>
          ))}
        </select>
        <select name="sort_order" value={filters.sort_order} onChange={handleFilterChange} style={styles.select}>
          <option value="asc">صعودی</option>
          <option value="desc">نزولی</option>
        </select>
        <button type="submit" style={styles.searchBtn} disabled={loading}>
          {loading ? "..." : "اعمال"}
        </button>
      </form>

      {catalogMeta && (
        <div style={styles.metaBar}>
          الگوریتم جستجو: <strong>{catalogMeta.search_algorithm}</strong>
          {" | "}
          الگوریتم مرتب‌سازی: <strong>{catalogMeta.sort_algorithm}</strong>
          {" | "}
          نتیجه: {catalogMeta.total_after} از {catalogMeta.total_before}
        </div>
      )}

      {tests.length === 0 ? (
        <div style={styles.empty}>
          <p>آزمونی با این فیلترها یافت نشد.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {tests.map((test) => (
            <div key={test.id} style={styles.card}>
              <div style={styles.cardType}>
                {test.test_type === "placement" ? "🎯 تعیین سطح" : "📝 آزمون دوره‌ای"}
              </div>
              <h3>{test.title}</h3>
              <p style={styles.desc}>
                {test.description || "توضیحاتی برای این آزمون ثبت نشده است."}
              </p>
              <div style={styles.meta}>
                <span>⏰ زمان: {test.time_limit_minutes} دقیقه</span>
                <span>📊 سطح: {test.min_level}</span>
                <span>❓ سوالات: {test.questions_count || "-"}</span>
              </div>
              <button
                onClick={() => navigate(`/take-test/${test.id}`)}
                style={test.test_type === "placement" ? styles.btnPlacement : styles.btnStart}
              >
                شروع آزمون
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "40px 20px", direction: "rtl", fontFamily: "Tahoma", maxWidth: "1200px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "20px" },
  levelBadge: { background: "#3498db", color: "#fff", padding: "8px 15px", borderRadius: "20px", fontWeight: "bold" },
  filterBar: { display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px", padding: "15px", background: "#f8f9fa", borderRadius: "10px" },
  searchInput: { flex: "1 1 200px", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" },
  select: { padding: "10px", borderRadius: "8px", border: "1px solid #ddd", minWidth: "140px" },
  searchBtn: { padding: "10px 20px", background: "#3498db", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  metaBar: { marginBottom: "20px", padding: "10px 15px", background: "#eef7ff", borderRadius: "8px", fontSize: "14px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" },
  card: { background: "#fff", borderRadius: "15px", padding: "25px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)", position: "relative", border: "1px solid #f0f0f0" },
  cardType: { position: "absolute", top: "15px", left: "15px", fontSize: "12px", color: "#7f8c8d", background: "#ecf0f1", padding: "4px 8px", borderRadius: "5px" },
  desc: { color: "#636e72", fontSize: "14px", lineHeight: "1.6", height: "45px", overflow: "hidden" },
  meta: { display: "flex", flexDirection: "column", gap: "6px", margin: "20px 0", fontSize: "13px", color: "#2d3436" },
  btnStart: { width: "100%", padding: "12px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  btnPlacement: { width: "100%", padding: "12px", background: "#e67e22", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  empty: { textAlign: "center", padding: "50px", background: "#f9f9f9", borderRadius: "15px" },
  center: { textAlign: "center", padding: "100px", fontSize: "18px" },
};

export default AvailableTests;
