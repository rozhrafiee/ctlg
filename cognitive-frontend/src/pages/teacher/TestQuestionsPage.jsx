import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAssessment } from '../../hooks/useAssessment';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ArrowRight, Plus, Edit, Trash2, FileQuestion } from 'lucide-react';
import QuestionFormModal from '../../components/assessment/QuestionFormModal';

export default function TestQuestionsPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { fetchTestQuestions, deleteQuestion } = useAssessment();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, [testId]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await fetchTestQuestions(testId);
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('آیا از حذف این سوال اطمینان دارید؟')) return;
    
    try {
      await deleteQuestion(questionId);
      alert('سوال با موفقیت حذف شد');
      loadQuestions();
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('خطا در حذف سوال');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleModalClose = (success) => {
    setShowModal(false);
    setEditingQuestion(null);
    if (success) {
      loadQuestions();
    }
  };

  const getQuestionTypeLabel = (type) => {
    const types = {
      multiple_choice: 'چند گزینه‌ای',
      true_false: 'درست/نادرست',
      short_answer: 'پاسخ کوتاه',
      essay: 'تشریحی'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Button 
          onClick={() => navigate('/teacher/tests')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت به لیست آزمون‌ها
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">مدیریت سوالات</h1>
            <p className="text-gray-600 mt-2">افزودن و ویرایش سوالات آزمون</p>
          </div>
          <Button
            onClick={() => {
              setEditingQuestion(null);
              setShowModal(true);
            }}
            variant="primary"
          >
            <Plus className="w-4 h-4 ml-2" />
            افزودن سوال جدید
          </Button>
        </div>
      </div>

      {questions.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="هنوز سوالی اضافه نکرده‌اید"
          description="با کلیک روی دکمه بالا اولین سوال را اضافه کنید"
        />
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg">سوال {index + 1}</span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      {getQuestionTypeLabel(question.question_type)}
                    </span>
                    <span className="text-sm text-gray-600">
                      امتیاز: {question.points}
                    </span>
                  </div>
                  <p className="text-gray-800">{question.question_text}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(question)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(question.id)}
                    variant="danger"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {question.question_type === 'multiple_choice' && question.choices && (
                <div className="mt-4 space-y-2">
                  {question.choices.map((choice) => (
                    <div
                      key={choice.id}
                      className={`p-3 rounded-lg ${
                        choice.is_correct
                          ? 'bg-green-50 border-2 border-green-500'
                          : 'bg-gray-50'
                      }`}
                  >
                      <div className="flex items-center gap-2">
                        {choice.is_correct && (
                          <span className="text-green-600 font-bold">✓</span>
                        )}
                        <span>{choice.choice_text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <QuestionFormModal
          testId={testId}
          question={editingQuestion}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
