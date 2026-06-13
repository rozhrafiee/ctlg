import { Link } from 'react-router-dom';
import '../../pages/HomePage.css';

export default function PublicHeader({ page }) {
  return (
    <header className="home-header">
      <div className="home-header-inner home-header-inner--auth">
        <div className="home-header-actions home-header-actions--auth">
          <Link to="/" className="home-logo home-logo-inline">سامانه سنجش شناختی</Link>
          <Link to="/" className="auth-link-home">خانه</Link>
          {page !== 'login' && <Link to="/login" className="auth-link-login">ورود</Link>}
          {page !== 'register' && <Link to="/register" className="auth-link-register">ثبت‌نام</Link>}
        </div>
      </div>
    </header>
  );
}
