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
      setForm({ ...res.data, video_file: null });
    };
    load();
  }, [id]);

  if (!form) return <Card>در حال بارگذاری...</Card>;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.content_type === 'video' && form.video_file) {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('content_type', 'video');
      fd.append('min_level', form.min_level);
      fd.append('max_level', form.max_level);
      fd.append('file', form.video_file);
      if (form.video_url?.trim()) fd.append('video_url', form.video_url.trim());
      await updateContent(id, fd);
    } else {
      const { file, file_url, video_file, ...rest } = form;
      await updateContent(id, rest);
    }
    navigate('/teacher/contents');
  };

  return (
    <div className="space-y-4">
      <PageHeader title="ویرایش محتوا" subtitle="به‌روزرسانی اطلاعات محتوا" />
      <Card className="border-primary/10 form-card">
        <h3 className="section-title text-neutral-800 mb-5">اطلاعات محتوا</h3>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={onSubmit}>
          <div className="form-group md:col-span-2 md:col-start-1">
            <label className="form-label">عنوان محتوا</label>
            <Input placeholder="عنوان محتوا" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">نوع محتوا</label>
            <Select value={form.content_type || 'text'} onChange={(e) => setForm({ ...form, content_type: e.target.value })}>
              <option value="text">متنی</option>
              <option value="video">ویدئویی</option>
            </Select>
          </div>
          <div className="form-group">
            <label className="form-label">حداقل سطح</label>
            <Input type="number" min="1" placeholder="۱" value={form.min_level || 1} onChange={(e) => setForm({ ...form, min_level: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">حداکثر سطح</label>
            <Input type="number" min="1" placeholder="۱۰۰" value={form.max_level || 100} onChange={(e) => setForm({ ...form, max_level: e.target.value })} />
          </div>
          {form.content_type === 'video' && (
            <>
              <div className="form-group md:col-span-2">
                <label className="form-label">آدرس ویدئو (اختیاری)</label>
                <Input placeholder="https://..." value={form.video_url || ''} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">یا آپلود فایل ویدئو از کامپیوتر</label>
                <input
                  type="file"
                  accept="video/*"
                  className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white file:cursor-pointer hover:file:bg-primary-dark file:shadow-sm"
                  onChange={(e) => setForm({ ...form, video_file: e.target.files?.[0] || null })}
                />
                {form.file_url && <span className="text-xs text-neutral-500 mt-1 block">فایل فعلی: {form.file_url}</span>}
                {form.video_file && <span className="text-xs text-neutral-500 mt-1 block">فایل جدید: {form.video_file.name}</span>}
              </div>
            </>
          )}
          {form.content_type === 'text' && (
            <div className="form-group md:col-span-2">
              <label className="form-label">متن محتوا</label>
              <Textarea rows={5} placeholder="متن محتوا..." value={form.body || ''} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
          )}
          <div className="md:col-span-2 form-actions pt-4">
            <Button type="submit">ذخیره</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>بازگشت</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
