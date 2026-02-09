import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";
import "./Profile.css";

const Profile = () => {
  const { user, refreshUser } = useAuth();

  const [profileData, setProfileData] = useState(null);
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
      setProfileData(res.data);
      setFormData(res.data); // ✅ auto-fill
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
      await loadProfile();     // reload profile
      await refreshUser();     // ✅ sync AuthContext
    } catch (err) {
      setMessage(
        err.response?.data?.detail || "❌ خطا در ذخیره پروفایل"
      );
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

        {message && <p>{message}</p>}

        <button disabled={saving}>
          {saving ? "در حال ذخیره..." : "ذخیره"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
