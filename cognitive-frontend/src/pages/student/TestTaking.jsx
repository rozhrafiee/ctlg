import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Send, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import api from '../../api/axios';
import { useParams, useNavigate } from 'react-router-dom';

const TestTaking = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    initTest();
  }, [testId]);

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

  const initTest = async () => {
    try {
      const { data: testData } = await api.get(`/assessment/tests/`);
      const selectedTest = testData.find((t) => t.id === parseInt(testId));

      if (!selectedTest) {
        alert('آزمون یافت نشد');
        navigate('/student/tests');
        return;
      }

      setTest(selectedTest);
      await startSession(selectedTest);
      await fetchQuestions(selectedTest.id);
    } catch (error) {
      console.error('خطا در شروع آزمون:', error);
      alert('خطا در بارگذاری آزمون');
      navigate('/student/tests');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (testData) => {
    try {
      const { data } = await api.post(`/assessment/tests/${testData.id}/start/`);
      setSessionId(data.id);
      setTimeLeft(testData.time_limit_minutes * 60);
    } catch (error) {
      throw error;
    }
  };

  const fetchQuestions = async (testId) => {
    try {
      const { data } = await api.get(`/assessment/teacher/tests/${testId}/questions/list/`);
      setQuestions(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      throw error;
    }
  };

  const handleAnswerChange = async (questionId, answerData) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerData }));

    try {
      await api.post(
        `/assessment/sessions/${sessionId}/questions/${questionId}/answer/`,
        answerData
      );
    } catch (error) {
      console.error('خطا در ذخیره پاسخ:', error);
    }
  };

  const handleFinishTest = async () => {
    if (submitting) return;

    const unansweredCount = questions.filter(
      (q) => !answers[q.id] || (!answers[q.id].selected_choice && !answers[q.id].text_answer)
    ).length;

    if (unansweredCount > 0) {
      const confirm = window.confirm(
        `${unansweredCount} سوال بدون پاسخ باقی مانده است. آیا مطمئن هستید؟`
      );
      if (!confirm) return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post(`/assessment/sessions/${sessionId}/finish/`);

      if (data.status === 'completed') {
        alert(`آزمون با موفقیت ارسال شد!\nنمره: ${data.score?.toFixed(1)}%`);
        navigate(`/student/results/${sessionId}`);
      } else if (data.status === 'pending_review') {
        alert('آزمون ارسال شد و در انتظار بررسی استاد است.');
        navigate('/student/history');
      }
    } catch (error) {
      console.error('خطا در ارسال آزمون:', error);
      alert('خطا در ارسال آزمون. لطفاً دوباره تلاش کنید.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isQuestionAnswered = (questionId) => {
    const answer = answers[questionId];
    return answer && (answer.selected_choice || answer.text_answer?.trim());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with Timer */}
        <div className="sticky top-4 z-10 mb-6">
          <Card className="p-4 bg-white shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{test?.title}</h1>
                <p className="text-sm text-slate-600">
                  سوال {currentQuestionIndex + 1} از {questions.length}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-500' : 'text-slate-600'}`} />
                  <span
                    className={`text-lg font-bold ${
                      timeLeft < 60 ? 'text-red-500' : 'text-slate-700'
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>

                <Button
                  onClick={handleFinishTest}
                  disabled={submitting}
                  className="bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  {submitting ? 'در حال ارسال...' : 'اتمام آزمون'}
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </Card>
        </div>

        {/* Question Navigator */}
        <Card className="p-4 bg-white mb-6">
          <p className="text-sm text-slate-600 mb-3">نمای کلی سوالات:</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  idx === currentQuestionIndex
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : isQuestionAnswered(q.id)
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </Card>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-8 bg-white shadow-lg mb-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-indigo-100 text-indigo-700">
                    {currentQuestion.category}
                  </Badge>
                  <Badge className="bg-slate-100 text-slate-700">
                    {currentQuestion.points} نمره
                  </Badge>
                  {isQuestionAnswered(currentQuestion.id) && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>

                <h2 className="text-2xl font-bold text-slate-900 leading-relaxed">
                  {currentQuestion.text}
                </h2>
              </div>

              {/* MCQ Questions */}
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
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          checked={answers[currentQuestion.id]?.selected_choice === choice.id}
                          onChange={() =>
                            handleAnswerChange(currentQuestion.id, {
                              selected_choice: choice.id,
                            })
                          }
                          className="ml-3 w-5 h-5 text-indigo-600"
                        />
                        <span className="text-slate-900">{choice.text}</span>
                      </label>
                    ))}
                </div>
              )}

              {/* Descriptive Questions */}
              {currentQuestion.question_type === 'descriptive' && (
                <div>
                  <textarea
                    value={answers[currentQuestion.id]?.text_answer || ''}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, {
                        text_answer: e.target.value,
                      })
                    }
                    placeholder="پاسخ خود را اینجا بنویسید..."
                    className="w-full min-h-[250px] p-4 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none transition-colors"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    تعداد کاراکتر: {answers[currentQuestion.id]?.text_answer?.length || 0}
                  </p>
                </div>
              )}

              {/* Warning for unanswered */}
              {!isQuestionAnswered(currentQuestion.id) && (
                <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">این سوال هنوز پاسخ داده نشده است</p>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronRight className="w-5 h-5" />
            سوال قبلی
          </Button>

          <div className="text-sm text-slate-600">
            {questions.filter((q) => isQuestionAnswered(q.id)).length} از {questions.length} سوال پاسخ داده شده
          </div>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center gap-2"
            >
              سوال بعدی
              <ChevronLeft className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={handleFinishTest}
              disabled={submitting}
              className="bg-gradient-to-r from-green-500 to-emerald-500 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  در حال ارسال...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  ارسال نهایی آزمون
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestTaking;
