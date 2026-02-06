import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const PlacementTest = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPlacementTests();
  }, []);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchPlacementTests = async () => {
    try {
      const { data } = await api.get('/assessment/tests/');
      const placement = data.find((t) => t.test_type === 'placement');
      if (placement) {
        setTests([placement]);
        setSelectedTest(placement);
      } else {
        alert('هیچ آزمون تعیین سطحی موجود نیست');
      }
    } catch (error) {
      console.error('خطا در دریافت آزمون‌ها:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    if (!selectedTest) return;
    try {
      const { data } = await api.post(`/assessment/tests/${selectedTest.id}/start/`);
      setSessionId(data.id);
      setTimeLeft(selectedTest.time_limit_minutes * 60);
      await fetchQuestions(selectedTest.id);
    } catch (error) {
      console.error('خطا در شروع آزمون:', error);
      alert('خطا در شروع آزمون. لطفاً دوباره تلاش کنید.');
    }
  };

  const fetchQuestions = async (testId) => {
    try {
      const { data } = await api.get(`/assessment/teacher/tests/${testId}/questions/list/`);
      setQuestions(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('خطا در دریافت سوالات:', error);
    }
  };

  const handleAnswerChange = async (questionId, answerData) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerData }));

    try {
      await api.post(`/assessment/sessions/${sessionId}/questions/${questionId}/answer/`, answerData);
    } catch (error) {
      console.error('خطا در ذخیره پاسخ:', error);
    }
  };

  const handleFinishTest = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const { data } = await api.post(`/assessment/sessions/${sessionId}/finish/`);
      alert(`آزمون با موفقیت ارسال شد!\nنمره: ${data.score?.toFixed(1) || 'در حال بررسی'}`);

      const updatedUser = { ...user, has_taken_placement_test: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      navigate('/student/dashboard');
    } catch (error) {
      console.error('خطا در ارسال آزمون:', error);
      alert('خطا در ارسال آزمون');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!selectedTest) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">آزمون موجود نیست</h2>
          <p className="text-slate-600">
            در حال حاضر هیچ آزمون تعیین سطحی موجود نیست. لطفاً با پشتیبانی تماس بگیرید.
          </p>
        </Card>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="p-8 bg-white shadow-xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">آزمون تعیین سطح</h1>
              <p className="text-slate-600">
                این آزمون برای تعیین سطح یادگیری شما اجباری است
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">نام آزمون:</span>
                <span className="font-semibold text-slate-900">{selectedTest.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">مدت زمان:</span>
                <Badge className="bg-indigo-100 text-indigo-700">
                  {selectedTest.time_limit_minutes} دقیقه
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">تعداد سوالات:</span>
                <span className="font-semibold text-slate-900">نامشخص</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">نکات مهم:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>پاسخ‌های شما به صورت خودکار ذخیره می‌شود</li>
                    <li>پس از اتمام زمان، آزمون به طور خودکار ارسال خواهد شد</li>
                    <li>بعد از شروع، امکان خروج از آزمون وجود ندارد</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleStartTest}
              className="w-full py-6 text-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              <CheckCircle className="w-5 h-5 ml-2" />
              شروع آزمون
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Timer and Progress */}
        <div className="sticky top-4 z-10 mb-6">
          <Card className="p-4 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className="text-lg px-4 py-2 bg-slate-100 text-slate-700">
                  سوال {currentQuestionIndex + 1} از {questions.length}
                </Badge>
                <div className="h-2 w-48 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                <span
                  className={`text-lg font-bold ${
                    timeLeft < 60 ? 'text-red-500' : 'text-slate-700'
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 bg-white shadow-lg mb-6">
              <div className="mb-6">
                <Badge className="mb-4 bg-indigo-100 text-indigo-700">
                  {currentQuestion.category}
                </Badge>
                <h2 className="text-2xl font-bold text-slate-900 leading-relaxed">
                  {currentQuestion.text}
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                  امتیاز: {currentQuestion.points} نمره
                </p>
              </div>

              {/* MCQ */}
              {currentQuestion.question_type === 'mcq' && (
                <div className="space-y-3">
                  {currentQuestion.choices
                    .sort((a, b) => a.order - b.order)
                    .map((choice) => (
                      <label
                        key={choice.id}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          answers[currentQuestion.id]?.selected_choice === choice.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          checked={answers[currentQuestion.id]?.selected_choice === choice.id}
                          onChange={() =>
                            handleAnswerChange(currentQuestion.id, { selected_choice: choice.id })
                          }
                          className="ml-3 w-5 h-5 text-indigo-600"
                        />
                        <span className="text-slate-900">{choice.text}</span>
                      </label>
                    ))}
                </div>
              )}

              {/* Descriptive */}
              {currentQuestion.question_type === 'descriptive' && (
                <textarea
                  value={answers[currentQuestion.id]?.text_answer || ''}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion.id, { text_answer: e.target.value })
                  }
                  placeholder="پاسخ خود را بنویسید..."
                  className="w-full min-h-[200px] p-4 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                />
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            سوال قبلی
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500"
            >
              سوال بعدی
            </Button>
          ) : (
            <Button
              onClick={handleFinishTest}
              disabled={submitting}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  در حال ارسال...
                </span>
              ) : (
                <>
                  <Send className="w-5 h-5 ml-2" />
                  ارسال نهایی
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlacementTest;
