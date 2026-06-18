import React, { useState, useEffect } from "react";
import { assessmentAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const PlacementRequired = () => {
  const [hasTest, setHasTest] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // چک می‌کنیم آیا آزمون تعیین سطحی در دیتابیس وجود دارد یا نه
    assessmentAPI.getAvailableTests()
      .then((res) => {
        const hasPlacement = (res.data || []).some((t) => t.test_type === "placement");
        setHasTest(hasPlacement);
      })
      .catch(() => setHasTest(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{textAlign: "center", marginTop: "50px"}}>در حال بررسی وضعیت آزمون...</div>;

  return (
    <div style={{ 
      maxWidth: "600px", margin: "100px auto", padding: "40px", 
      textAlign: "center", background: "#fff", borderRadius: "20px", 
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)", direction: "rtl" 
    }}>
      <div style={{ fontSize: "60px", marginBottom: "20px" }}>📝</div>
      <h2 style={{ color: "#333" }}>به سامانه خوش آمدید!</h2>
      
      {hasTest ? (
        <>
          <p style={{ color: "#666", lineHeight: "1.8" }}>
            برای دسترسی به محتواهای آموزشی و مسیر یادگیری، ابتدا باید در 
            <strong> آزمون تعیین سطح اولیه </strong> شرکت کنید تا سطح شناختی شما مشخص شود.
          </p>
          <button 
            onClick={() => navigate("/placement-test")}
            style={{ 
              background: "linear-gradient(90deg, #5b6cff, #764ba2)", 
              color: "#fff", border: "none", padding: "15px 40px", 
              borderRadius: "10px", fontSize: "18px", cursor: "pointer", marginTop: "20px" 
            }}
          >
            شروع آزمون تعیین سطح
          </button>
        </>
      ) : (
        <div style={{ padding: "20px", background: "#fff4f4", borderRadius: "10px", border: "1px solid #ffcccc" }}>
          <p style={{ color: "#d9534f", fontWeight: "bold" }}>
            در حال حاضر آزمون تعیین سطحی توسط اساتید تعریف نشده است.
          </p>
          <p style={{ fontSize: "14px", color: "#888" }}>
            لطفاً بعداً مراجعه کنید یا با مدیریت تماس بگیرید.
          </p>
        </div>
      )}
    </div>
  );
};

export default PlacementRequired;
