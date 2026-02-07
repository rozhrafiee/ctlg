import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import QuestionFormModal from '@/components/assessment/QuestionFormModal';
import "@/styles/global-styles.css";
import "@/styles/page-styles.css";

/**
 * ✏️ صفحه ویرایش آزمون
 * 
 * ویژگی‌ها:
 * - ویرایش اطلاعات آزمون
 * - مدیریت سوالات (افزودن/ویرایش/حذف)
 * - تنظیمات زمان و نمره
 */
export default function EditTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTest();
    fetchQuestions();
  }, [id]);

  const fetchTest = async () => {
    try {
      const response = await api.get(`/assessments/teacher/tests/${id}/`);
      setTest(response.data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'خطا در بارگذاری آزمون',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/assessments/tests/${id}/questions/`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleTestUpdate = async (e) => {
    e.preventDefault();
    
    try {
      await api.patch(`/assessments/teacher/tests/${id}/update/`, test);
      setMessage({
        type: 'success',
        text: 'آزمون با موفقیت به‌روزرسانی شد',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'خطا در به‌روزرسانی آزمون',
      });
    }
  };

  const handleAddQuestion = () => {
    setSelectedQuestion(null);
    setIsModalOpen(true);
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('آیا از حذف این سوال اطمینان دارید؟')) {
      return;
    }

    try {
      await api.delete(`/assessments/questions/${questionId}/delete/`);
      setMessage({
        type: 'success',
        text: 'سوال با موفقیت حذف شد',
      });
      fetchQuestions();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'خطا در حذف سوال',
      });
    }
  };

  const handleQuestionSaved = () => {
    setIsModalOpen(false);
    fetchQuestions();
    setMessage({
      type: 'success',
      text: 'سوال با موفقیت ذخیره شد',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          آزمون مورد نظر یافت نشد
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">ویرایش آزمون</h1>
          <p className="text-gray-600">
            ویرایش اطلاعات و سوالات آزمون
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          بازگشت
        </Button>
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

      <div className="space-y-6">
        {/* فرم اطلاعات آزمون */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">اطلاعات آزمون</h2>
            <form onSubmit={handleTestUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان آزمون
                </label>
                <input
                  type="text"
                  value={test.title}
                  onChange={(e) => setTest({ ...test, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  توضیحات
                </label>
                <textarea
                  value={test.description || ''}
                  onChange={(e) => setTest({ ...test, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    زمان (دقیقه)
                  </label>
                  <input
                    type="number"
                    value={test.time_limit || ''}
                    onChange={(e) => setTest({ ...test, time_limit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نمره کل
                  </label>
                  <input
                    type="number"
                    value={test.total_score || ''}
                    onChange={(e) => setTest({ ...test, total_score: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={test.is_placement}
                    onChange={(e) => setTest({ ...test, is_placement: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm">آزمون تعیین سطح</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={test.is_active}
                    onChange={(e) => setTest({ ...test, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm">فعال</label>
                </div>
              </div>

              <Button type="submit">
                ذخیره تغییرات
              </Button>
            </form>
          </div>
        </Card>

        {/* لیست سوالات */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                سوالات ({questions.length})
              </h2>
              <Button onClick={handleAddQuestion}>
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
                افزودن سوال
              </Button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                هنوز سوالی اضافه نشده است
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">سوال {index + 1}</span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            question.question_type === 'mcq'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {question.question_type === 'mcq' ? 'چهارگزینه‌ای' : 'تشریحی'}
                          </span>
                        </div>
                        <p className="text-gray-700">{question.text}</p>
                        <div className="text-sm text-gray-500 mt-2">
                          نمره: {question.points}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditQuestion(question)}
                        >
                          ویرایش
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* مودال افزودن/ویرایش سوال */}
      <QuestionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        testId={id}
        question={selectedQuestion}
        onSave={handleQuestionSaved}
      />
    </div>
  );
}
