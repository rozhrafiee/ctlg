import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';

/**
 * ✏️ صفحه ویرایش محتوای آموزشی
 */
export default function EditContentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'text',
    body: '',
    video_url: '',
    min_level: 1,
    max_level: 100,
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/adaptive/teacher/content/${id}/`);
      setFormData(response.data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'خطا در بارگذاری محتوا',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.patch(`/adaptive/teacher/content/${id}/update/`, formData);

      setMessage({
        type: 'success',
        text: 'محتوا با موفقیت به‌روزرسانی شد! در حال انتقال...',
      });

      setTimeout(() => {
        navigate('/teacher/contents');
      }, 2000);
      
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'خطا در به‌روزرسانی محتوا',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ویرایش محتوای آموزشی</h1>
        <p className="text-gray-600">
          تغییرات مورد نظر خود را اعمال کنید
        </p>
      </div>

      {/* نمایش پیام */}
      {message.text && (
        <Alert 
          variant={message.type === 'success' ? 'default' : 'destructive'}
          className="mb-6"
        >
          {message.text}
        </Alert>
      )}

      <Card>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* عنوان */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان محتوا
              </label>
              <input
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* نوع محتوا */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع محتوا
              </label>
              <select
                name="content_type"
                value={formData.content_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="text">متنی</option>
                <option value="video">ویدئویی</option>
              </select>
            </div>

            {/* بدنه متنی */}
            {formData.content_type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  محتوای متنی
                </label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* لینک ویدئو */}
            {formData.content_type === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  لینک ویدئو
                </label>
                <input
                  name="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* سطح مناسب */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حداقل سطح
                </label>
                <input
                  name="min_level"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.min_level}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حداکثر سطح
                </label>
                <input
                  name="max_level"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.max_level}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* وضعیت انتشار */}
            <div className="flex items-center gap-2">
              <input
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
              />
              <label className="text-sm font-medium text-gray-700">
                فعال و قابل نمایش
              </label>
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/teacher/contents')}
              >
                انصراف
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
