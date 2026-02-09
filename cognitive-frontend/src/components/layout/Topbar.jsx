import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();

  return (
    <div className="border-b border-slate-200/80 bg-white/70 backdrop-blur">
      <div className="container-shell flex items-center justify-between py-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500">خوش آمدی، {user?.first_name || user?.username}</p>
        </div>
        <Button variant="secondary" onClick={logout}>خروج</Button>
      </div>
    </div>
  );
}
