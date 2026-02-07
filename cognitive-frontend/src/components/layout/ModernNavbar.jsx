import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ModernNavbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getInitials = () => {
    if (!user?.first_name || !user?.last_name) return 'کاربر';
    return user.first_name[0] + user.last_name[0];
  };

  const menuItems = [
    { path: '/student/dashboard', label: '🏠 داشبورد', roles: ['student'] },
    { path: '/student/tests', label: '📝 آزمون‌ها', roles: ['student'] },
    { path: '/student/learning-path', label: '🎯 مسیر یادگیری', roles: ['student'] },
    { path: '/student/progress', label: '📊 پیشرفت من', roles: ['student'] },
    { path: '/student/history', label: '📋 تاریخچه', roles: ['student'] },
    { path: '/teacher/dashboard', label: '👨‍🏫 داشبورد', roles: ['teacher', 'admin'] },
    { path: '/teacher/contents', label: '📚 محتواها', roles: ['teacher', 'admin'] },
    { path: '/teacher/tests', label: '📝 آزمون‌ها', roles: ['teacher', 'admin'] },
    { path: '/teacher/grading', label: '✍️ تصحیح', roles: ['teacher', 'admin'] },
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <nav className="modern-navbar">
      <div className="navbar-brand">
        <div className="navbar-brand-icon">🧠</div>
        <span>سیستم یادگیری هوشمند</span>
      </div>

      <ul className="navbar-menu">
        {visibleMenuItems.map(item => (
          <li key={item.path} className="navbar-menu-item">
            <Link to={item.path} className="navbar-link">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar-user">
        <div className="navbar-user-avatar" title={`${user?.first_name} ${user?.last_name}`}>
          {getInitials()}
        </div>
        <button onClick={handleLogout} className="navbar-logout-btn">
          خروج 🚪
        </button>
      </div>
    </nav>
  );
}
