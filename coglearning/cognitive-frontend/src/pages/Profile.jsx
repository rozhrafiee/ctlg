import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";

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
      const res = await authAPI.getProfile();
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
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
          placeholder="شماره تماس"
        />

        <input
          name="birth_date"
          type="date"
          value={formData.birth_date || ""}
          onChange={handleChange}
        />

        {/* ---------- Student ---------- */}
        {user?.role === "student" && (
          <input
            name="extra_info"
            value={formData.extra_info || ""}
            onChange={handleChange}
            placeholder="اطلاعات تکمیلی (اختیاری)"
          />
        )}

        {/* ---------- Teacher ---------- */}
        {user?.role === "teacher" && (
          <>
            <input
              name="expertise"
              value={formData.expertise || ""}
              onChange={handleChange}
              placeholder="تخصص"
            />

            <textarea
              name="bio"
              value={formData.bio || ""}
              onChange={handleChange}
              placeholder="بیوگرافی"
            />
          </>
        )}

        {message && <p>{message}</p>}

        <button disabled={saving}>
          {saving ? "در حال ذخیره..." : "ذخیره"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
