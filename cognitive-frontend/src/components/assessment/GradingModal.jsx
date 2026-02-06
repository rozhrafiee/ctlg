import { useState, useEffect } from 'react';
import { useAssessment } from '../../hooks/useAssessment';
import { Button } from '../ui/Button';
import { Input } from '../ui/Form';
import { X, Save } from 'lucide-react';

export default function GradingModal({ session, onClose }) {
  const { fetchSessionDetails, submitManualGrade } = useAssessment();
  const [details, setDetails] = useState(null);
  const [grades, setGrades] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [session.id]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const data = await fetchSessionDetails(session.id);
      setDetails(data);
      
      const initialGrades = {};
      data.answers.forEach(answer => {
        initialGrades[answer.id] = answer.score_earned || 0;
      });
      setGrades(initialGrades);
    } catch (error) {
      console.error('Failed to load session details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (answerId, value) => {
    setGrades(prev => ({
      ...prev,
      [answerId]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const gradesArray = Object.entries(grades).map(([answerId, score]) => ({
        answer_id: parseInt(answerId),
        score: score
      }));
      
      await submitManualGrade(session.id, gradesArray);
      alert('نمره‌ها با موفقیت ثبت شد');
      onClose();
    } catch (error) {
      console.error('Failed to submit grades:', error);
      alert('خطا در ثبت نمره‌ها');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">تصحیح آزمون</h2>
            <p className="text-gray-600 mt-1">
              {details?.session?.test?.title}
            </p>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {details?.answers?.map((answer, index) => (
            <div key={answer.id} className="border rounded-lg p-6">
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">
                  سوال {index + 1}
                </h3>
                <p className="text-gray-800">
                  {answer.question?.question_text}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">پاسخ دانش‌آموز:</p>
                {answer.question?.question_type === 'multiple_choice' ? (
                  <p className="font-medium">
                    {answer.selected_choice?.choice_text || 'پاسخ داده نشده'}
                  </p>
                ) : (
                  <p className="font-medium">
                    {answer.text_answer || 'پاسخ داده نشده'}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    label={`نمره (از ${answer.question?.points})`}
                    type="number"
                    min={0}
                    max={answer.question?.points}
                    step={0.5}
                    value={grades[answer.id] || 0}
                    onChange={(e) => handleGradeChange(answer.id, e.target.value)}
                  />
                </div>
                <div className="text-sm text-gray-600 mt-6">
                  امتیاز کل: {answer.question?.points}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-6 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            variant="primary"
            className="flex-1"
          >
            <Save className="w-4 h-4 ml-2" />
            {submitting ? 'در حال ثبت...' : 'ثبت نمره‌ها'}
          </Button>
        </div>
      </div>
    </div>
  );
}
