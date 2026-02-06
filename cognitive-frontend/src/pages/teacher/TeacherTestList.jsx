import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/axios';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

/**
 * 📝 لیست آزمون‌های استاد
 * 
 * ویژگی‌ها:
 * - نمایش لیست آزمون‌های ساخته شده
 * - ویرایش/حذف آزمون
 * - مشاهده آمار آزمون
 * - ایجاد آزمون جدید
 */
export default function TeacherTestList() {
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/assessments/teacher/tests/');
      setTests(response.data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'خطا در بارگذاری آزمون‌ها',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (testId) => {
    if (!confirm('آیا از حذف این آزمون اطمینان دارید؟')) {
      return;
    }

    try {
      await api.delete(`/assessments/teacher/tests/${testId}/delete/`);
      setMessage({
        type: 'success',
        text: 'آزمون با موفقیت حذف شد',
      });
      fetchTests(); // به‌روزرسانی لیست
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'خطا در حذف آزمون',
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
          <h1 className="text-3xl font-bold mb-2">آزمون‌های من</h1>
          <p className="text-gray-600">
            مدیریت و ویرایش آزمون‌های ساخته شده
          </p>
        </div>

        <Link to="/teacher/create-test">
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
            آزمون جدید
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

      {/* لیست آزمون‌ها */}
      {tests.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              هنوز آزمونی ساخته نشده
            </h3>
            <p className="text-gray-600 mb-6">
              برای شروع، اولین آزمون خود را بسازید
            </p>
            <Link to="/teacher/create-test">
              <Button>ساخت آزمون جدید</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tests.map((test) => (
            <Card key={test.id}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {test.title}
                    </h3>
                    
                    {test.description && (
                      <p className="text-gray-600 mb-4">
                        {test.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">تعداد سوالات:</span>
                        <div className="font-medium">{test.question_count || 0}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">زمان:</span>
                        <div className="font-medium">{test.time_limit || '-'} دقیقه</div>
                      </div>
                      <div>
                        <span className="text-gray-500">نوع:</span>
                        <div className="font-medium">
                          {test.is_placement ? 'تعیین سطح' : 'عادی'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">وضعیت:</span>
                        <div className="font-medium">
                          {test.is_active ? (
                            <span className="text-green-600">فعال</span>
                          ) : (
                            <span className="text-gray-500">غیرفعال</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* آمار */}
                    {test.stats && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">شرکت‌کنندگان:</span>
                          <div className="font-medium text-blue-600">
                            {test.stats.participants || 0} نفر
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">میانگین نمره:</span>
                          <div className="font-medium text-green-600">
                            {test.stats.average_score || '-'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">نیازمند نمره‌دهی:</span>
                          <div className="font-medium text-orange-600">
                            {test.stats.pending_grading || 0}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* دکمه‌ها */}
                  <div className="flex flex-col gap-2 mr-4">
                    <Link to={`/teacher/edit-test/${test.id}`}>
                      <Button variant="outline" size="sm">
                        ویرایش
                      </Button>
                    </Link>
                    
                    <Link to={`/teacher/test/${test.id}/results`}>
                      <Button variant="outline" size="sm">
                        نتایج
                      </Button>
                    </Link>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(test.id)}
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
