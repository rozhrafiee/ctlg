import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";
import "./Profile.css";

const SORT_ALGOS = [
  { value: "bubble", label: "Bubble Sort" },
  { value: "merge", label: "Merge Sort" },
];

const SEARCH_ALGOS = [
  { value: "linear", label: "Linear Search" },
  { value: "binary", label: "Binary Search" },
];

const SORT_FIELDS = [
  { value: "title", label: "عنوان" },
  { value: "min_level", label: "سطح" },
  { value: "time_limit_minutes", label: "زمان" },
];

const Profile = () => {
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await authAPI.getMe();
      setFormData(res.data);
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await authAPI.updateProfile(formData);
      setMessage("✅ پروفایل با موفقیت ذخیره شد");
      await loadProfile();
      await refreshUser();
    } catch (err) {
      setMessage(err.response?.data?.detail || "❌ خطا در ذخیره پروفایل");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;

  return (
    <div className="profile-page">
      <h2>پروفایل کاربر</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="username"
          value={formData.username || ""}
          onChange={handleChange}
          placeholder="نام کاربری"
        />

        <input
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
          placeholder="ایمیل"
        />

        <input
          name="first_name"
          value={formData.first_name || ""}
          onChange={handleChange}
          placeholder="نام"
        />

        <input
          name="last_name"
          value={formData.last_name || ""}
          onChange={handleChange}
          placeholder="نام خانوادگی"
        />

        <hr />
        <h3>ترجیحات جستجو و مرتب‌سازی (پروژه نقره‌ای)</h3>

        <label>
          الگوریتم مرتب‌سازی پیش‌فرض
          <select
            name="preferred_sort_algorithm"
            value={formData.preferred_sort_algorithm || "bubble"}
            onChange={handleChange}
          >
            {SORT_ALGOS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label>
          الگوریتم جستجو پیش‌فرض
          <select
            name="preferred_search_algorithm"
            value={formData.preferred_search_algorithm || "linear"}
            onChange={handleChange}
          >
            {SEARCH_ALGOS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label>
          فیلد مرتب‌سازی پیش‌فرض
          <select
            name="default_sort_field"
            value={formData.default_sort_field || "title"}
            onChange={handleChange}
          >
            {SORT_FIELDS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        {message && <p>{message}</p>}

        <button disabled={saving}>
          {saving ? "در حال ذخیره..." : "ذخیره"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
