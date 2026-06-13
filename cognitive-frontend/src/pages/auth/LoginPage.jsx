import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import PublicHeader from '../../components/layout/PublicHeader';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const profile = await login(form);
      if (profile.role === 'teacher' || profile.role === 'admin') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError('ورود ناموفق بود.');
    }
  };

  return (
    <>
      <PublicHeader page="login" />
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <div className="soft-pill mb-3">ورود به سامانه</div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">خوش آمدید</h2>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input placeholder="نام کاربری" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input type="password" placeholder="رمز عبور" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <Button type="submit" className="w-full">ورود</Button>
        </form>
      </Card>
    </div>
    </>
  );
}
