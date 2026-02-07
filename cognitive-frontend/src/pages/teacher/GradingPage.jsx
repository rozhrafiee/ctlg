import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../hooks/useAssessment';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { FileCheck, Eye } from 'lucide-react';
import GradingModal from '../../components/assessment/GradingModal';
import "@/styles/global-styles.css";
import "@/styles/page-styles.css";


export default function GradingPage() {
  const { fetchPendingReviews } = useAssessment();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadPendingReviews();
  }, []);

  const loadPendingReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchPendingReviews();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load pending reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradingComplete = () => {
    setSelectedSession(null);
    loadPendingReviews();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">تصحیح آزمون‌ها</h1>
        <p className="text-gray-600 mt-2">آزمون‌های در انتظار تصحیح دستی</p>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="آزمونی برای تصحیح وجود ندارد"
          description="همه آزمون‌ها تصحیح شده‌اند"
        />
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-2">
                    {session.test?.title || 'آزمون'}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>دانش‌آموز: {session.user?.full_name || session.user?.username}</p>
                    <p>زمان پایان: {new Date(session.finished_at).toLocaleDateString('fa-IR')}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedSession(session)}
                  variant="primary"
                >
                  <Eye className="w-4 h-4 ml-2" />
                  تصحیح
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedSession && (
        <GradingModal
          session={selectedSession}
          onClose={handleGradingComplete}
        />
      )}
    </div>
  );
}
