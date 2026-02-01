import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { contentAPI } from "../services/api";

const ContentForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // وضعیت فرم
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_text: "",
    min_level: 1,
    max_level: 10,
  });
  
  const [file, setFile] = useState(null); // برای ذخیره فایل ویدیو یا PDF

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // استفاده از FormData برای ارسال همزمان متن و فایل
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("content_text", formData.content_text);
      data.append("min_level", formData.min_level);
      data.append("max_level", formData.max_level);
      
      if (file) {
        data.append("file", file); // 'file' باید با اسم فیلد در مدل جنگو یکی باشد
      }

      await contentAPI.createContent(data);
      alert("محتوای آموزشی با موفقیت منتشر شد.");
      navigate("/teacher/dashboard");
    } catch (err) {
      console.error(err);
      alert("خطا در آپلود محتوا. حجم فایل را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎬 انتشار محتوای آموزشی جدید</h2>
      <p style={styles.subtitle}>می‌توانید متن آموزشی، مراجع و فایل ویدیویی خود را اینجا بارگذاری کنید.</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label>عنوان درس:</label>
          <input 
            type="text" 
            required 
            style={styles.input} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div style={styles.grid}>
          <div style={styles.inputGroup}>
            <label>حداقل سطح (Difficulty):</label>
            <input 
              type="number" 
              min="1" max="10" 
              value={formData.min_level}
              style={styles.input} 
              onChange={(e) => setFormData({...formData, min_level: e.target.value})}
            />
          </div>
          <div style={styles.inputGroup}>
            <label>حداکثر سطح:</label>
            <input 
              type="number" 
              min="1" max="10" 
              value={formData.max_level}
              style={styles.input} 
              onChange={(e) => setFormData({...formData, max_level: e.target.value})}
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label>متن آموزش یا توضیحات تکمیلی:</label>
          <textarea 
            rows="6" 
            style={styles.textarea}
            onChange={(e) => setFormData({...formData, content_text: e.target.value})}
          ></textarea>
        </div>

        <div style={styles.fileSection}>
          <label style={styles.fileLabel}>
            📁 انتخاب فایل ویدیو یا جزوه (PDF/MP4):
            <input 
              type="file" 
              accept="video/*,application/pdf" 
              style={styles.fileInput}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
          {file && <p style={styles.fileName}>فایل انتخاب شده: {file.name}</p>}
        </div>

        <button type="submit" disabled={loading} style={loading ? styles.btnDisabled : styles.btn}>
          {loading ? "در حال آپلود و پردازش..." : "🚀 انتشار محتوا"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { direction: 'rtl', padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Tahoma' },
  title: { color: '#2c3e50', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#7f8c8d', marginBottom: '30px' },
  form: { background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  inputGroup: { marginBottom: '20px' },
  grid: { display: 'flex', gap: '20px' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '8px' },
  textarea: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '8px', resize: 'vertical' },
  fileSection: { background: '#f8f9fa', padding: '20px', borderRadius: '10px', textAlign: 'center', marginBottom: '25px', border: '2px dashed #dee2e6' },
  fileLabel: { cursor: 'pointer', color: '#3498db', fontWeight: 'bold' },
  fileInput: { display: 'none' },
  fileName: { fontSize: '0.85rem', color: '#27ae60', marginTop: '10px' },
  btn: { width: '100%', padding: '15px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' },
  btnDisabled: { width: '100%', padding: '15px', background: '#bdc3c7', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'not-allowed' }
};

export default ContentForm;