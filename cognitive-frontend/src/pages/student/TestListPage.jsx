import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Alert } from '../../components/ui/Alert';
import { FileText, Clock, AlertCircle } from 'lucide-react';

export function TestListPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/assessment/tests/available/');
      setTests(response.data);
    } catch (err) {
      setError('خطا در دریافت لیست آزمون‌ها');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (testId) => {
    navigate(`/student/tests/${testId}/take`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">آزمون‌های موجود</h1>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError('')} className="mb-6">
          {error}
        </Alert>
      )}

      {tests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="آزمونی موجود نیست"
          description="در حال حاضر آزمونی برای شما تعریف نشده است"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tests.map(test => (
            <div
              key={test.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{test.title}</h3>
                <Badge variant={test.is_active ? 'success' : 'default'}>
                  {test.is_active ? 'فعال' : 'غیرفعال'}
                </Badge>
              </div>

              {test.description && (
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                  {test.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 ml-2" />
                  <span>مدت زمان: {test.duration} دقیقه</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FileText className="w-4 h-4 ml-2" />
                  <span>تعداد سوالات: {test.questions_count || 0}</span>
                </div>
              </div>

              {test.passing_score && (
                <div className="bg-blue-50 rounded p-3 mb-4">
                  <div className="flex items-center text-sm text-blue-800">
                    <AlertCircle className="w-4 h-4 ml-2" />
                    <span>نمره قبولی: {test.passing_score} از {test.total_score}</span>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                className="w-full"
                onClick={() => handleStartTest(test.id)}
                disabled={!test.is_active}
              >
                شروع آزمون
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TestListPage;
