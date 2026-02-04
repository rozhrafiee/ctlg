import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentAPI } from "../services/api";
import "./TeacherTests.css";

export default function TeacherTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      const res = await assessmentAPI.getTeacherTests(); // GET /teacher/tests/all/
      setTests(res.data || []);
    } catch (err) {
      console.error("Error loading teacher tests:", err);
      alert("خطا در دریافت لیست آزمون‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("آیا از حذف کامل این آزمون مطمئن هستید؟");
    if (!ok) return;

    try {
      await assessmentAPI.deleteTest(id); // DELETE /teacher/tests/delete/:id/
      setTests((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("خطا در حذف آزمون");
    }
  };

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: 50 }}>
        در حال بارگذاری...
      </p>
    );
  }

  return (
    <div className="teacher-tests-container">
      <div className="header">
        <h2>آزمون‌های من</h2>
        <button
          className="primary-btn"
          onClick={() => navigate("/teacher/tests/new")}
        >
          ➕ ساخت آزمون جدید
        </button>
      </div>

      {tests.length === 0 ? (
        <div className="empty-box">
          <p>هنوز هیچ آزمونی ایجاد نکرده‌اید.</p>
          <button onClick={() => navigate("/teacher/tests/new")}>
            ساخت اولین آزمون
          </button>
        </div>
      ) : (
        <table className="tests-table">
          <thead>
            <tr>
              <th>عنوان</th>
              <th>نوع</th>
              <th>حداقل سطح</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test) => (
              <tr key={test.id}>
                <td>{test.title}</td>

                <td>
                  {test.test_type === "placement"
                    ? "تعیین سطح"
                    : test.test_type === "content_based"
                    ? "محتوامحور"
                    : "عادی"}
                </td>

                <td>{test.min_level}</td>

                <td>
                  {test.is_active ? (
                    <span className="status active">فعال</span>
                  ) : (
                    <span className="status inactive">غیرفعال</span>
                  )}
                </td>

                <td className="actions">
                  <button
                    className="edit-btn"
                    onClick={() =>
                      navigate(`/teacher/tests/edit/${test.id}`)
                    }
                  >
                    ویرایش
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(test.id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
