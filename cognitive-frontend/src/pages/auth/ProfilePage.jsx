import { useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || ''
  });
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    await api.patch('/accounts/profile/', form);
    await refreshProfile();
    setMessage('پروفایل به‌روز شد.');
  };

  return (
    <div className="space-y-4">
      <PageHeader title="پروفایل" subtitle="مدیریت اطلاعات حساب کاربری" />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="section-title mb-4">اطلاعات کاربری</h3>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={onSubmit}>
          <Input placeholder="نام" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <Input placeholder="نام خانوادگی" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          <Input placeholder="ایمیل" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit">ذخیره</Button>
            {message && <span className="text-sm text-emerald-600">{message}</span>}
          </div>
        </form>
        </Card>
        <Card>
          <h3 className="section-title mb-3">وضعیت شناختی</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div>سطح: <span className="font-semibold text-slate-900">{user?.cognitive_level ?? '-'}</span></div>
            <div>نقش: <span className="font-semibold text-slate-900">{user?.role}</span></div>
            <div>آزمون تعیین سطح: <span className="font-semibold text-slate-900">{user?.has_taken_placement_test ? 'انجام شده' : 'انجام نشده'}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
