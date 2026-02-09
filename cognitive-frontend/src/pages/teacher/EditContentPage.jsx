import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { useAdaptive } from '../../hooks/useAdaptive';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import PageHeader from '../../components/ui/PageHeader';

export default function EditContentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateContent } = useAdaptive();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/adaptive-learning/content/${id}/`);
      setForm(res.data);
    };
    load();
  }, [id]);

  if (!form) return <Card>در حال بارگذاری...</Card>;

  const onSubmit = async (e) => {
    e.preventDefault();
    await updateContent(id, form);
    navigate('/teacher/contents');
  };

  return (
    <div className="space-y-4">
      <PageHeader title="ویرایش محتوا" subtitle="به‌روزرسانی اطلاعات محتوا" />
      <Card>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={onSubmit}>
        <Input placeholder="عنوان" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Select value={form.content_type || 'text'} onChange={(e) => setForm({ ...form, content_type: e.target.value })}>
          <option value="text">متنی</option>
          <option value="video">ویدئویی</option>
        </Select>
        <Input type="number" min="1" placeholder="حداقل سطح" value={form.min_level || 1} onChange={(e) => setForm({ ...form, min_level: e.target.value })} />
        <Input type="number" min="1" placeholder="حداکثر سطح" value={form.max_level || 100} onChange={(e) => setForm({ ...form, max_level: e.target.value })} />
        {form.content_type === 'video' && (
          <Input
            className="md:col-span-2"
            placeholder="آدرس ویدئو"
            value={form.video_url || ''}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
          />
        )}
        {form.content_type === 'text' && (
          <Textarea
            className="md:col-span-2"
            rows={5}
            placeholder="متن محتوا"
            value={form.body || ''}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
        )}
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">ذخیره</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>بازگشت</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
