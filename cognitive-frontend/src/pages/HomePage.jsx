import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header-inner">
          <span className="home-logo">سامانه سنجش شناختی</span>
          <div className="home-header-actions">
            <Link to="/login">ورود</Link>
            <Link to="/register">ثبت‌نام</Link>
          </div>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-content">
            <div className="home-hero-badge">سکوی شناختی هوشمند</div>
            <h1 className="home-hero-title">
              مسیر یادگیری هوشمند برای رشد شناختی
            </h1>
            <p className="home-hero-desc">
              آزمون‌ها، محتوا و تحلیل‌های دقیق برای رشد مهارت‌های شناختی شما. سطح‌بندی شخصی‌سازی‌شده و پیشنهادهای هوشمند در یک سامانه یکپارچه.
            </p>
            <div className="home-hero-actions">
              <Link to="/login">ورود به سامانه</Link>
              <Link to="/register">ثبت‌نام</Link>
            </div>
          </div>
          <div className="home-stats-card">
            <div className="home-stats-grid">
              <div className="home-stat-item">
                <div className="home-stat-icon home-stat-icon-growth">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
                </div>
                <div className="home-stat-value">۳×</div>
                <div className="home-stat-label">رشد مهارتی سریع‌تر</div>
              </div>
              <div className="home-stat-item">
                <div className="home-stat-icon home-stat-icon-clock">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                </div>
                <div className="home-stat-value">۲۴/۷</div>
                <div className="home-stat-label">دسترسی به محتوا</div>
              </div>
              <div className="home-stat-item">
                <div className="home-stat-icon home-stat-icon-chart">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
                </div>
                <div className="home-stat-value">۱۰۰+</div>
                <div className="home-stat-label">داده تحلیلی دقیق</div>
              </div>
              <div className="home-stat-item">
                <div className="home-stat-icon home-stat-icon-layers">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /></svg>
                </div>
                <div className="home-stat-value">۵</div>
                <div className="home-stat-label">سطح رتبه‌بندی</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="home-features-inner">
          <h2 className="home-features-title">چرا سامانه سنجش شناختی؟</h2>
          <div className="home-features-grid">
            <div className="home-feature-item">
              <div className="home-feature-icon">📊</div>
              <div className="home-feature-title">آزمون تعیین سطح</div>
              <div className="home-feature-desc">سنجش اولیه و مسیر شخصی‌سازی‌شده</div>
            </div>
            <div className="home-feature-item">
              <div className="home-feature-icon">📚</div>
              <div className="home-feature-title">محتواهای سطح‌بندی‌شده</div>
              <div className="home-feature-desc">مطالب متناسب با سطح شناختی شما</div>
            </div>
            <div className="home-feature-item">
              <div className="home-feature-icon">📈</div>
              <div className="home-feature-title">تحلیل پیشرفت</div>
              <div className="home-feature-desc">گزارش و نمودار رشد مهارت‌ها</div>
            </div>
            <div className="home-feature-item">
              <div className="home-feature-icon">🎯</div>
              <div className="home-feature-title">پیشنهاد هوشمند</div>
              <div className="home-feature-desc">توصیه محتوا و آزمون بر اساس پروفایل شما</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-inner">
          سامانه سنجش شناختی — مسیر یادگیری هوشمند برای رشد مهارت‌های شناختی
        </div>
      </footer>
    </div>
  );
}
