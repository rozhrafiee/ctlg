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
      <Card>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={onSubmit}>
        <Input placeholder="عنوان آزمون" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Select value={form.test_type || 'general'} onChange={(e) => setForm({ ...form, test_type: e.target.value })}>
          <option value="general">عمومی</option>
          <option value="placement">تعیین سطح</option>
          <option value="content_based">مرتبط با محتوا</option>
        </Select>
        <Input type="number" min="1" placeholder="زمان (دقیقه)" value={form.time_limit_minutes || 0} onChange={(e) => setForm({ ...form, time_limit_minutes: e.target.value })} />
        <Input type="number" min="1" placeholder="حداقل سطح" value={form.min_level || 1} onChange={(e) => setForm({ ...form, min_level: e.target.value })} />
        <Input type="number" min="1" placeholder="سطح هدف" value={form.target_level || 1} onChange={(e) => setForm({ ...form, target_level: e.target.value })} />
        <Textarea className="md:col-span-2" rows={4} placeholder="توضیحات" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">ذخیره</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>بازگشت</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
