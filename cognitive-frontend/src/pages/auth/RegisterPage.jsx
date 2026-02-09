import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'student'
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/profile');
    } catch (err) {
      setError('ثبت‌نام ناموفق بود.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <div className="soft-pill mb-3">ایجاد حساب</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">ثبت‌نام</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={onSubmit}>
          <Input placeholder="نام کاربری" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input placeholder="ایمیل" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="نام" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <Input placeholder="نام خانوادگی" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          <Input type="password" placeholder="رمز عبور" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="student">دانش‌آموز</option>
            <option value="teacher">استاد</option>
          </Select>
          {error && <p className="text-sm text-rose-500 md:col-span-2">{error}</p>}
          <div className="md:col-span-2">
            <Button type="submit" className="w-full">ثبت‌نام</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
