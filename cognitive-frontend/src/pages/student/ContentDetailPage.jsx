import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdaptiveLearning } from '../../hooks/useAdaptiveLearning';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import "@/styles/global-styles.css";
import "@/styles/page-styles.css";
import { 
  BookOpen, Clock, Target, CheckCircle, 
  ArrowRight, FileText, Video, Link as LinkIcon 
} from 'lucide-react';

export default function ContentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchContentDetail, updateProgress } = useAdaptiveLearning();
  
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    loadContent();
  }, [id]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const data = await fetchContentDetail(id);
      setContent(data);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await updateProgress(id, 100);
      setContent(prev => ({ ...prev, progress: { ...prev.progress, is_completed: true } }));
    } catch (error) {
      console.error('Failed to mark as complete:', error);
    } finally {
      setCompleting(false);
    }
  };

  const handleStartTest = () => {
    if (content?.related_test) {
      navigate(`/student/tests/${content.related_test.id}/take`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <p className="text-gray-500">محتوا یافت نشد</p>
          <Button onClick={() => navigate('/student/dashboard')} className="mt-4">
            بازگشت به داشبورد
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={content.content_type === 'text' ? 'blue' : content.content_type === 'video' ? 'purple' : 'green'}>
              {content.content_type === 'text' && <FileText className="w-4 h-4 mr-1" />}
              {content.content_type === 'video' && <Video className="w-4 h-4 mr-1" />}
              {content.content_type === 'link' && <LinkIcon className="w-4 h-4 mr-1" />}
              {content.content_type === 'text' ? 'متن' : content.content_type === 'video' ? 'ویدیو' : 'لینک'}
            </Badge>
            <Badge variant="outline">سطح {content.min_level} - {content.max_level}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{content.title}</h1>
          <p className="text-gray-600">{content.description}</p>
        </div>
      </div>

      {/* Progress Status */}
      {content.progress && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {content.progress.is_completed ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">تکمیل شده</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-700 font-medium">
                    پیشرفت: {content.progress.progress_percent}%
                  </span>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          محتوای آموزشی
        </h2>
        
        {content.content_type === 'text' && (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {content.text_content || 'محتوای متنی موجود نیست'}
            </div>
          </div>
        )}

        {content.content_type === 'video' && content.video_url && (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={content.video_url}
              className="w-full h-full"
              allowFullScreen
              title={content.title}
            />
          </div>
        )}

        {content.content_type === 'link' && content.link_url && (
          <div className="p-6 bg-gray-50 rounded-lg">
            <a
              href={content.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-lg"
            >
              <LinkIcon className="w-5 h-5" />
              مشاهده محتوا در سایت خارجی
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </Card>

      {/* Related Test */}
      {content.related_test && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                آزمون مرتبط
              </h3>
              <p className="text-gray-600 mb-1">{content.related_test.title}</p>
              <p className="text-sm text-gray-500">
                {content.related_test.question_count} سوال • {content.related_test.time_limit_minutes} دقیقه
              </p>
            </div>
            <Button onClick={handleStartTest} variant="primary">
              شروع آزمون
              <ArrowRight className="w-4 h-4 mr-2" />
            </Button>
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
          بازگشت
        </Button>
        {!content.progress?.is_completed && (
          <Button 
            onClick={handleComplete}
            disabled={completing}
            variant="primary"
            className="flex-1"
          >
            {completing ? 'در حال ذخیره...' : 'علامت‌گذاری به عنوان تکمیل شده'}
          </Button>
        )}
      </div>
    </div>
  );
}
