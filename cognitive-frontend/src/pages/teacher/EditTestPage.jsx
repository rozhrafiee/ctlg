import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAssessment } from '../../hooks/useAssessment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import PageHeader from '../../components/ui/PageHeader';

export default function EditTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTestDetail, updateTest } = useAssessment();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await getTestDetail(id);
      setForm(data);
    };
    load();
  }, [id]);

  if (!form) return <Card>در حال بارگذاری...</Card>;

  const onSubmit = async (e) => {
    e.preventDefault();
    await updateTest(id, form);
    navigate('/teacher/tests');
  };

  return (
    <div className="space-y-4">
      <PageHeader title="ویرایش آزمون" subtitle="به‌روزرسانی اطلاعات آزمون" />
      <Card className="border-primary/10 form-card">
        <h3 className="section-title text-neutral-800 mb-5">اطلاعات آزمون</h3>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={onSubmit}>
          <div className="form-group md:col-span-2 md:col-start-1">
            <label className="form-label">عنوان آزمون</label>
            <Input placeholder="عنوان آزمون" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">نوع آزمون</label>
            <Select value={form.test_type || 'general'} onChange={(e) => setForm({ ...form, test_type: e.target.value })}>
              <option value="general">عمومی</option>
              <option value="placement">تعیین سطح</option>
              <option value="content_based">مرتبط با محتوا</option>
            </Select>
          </div>
          <div className="form-group">
            <label className="form-label">زمان (دقیقه)</label>
            <Input type="number" min="1" placeholder="۳۰" value={form.time_limit_minutes || 0} onChange={(e) => setForm({ ...form, time_limit_minutes: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">حداقل سطح</label>
            <Input type="number" min="1" placeholder="۱" value={form.min_level || 1} onChange={(e) => setForm({ ...form, min_level: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">سطح هدف</label>
            <Input type="number" min="1" placeholder="۱" value={form.target_level || 1} onChange={(e) => setForm({ ...form, target_level: e.target.value })} />
          </div>
          <div className="form-group md:col-span-2">
            <label className="form-label">توضیحات (اختیاری)</label>
            <Textarea rows={4} placeholder="توضیحات..." value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="md:col-span-2 form-actions pt-4">
            <Button type="submit">ذخیره</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>بازگشت</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
