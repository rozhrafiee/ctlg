import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAssessment } from '../../hooks/useAssessment';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import PageHeader from '../../components/ui/PageHeader';

export default function TestTaking() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { fetchTestDetail, startTest, submitAnswer, finishTest } = useAssessment();
  const { refreshProfile } = useAuth();
  const [test, setTest] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const load = async () => {
      const detail = await fetchTestDetail(testId);
      setTest(detail);
      const session = await startTest(testId);
      setSessionId(session.id);
    };
    load();
  }, [testId]);

  const setAnswer = (qid, payload) => {
    setAnswers((prev) => ({ ...prev, [qid]: payload }));
  };

  const saveAnswers = async () => {
    if (!sessionId || !test?.questions) return;
    for (const q of test.questions) {
      const payload = answers[q.id] || {};
      await submitAnswer(sessionId, q.id, payload);
    }
  };

  const finish = async () => {
    await saveAnswers();
    await finishTest(sessionId);
    await refreshProfile();
    navigate(`/student/tests/${sessionId}/result`);
  };

  if (!test) return <Card>در حال بارگذاری...</Card>;

  return (
    <div className="space-y-4">
      <PageHeader title={test.title} subtitle={test.description} />

      {test.questions?.map((q, idx) => (
        <Card key={q.id}>
          <div className="text-sm text-slate-500">سوال {idx + 1}</div>
          <div className="mt-2 font-semibold">{q.text}</div>
          {q.question_type === 'mcq' ? (
            <div className="mt-3 space-y-2">
              {q.choices?.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    onChange={() => setAnswer(q.id, { selected_choice: c.id })}
                  />
                  {c.text}
                </label>
              ))}
            </div>
          ) : (
            <Textarea
              rows={3}
              placeholder="پاسخ تشریحی"
              onChange={(e) => setAnswer(q.id, { text_answer: e.target.value })}
            />
          )}
        </Card>
      ))}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={saveAnswers}>ذخیره پاسخ‌ها</Button>
        <Button onClick={finish}>اتمام آزمون</Button>
      </div>
    </div>
  );
}
