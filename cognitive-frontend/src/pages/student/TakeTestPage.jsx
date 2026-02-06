import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';

/**
 * 📝 صفحه شرکت در آزمون
 * 
 * ویژگی‌ها:
 * - نمایش سوالات به صورت یکی یکی یا همه با هم
 * - تایمر شمارش معکوس
 * - ذخیره خودکار پاسخ‌ها
 * - ارسال نهایی آزمون
 */
export default function TakeTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTest();
  }, [id]);

  useEffect(() => {
    if (!test || !test.time_limit) return;

    // تنظیم تایمر
    setTimeRemaining(test.time_limit * 60); // تبدیل دقیقه به ثانیه

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // ارسال خودکار در پایان زمان
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test]);

  const fetchTest = async () => {
    setIsLoading(true);
    try {
      const [testRes, questionsRes] = await Promise.all([
        api.get(`/assessments/tests/${id}/`),
        api.get(`/assessments/tests/${id}/questions/`),
      ]);

      setTest(testRes.data);
      setQuestions(questionsRes.data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'خطا در بارگذاری آزمون',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!confirm('آیا از ارسال آزمون اطمینان دارید؟')) {
      return;
    }

    setIsSubmitting(true);

    try {
      // ساخت آرایه پاسخ‌ها
      const submissionAnswers = questions.map((q) => ({
        question: q.id,
        answer_text: answers[q.id] || '',
        selected_choice: q.question_type === 'mcq' ? answers[q.id] : null,
      }));

      await api.post(`/assessments/tests/${id}/submit/`, {
        answers: submissionAnswers,
      });

      setMessage({
        type: 'success',
        text: 'آزمون با موفقیت ارسال شد! در حال انتقال...',
      });

      setTimeout(() => {
        navigate('/student/test-results');
      }, 2000);
      
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'خطا در ارسال آزمون',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          آزمون یا سوالات یافت نشد
        </Alert>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* هدر */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{test.title}</h1>
          
          {/* تایمر */}
          <div className={`text-2xl font-bold ${
            timeRemaining < 300 ? 'text-red-600' : 'text-gray-700'
          }`}>
            ⏱️ {formatTime(timeRemaining)}
          </div>
        </div>

        {/* نوار پیشرفت */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          سوال {currentQuestion + 1} از {questions.length}
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

      {/* سوال */}
      <Card>
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-500">
                سوال {currentQuestion + 1}
              </span>
              <span className={`px-2 py-1 text-xs rounded ${
                currentQ.question_type === 'mcq'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {currentQ.question_type === 'mcq' ? 'چهارگزینه‌ای' : 'تشریحی'}
              </span>
              <span className="text-sm text-gray-500 mr-auto">
                {currentQ.points} نمره
              </span>
            </div>
            
            <h2 className="text-xl font-semibold">
              {currentQ.text}
            </h2>
          </div>

          {/* گزینه‌ها (برای سوالات چهارگزینه‌ای) */}
          {currentQ.question_type === 'mcq' && currentQ.choices && (
            <div className="space-y-3">
              {currentQ.choices.map((choice) => (
                <label
                  key={choice.id}
                  className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={choice.id}
                    checked={answers[currentQ.id] === choice.id}
                    onChange={(e) => handleAnswerChange(currentQ.id, choice.id)}
                    className="w-5 h-5 text-primary-600"
                  />
                  <span className="mr-3">{choice.text}</span>
                </label>
              ))}
            </div>
          )}

          {/* پاسخ تشریحی */}
          {currentQ.question_type === 'essay' && (
            <textarea
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="پاسخ خود را اینجا بنویسید..."
            />
          )}
        </div>
      </Card>

      {/* دکمه‌های ناوبری */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          ← قبلی
        </Button>

        <div className="flex gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium ${
                index === currentQuestion
                  ? 'bg-primary-600 text-white'
                  : answers[questions[index].id]
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'در حال ارسال...' : 'ارسال نهایی'}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            بعدی →
          </Button>
        )}
      </div>
    </div>
  );
}
