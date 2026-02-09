import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentAPI } from "../services/api";
import "./TeacherTests.css";

const TeacherTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await assessmentAPI.listTests();
        setTests(res.data || []);
      } catch (err) {
        setError("خطا در دریافت لیست آزمون‌ها");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  if (loading) return <div className="container">در حال بارگذاری...</div>;

  return (
    <div className="teacher-tests" style={{ direction: "rtl", fontFamily: "Tahoma" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>مدیریت آزمون‌ها</h1>
        <button type="button" onClick={() => navigate("/add-test")}>+ آزمون جدید</button>
      </div>

      {error && <div className="error">{error}</div>}

      {tests.length === 0 ? (
        <div>هنوز آزمونی ثبت نشده است.</div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {tests.map((test) => (
            <div key={test.id} style={{ border: "1px solid #eee", borderRadius: "10px", padding: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ marginBottom: "6px" }}>{test.title}</h3>
                  <div style={{ fontSize: "0.9rem", color: "#555" }}>
                    نوع: {test.test_type} | سطح هدف: {test.target_level} | زمان: {test.time_limit_minutes} دقیقه
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" onClick={() => navigate(`/edit-test/${test.id}`)}>ویرایش</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherTests;
