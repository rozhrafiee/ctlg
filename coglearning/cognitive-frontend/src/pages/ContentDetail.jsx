import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contentAPI } from "../services/api";

const ContentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await contentAPI.getContentDetails(id);
        setContent(res.data);
      } catch (err) {
        console.error("خطا در دریافت محتوا:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div style={styles.center}>در حال بارگذاری محتوا...</div>;
  if (!content) return <div style={styles.center}>محتوا یافت نشد.</div>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>بازگشت</button>
      <h2 style={styles.title}>{content.title}</h2>
      {content.content_type === "video" && content.video_url && (
        <div style={styles.videoWrapper}>
          <iframe
            title={content.title}
            src={content.video_url}
            style={styles.iframe}
            allowFullScreen
          />
        </div>
      )}
      {content.content_type === "text" && (
        <p style={styles.body}>{content.body || "بدون متن"}</p>
      )}
    </div>
  );
};

const styles = {
  container: { direction: "rtl", padding: "30px", maxWidth: "900px", margin: "0 auto", fontFamily: "Tahoma" },
  title: { marginTop: "20px", marginBottom: "20px" },
  body: { lineHeight: "1.8", background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee" },
  backBtn: { background: "#ecf0f1", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" },
  center: { textAlign: "center", marginTop: "100px" },
  videoWrapper: { position: "relative", paddingTop: "56.25%", background: "#000", borderRadius: "12px", overflow: "hidden" },
  iframe: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" },
};

export default ContentDetail;
