import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // --- منوی مخصوص اساتید ---
  const TeacherMenu = () => (
    <>
      <Link to="/dashboard" style={linkStyle}>📊 پیشخوان استاد</Link>
      <Link to="/teacher/tests" style={linkStyle}>⚙️ مدیریت آزمون‌ها</Link>
      <Link to="/teacher/reviews" style={linkStyle}>📝 تصحیح اوراق</Link>
      <Link to="/add-test" style={linkStyle}>➕ تعریف آزمون</Link>
    </>
  );

  // --- منوی مخصوص دانشجویان (شهروندان) ---
  const StudentMenu = () => (
    <>
      <Link to="/dashboard" style={linkStyle}>🏠 میز کار من</Link>
      <Link to="/exams" style={linkStyle}>✍️ شرکت در آزمون</Link>
      <Link to="/my-results" style={linkStyle}>📜 کارنامه‌های من</Link>
      <Link to="/profile" style={linkStyle}>👤 پروفایل</Link>
    </>
  );

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <Link to="/" style={logoStyle}>🎓 سامانه سنجش</Link>
        
        {/* نمایش منوی متناسب با نقش کاربر */}
        {isAuthenticated && (
          <div style={menuContainerStyle}>
            {user?.role === 'teacher' ? <TeacherMenu /> : <StudentMenu />}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        {isAuthenticated ? (
          <div style={userControlStyle}>
            <div style={userInfoStyle}>
              <span style={roleBadgeStyle}>
                {user?.role === 'teacher' ? '👨‍🏫 استاد' : '👨‍🎓 شهروند'}
              </span>
              <span style={userNameStyle}>{user?.username}</span>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} style={logoutBtnStyle}>
              خروج
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" style={loginBtnStyle}>ورود</Link>
            <Link to="/register" style={registerBtnStyle}>ثبت‌نام رایگان</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

// --- استایل‌ها (Inline Styles) ---
const navStyle = {
  display: 'flex', justifyContent: 'space-between', padding: '10px 40px',
  background: '#1a202c', color: '#fff', direction: 'rtl',
  fontFamily: 'Tahoma, Arial', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  position: 'sticky', top: 0, zIndex: 1000
};

const logoStyle = {
  color: '#63b3ed', textDecoration: 'none', fontSize: '1.3rem',
  fontWeight: 'bold', borderLeft: '2px solid #4a5568', paddingLeft: '20px'
};

const menuContainerStyle = { display: 'flex', gap: '10px' };

const linkStyle = {
  color: '#e2e8f0', textDecoration: 'none', fontSize: '0.85rem',
  padding: '8px 12px', borderRadius: '8px', transition: '0.3s',
  backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid transparent'
};

const userControlStyle = { display: 'flex', alignItems: 'center', gap: '20px' };

const userInfoStyle = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' };

const userNameStyle = { fontSize: '0.9rem', fontWeight: 'bold' };

const roleBadgeStyle = {
  fontSize: '0.7rem', background: '#4a5568', padding: '2px 8px', borderRadius: '10px', color: '#cbd5e0'
};

const logoutBtnStyle = {
  background: '#f56565', color: '#fff', border: 'none', padding: '8px 16px',
  borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'
};

const loginBtnStyle = {
  color: '#fff', textDecoration: 'none', padding: '8px 20px', borderRadius: '8px'
};

const registerBtnStyle = {
  background: '#3182ce', color: '#fff', textDecoration: 'none',
  padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold'
};

export default Navbar;