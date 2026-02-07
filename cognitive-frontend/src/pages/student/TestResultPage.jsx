import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAssessment } from '../../hooks/useAssessment';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import "@/styles/global-styles.css";
import "@/styles/page-styles.css";
import { 
  Trophy, Target, Clock, CheckCircle, 
  XCircle, Home, RotateCcw 
} from 'lucide-react';

export default function TestResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchTestResult } = useAssessment();
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, [sessionId]);

  const loadResult = async () => {
    setLoading(true);
    try {
      const data = await fetchTestResult(sessionId);
      setResult(data);
    } catch (error) {
      console.error('Failed to load result:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <p className="text-gray-500">نتیجه یافت نشد</p>
          <Button onClick={() => navigate('/student/dashboard')} className="mt-4">
            بازگشت
          </Button>
        </Card>
      </div>
    );
  }

  const session = result?.session ?? result;
  const score = session?.total_score ?? location.state?.score ?? 0;
  const isPassed = score >= (session?.test?.passing_score || 70);
  const answersList = result?.answers ?? session?.answers ?? [];
  const correctAnswers = answersList.filter(a => a.is_correct).length || 0;
  const totalQuestions = answersList.length || 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Result Header */}
      <Card className={`p-8 text-center ${isPassed ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-orange-50 to-red-50'}`}>
        <div className="mb-4">
          {isPassed ? (
            <Trophy className="w-16 h-16 text-green-600 mx-auto" />
          ) : (
            <Target className="w-16 h-16 text-orange-600 mx-auto" />
          )}
        </div>
        
        <h1 className="text-3xl font-bold mb-2">
          {isPassed ? 'تبریک! شما قبول شدید' : 'متاسفانه قبول نشدید'}
        </h1>
        
        <div className="text-6xl font-bold mb-4" style={{ color: isPassed ? '#16a34a' : '#ea580c' }}>
          {Math.round(score)}%
        </div>
        
        <Badge variant={isPassed ? 'success' : 'warning'} className="text-lg px-6 py-2">
          {isPassed ? 'قبول' : 'مردود'}
        </Badge>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">پاسخ صحیح</span>
          </div>
          <p className="text-2xl font-bold">{correctAnswers} / {totalQuestions}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">نمره قبولی</span>
          </div>
          <p className="text-2xl font-bold">{session?.test?.passing_score ?? 70}%</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">زمان سپری شده</span>
          </div>
          <p className="text-2xl font-bold">
            {session?.finished_at && session?.started_at ? Math.round((new Date(session.finished_at) - new Date(session.started_at)) / 60000) : '-'} دقیقه
          </p>
        </Card>
      </div>

      {/* Answers Review */}
      {answersList && answersList.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">بررسی پاسخ‌ها</h2>
          <div className="space-y-4">
            {answersList.map((answer, idx) => (
              <div 
                key={answer.id}
                className={`p-4 rounded-lg border-2 ${
                  answer.is_correct 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">سوال {idx + 1}</span>
                    {answer.is_correct ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <Badge variant={answer.is_correct ? 'success' : 'error'}>
                    {answer.score_earned} / {answer.question.points}
                  </Badge>
                </div>
                
                <p className="text-gray-700 mb-2">{answer.question.question_text}</p>
                
                {answer.selected_choice && (
                  <p className={`text-sm ${answer.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                    پاسخ شما: {answer.selected_choice.choice_text}
                  </p>
                )}
                
                {!answer.is_correct && answer.question.correct_choice && (
                  <p className="text-sm text-green-700 mt-1">
                    پاسخ صحیح: {answer.question.correct_choice.choice_text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={() => navigate('/student/dashboard')}
          variant="outline"
          className="flex-1"
        >
          <Home className="w-4 h-4 ml-2" />
          داشبورد
        </Button>
        
        {!isPassed && (
          <Button 
            onClick={() => navigate(`/student/tests/${session?.test?.id}/take`)}
            variant="primary"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 ml-2" />
            تلاش مجدد
          </Button>
        )}
      </div>
    </div>
  );
}
