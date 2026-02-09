import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAssessment } from '../../hooks/useAssessment';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

export default function TestResultPage() {
  const { sessionId } = useParams();
  const { fetchStudentResult } = useAssessment();
  const { refreshProfile } = useAuth();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchStudentResult(sessionId);
      setResult(data);
      await refreshProfile();
    };
    load();
  }, [sessionId]);

  if (!result) return <Card>در حال بارگذاری...</Card>;

  return (
    <div className="space-y-4">
      <PageHeader title="نتیجه آزمون" subtitle={`وضعیت: ${result.status}`} />
      <Card>
        <div className="text-sm text-slate-600">امتیاز کل: {result.total_score ?? '-'}</div>
      </Card>
      {result.answers?.map((ans) => (
        <Card key={ans.id}>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Badge tone="teal">{ans.question_type}</Badge>
            <Badge tone="amber">{ans.category}</Badge>
          </div>
          <div className="mt-2 font-semibold">{ans.question_text}</div>
          <div className="mt-2 text-sm text-slate-600">
            پاسخ شما: {ans.user_choice_text || ans.text_answer || '-'}
          </div>
          <div className="text-xs text-slate-500">امتیاز: {ans.score_earned ?? 0}</div>
        </Card>
      ))}
    </div>
  );
}
