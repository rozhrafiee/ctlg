import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdaptive } from '../../hooks/useAdaptive';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import PageHeader from '../../components/ui/PageHeader';

export default function CreateContentPage() {
  const navigate = useNavigate();
  const { createContent } = useAdaptive();
  const [form, setForm] = useState({
    title: '',
    content_type: 'text',
    body: '',
    video_url: '',
    min_level: 1,
    max_level: 100
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    await createContent(form);
    navigate('/teacher/contents');
  };

  return (
    <div className="space-y-4">
      <PageHeader title="ساخت محتوای جدید" subtitle="اطلاعات محتوا را وارد کنید" />
      <Card>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={onSubmit}>
        <Input placeholder="عنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Select value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })}>
          <option value="text">متنی</option>
          <option value="video">ویدئویی</option>
        </Select>
        <Input type="number" min="1" placeholder="حداقل سطح" value={form.min_level} onChange={(e) => setForm({ ...form, min_level: e.target.value })} />
        <Input type="number" min="1" placeholder="حداکثر سطح" value={form.max_level} onChange={(e) => setForm({ ...form, max_level: e.target.value })} />
        {form.content_type === 'video' && (
          <Input
            className="md:col-span-2"
            placeholder="آدرس ویدئو"
            value={form.video_url}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
          />
        )}
        {form.content_type === 'text' && (
          <Textarea
            className="md:col-span-2"
            rows={5}
            placeholder="متن محتوا"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
        )}
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">ثبت محتوا</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>بازگشت</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
