import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Book, Lock, CheckCircle, RotateCcw, ArrowRight } from 'lucide-react';
import "@/styles/global-styles.css";
import "@/styles/page-styles.css";

export default function LearningPathPage() {
  const navigate = useNavigate();
  const { learningPath, loading, error, resetLearningPath } = useAdaptiveLearning();
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!confirm('آیا مطمئن هستید؟ مسیر یادگیری شما بازنشانی خواهد شد.')) return;
    
    setResetting(true);
    try {
      await resetLearningPath();
      Alert({ message: 'مسیر یادگیری با موفقیت بازنشانی شد', type: 'success' });
    } catch (err) {
      Alert({ message: 'خطا در بازنشانی مسیر', type: 'error' });
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert type="error">{error}</Alert>
      </div>
    );
  }

  if (!learningPath || !learningPath.items || learningPath.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              مسیر یادگیری یافت نشد
            </h3>
            <p className="text-gray-600 mb-6">
              هنوز مسیر یادگیری برای شما ایجاد نشده است.
            </p>
            <Button onClick={() => navigate('/student/dashboard')}>
              بازگشت به داشبورد
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">مسیر یادگیری من</h1>
          <p className="text-gray-600">
            {learningPath.name || 'مسیر یادگیری تطبیقی'}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={resetting}
        >
          <RotateCcw className="w-4 h-4 ml-2" />
          {resetting ? 'در حال بازنشانی...' : 'بازنشانی مسیر'}
        </Button>
      </div>

      {/* Learning Path Items */}
      <div className="space-y-4">
        {learningPath.items.map((item, index) => (
          <Card 
            key={item.id}
            className={`${!item.is_unlocked ? 'opacity-60' : ''} transition-all hover:shadow-lg`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 space-x-reverse flex-1">
                  {/* Number Badge */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                    ${item.is_unlocked 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {index + 1}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.content.title}
                      </h3>
                      {item.is_unlocked ? (
                        <Badge variant="success">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          باز شده
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Lock className="w-3 h-3 ml-1" />
                          قفل
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-3">
                      {item.content.content_type === 'video' ? '📹 ویدئو' : '📝 متن'}
                      {' • '}
                      سطح {item.content.min_level} تا {item.content.max_level}
                    </p>

                    {item.content.body && (
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {item.content.body}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {item.is_unlocked && (
                  <Button
                    onClick={() => navigate(`/student/content/${item.content.id}`)}
                    size="sm"
                  >
                    شروع
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Info */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h4 className="font-semibold text-gray-900 mb-2">💡 نکته:</h4>
          <p className="text-gray-600 text-sm">
            محتواهای بعدی با تکمیل محتوای قبلی باز می‌شوند. 
            برای بهترین نتیجه، مسیر را به ترتیب طی کنید.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
