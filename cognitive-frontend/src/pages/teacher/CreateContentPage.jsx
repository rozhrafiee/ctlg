import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../hooks/useContent';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { learningContentSchema } from '../../lib/validations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input, Textarea, Select } from '../../components/ui/Form';
import { ArrowRight, Save } from 'lucide-react';

export default function CreateContentPage() {
  const navigate = useNavigate();
  const { createContent, createTestForContent } = useContent();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(learningContentSchema),
    defaultValues: {
      content_type: 'text',
      min_level: 1,
      max_level: 10
    }
  });

  const contentType = watch('content_type');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const newContent = await createContent(data);
      
      // ایجاد خودکار آزمون برای محتوا
      if (window.confirm('آیا می‌خواهید آزمون مرتبط با این محتوا را الان بسازید؟')) {
        await createTestForContent(newContent.id);
        navigate(`/teacher/test/${newContent.related_test.id}/questions`);
      } else {
        navigate('/teacher/contents');
      }
    } catch (error) {
      console.error('Failed to create content:', error);
      alert('خطا در ایجاد محتوا');
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 space-y-6">
          {/* Title */}
          <Input
            label="عنوان محتوا"
            {...register('title')}
            error={errors.title?.message}
            placeholder="مثال: آشنایی با React Hooks"
          />

          {/* Description */}
          <Textarea
            label="توضیحات"
            {...register('description')}
            error={errors.description?.message}
            placeholder="توضیحات کامل درباره این محتوا..."
            rows={4}
          />

          {/* Content Type */}
          <Select
            label="نوع محتوا"
            {...register('content_type')}
            error={errors.content_type?.message}
          >
            <option value="text">متن</option>
            <option value="video">ویدیو</option>
            <option value="link">لینک خارجی</option>
          </Select>

          {/* Content Fields Based on Type */}
          {contentType === 'text' && (
            <Textarea
              label="محتوای متنی"
              {...register('text_content')}
              error={errors.text_content?.message}
              placeholder="محتوای آموزشی را اینجا بنویسید..."
              rows={10}
            />
          )}

          {contentType === 'video' && (
            <Input
              label="لینک ویدیو"
              {...register('video_url')}
              error={errors.video_url?.message}
              placeholder="https://youtube.com/watch?v=..."
              type="url"
            />
          )}

          {contentType === 'link' && (
            <Input
              label="لینک محتوا"
              {...register('link_url')}
              error={errors.link_url?.message}
              placeholder="https://example.com/article"
              type="url"
            />
          )}

          {/* Level Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="حداقل سطح"
              {...register('min_level', { valueAsNumber: true })}
              error={errors.min_level?.message}
              type="number"
              min={1}
              max={10}
            />
            <Input
              label="حداکثر سطح"
              {...register('max_level', { valueAsNumber: true })}
              error={errors.max_level?.message}
              type="number"
              min={1}
              max={10}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => navigate('/teacher/contents')}
            variant="outline"
            className="flex-1"
          >
            انصراف
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
            className="flex-1"
          >
            <Save className="w-4 h-4 ml-2" />
            {submitting ? 'در حال ذخیره...' : 'ذخیره محتوا'}
          </Button>
        </div>
      </form>
    </div>
  );
}
