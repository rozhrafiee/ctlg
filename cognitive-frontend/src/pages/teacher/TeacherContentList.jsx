import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/axios';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';

/**
 * 📚 لیست محتوای آموزشی استاد
 * 
 * ویژگی‌ها:
 * - نمایش لیست محتواهای ساخته شده
 * - فیلتر بر اساس نوع (متنی/ویدئویی)
 * - ویرایش/حذف محتوا
 * - مشاهده آمار مشاهدات
 */
export default function TeacherContentList() {
  const [contents, setContents] = useState([]);
  const [filter, setFilter] = useState('all'); // all, text, video
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchContents();
  }, [filter]);

  const fetchContents = async () => {
    setIsLoading(true);
    try {
      const params = filter !== 'all' ? { content_type: filter } : {};
      const response = await api.get('/adaptive-learning/teacher/contents/', { params });
      setContents(response.data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'خطا در بارگذاری محتواها',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (contentId) => {
    if (!confirm('آیا از حذف این محتوا اطمینان دارید؟')) {
      return;
    }

    try {
      await api.delete(`/adaptive-learning/teacher/content/${contentId}/delete/`);
      setMessage({
        type: 'success',
        text: 'محتوا با موفقیت حذف شد',
      });
      fetchContents(); // به‌روزرسانی لیست
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'خطا در حذف محتوا',
      });
    }
  };

  const toggleStatus = async (contentId, currentStatus) => {
    try {
      await api.patch(`/adaptive-learning/teacher/content/${contentId}/update/`, {
        is_active: !currentStatus,
      });
      setMessage({
        type: 'success',
        text: 'وضعیت محتوا تغییر کرد',
      });
      fetchContents();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'خطا در تغییر وضعیت',
      });
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">محتوای آموزشی</h1>
          <p className="text-gray-600">
            مدیریت و ویرایش محتواهای ساخته شده
          </p>
        </div>

        <Link to="/teacher/contents/create">
          <Button>
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            محتوای جدید
          </Button>
        </Link>
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

      {/* فیلتر */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          همه
        </Button>
        <Button
          variant={filter === 'text' ? 'default' : 'outline'}
          onClick={() => setFilter('text')}
        >
          متنی
        </Button>
        <Button
          variant={filter === 'video' ? 'default' : 'outline'}
          onClick={() => setFilter('video')}
        >
          ویدئویی
        </Button>
      </div>

      {/* لیست محتوا */}
      {contents.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              هنوز محتوایی ساخته نشده
            </h3>
            <p className="text-gray-600 mb-6">
              برای شروع، اولین محتوای آموزشی خود را بسازید
            </p>
            <Link to="/teacher/contents/create">
              <Button>ساخت محتوای جدید</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contents.map((content) => (
            <Card key={content.id}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">
                        {content.title}
                      </h3>
                      
                      <Badge variant={content.content_type === 'text' ? 'default' : 'secondary'}>
                        {content.content_type === 'text' ? '📄 متنی' : '🎥 ویدئویی'}
                      </Badge>

                      <Badge variant={content.is_active ? 'success' : 'secondary'}>
                        {content.is_active ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </div>

                    {content.body && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {content.body.substring(0, 150)}
                        {content.body.length > 150 && '...'}
                      </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">سطح:</span>
                        <div className="font-medium">
                          {content.min_level} - {content.max_level}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">تاریخ ایجاد:</span>
                        <div className="font-medium">
                          {new Date(content.created_at).toLocaleDateString('fa-IR')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">مشاهدات:</span>
                        <div className="font-medium text-blue-600">
                          {content.views_count || 0} نفر
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">تکمیل شده:</span>
                        <div className="font-medium text-green-600">
                          {content.completed_count || 0} نفر
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* دکمه‌ها */}
                  <div className="flex flex-col gap-2 mr-4">
                    <Link to={`/teacher/contents/${content.id}/edit`}>
                      <Button variant="outline" size="sm">
                        ویرایش
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(content.id, content.is_active)}
                    >
                      {content.is_active ? 'غیرفعال' : 'فعال'}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(content.id)}
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
