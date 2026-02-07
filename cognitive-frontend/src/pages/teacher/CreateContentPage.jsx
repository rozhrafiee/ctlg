import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../hooks/useContent';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input, Textarea, Select } from '../../components/ui/Form';
import { ArrowRight, Save } from 'lucide-react';
import "@/styles/global-styles.css";
import "@/styles/page-styles.css";

const initialForm = {
  title: '',
  content_type: 'text',
  body: '',
  video_url: '',
  min_level: 1,
  max_level: 100,
  is_active: true,
};

export default function CreateContentPage() {
  const navigate = useNavigate();
  const { createContent, createTestForContent } = useContent();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const next = {};
    if (!form.title?.trim()) next.title = 'عنوان الزامی است';
    else if (form.title.trim().length < 3) next.title = 'عنوان باید حداقل 3 حرف باشد';
    if (form.content_type === 'text' && !form.body?.trim()) next.body = 'محتوای متنی الزامی است';
    if (form.content_type === 'video' && !form.video_url?.trim()) next.video_url = 'لینک ویدیو الزامی است';
    const min = Number(form.min_level);
    const max = Number(form.max_level);
    if (min < 1 || min > 100) next.min_level = 'سطح باید بین 1 تا 100 باشد';
    if (max < 1 || max > 100) next.max_level = 'سطح باید بین 1 تا 100 باشد';
    if (min > max) next.max_level = 'حداکثر سطح باید بزرگتر یا مساوی حداقل باشد';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        content_type: form.content_type,
        body: form.content_type === 'text' ? form.body.trim() : '',
        video_url: form.content_type === 'video' ? form.video_url.trim() : '',
        min_level: Number(form.min_level) || 1,
        max_level: Number(form.max_level) || 100,
        is_active: form.is_active,
      };
      const newContent = await createContent(payload);

      if (window.confirm('آیا می‌خواهید آزمون مرتبط با این محتوا را الان بسازید؟')) {
        const { test } = await createTestForContent(newContent.id);
        navigate(`/teacher/tests/${test?.id}/questions`);
      } else {
        navigate('/teacher/contents');
      }
    } catch (error) {
      console.error('Failed to create content:', error);
      const message = error?.response?.data?.detail || error?.response?.data?.error || 'خطا در ایجاد محتوا یا آزمون. دوباره تلاش کنید.';
      setErrors((prev) => ({ ...prev, submit: message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button
          onClick={() => navigate('/teacher/contents')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </Button>
        <h1 className="text-3xl font-bold">ایجاد محتوای جدید</h1>
        <p className="text-gray-600 mt-2">محتوای آموزشی جدید را ایجاد کنید</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card className="p-6 space-y-6">
          {errors.submit && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{errors.submit}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان محتوا</label>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="مثال: آشنایی با React Hooks"
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع محتوا</label>
            <Select name="content_type" value={form.content_type} onChange={handleChange}>
              <option value="text">متن</option>
              <option value="video">ویدیو</option>
            </Select>
          </div>

          {form.content_type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">محتوای متنی</label>
              <Textarea
                name="body"
                value={form.body}
                onChange={handleChange}
                placeholder="محتوای آموزشی را اینجا بنویسید..."
                rows={10}
              />
              {errors.body && <p className="text-sm text-red-600 mt-1">{errors.body}</p>}
            </div>
          )}

          {form.content_type === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">لینک ویدیو</label>
              <Input
                name="video_url"
                type="url"
                value={form.video_url}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
              />
              {errors.video_url && <p className="text-sm text-red-600 mt-1">{errors.video_url}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">حداقل سطح</label>
              <Input
                name="min_level"
                type="number"
                min={1}
                max={100}
                value={form.min_level}
                onChange={handleChange}
              />
              {errors.min_level && <p className="text-sm text-red-600 mt-1">{errors.min_level}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">حداکثر سطح</label>
              <Input
                name="max_level"
                type="number"
                min={1}
                max={100}
                value={form.max_level}
                onChange={handleChange}
              />
              {errors.max_level && <p className="text-sm text-red-600 mt-1">{errors.max_level}</p>}
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => navigate('/teacher/contents')}
            variant="outline"
            className="flex-1"
          >
            انصراف
          </Button>
          <Button type="submit" disabled={submitting} variant="primary" className="flex-1">
            <Save className="w-4 h-4 ml-2" />
            {submitting ? 'در حال ذخیره...' : 'ذخیره محتوا'}
          </Button>
        </div>
      </form>
    </div>
  );
}
