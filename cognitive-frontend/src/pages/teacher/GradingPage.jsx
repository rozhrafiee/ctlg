import { useEffect, useState } from 'react';
import { useAssessment } from '../../hooks/useAssessment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';

export default function GradingPage() {
  const { fetchPendingReviews, fetchSessionDetails, submitManualGrade } = useAssessment();
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [grades, setGrades] = useState({});

  const load = async () => {
    const data = await fetchPendingReviews();
    setSessions(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const openSession = async (sessionId) => {
    const data = await fetchSessionDetails(sessionId);
    setSelected(data);
    const initialGrades = {};
    data.answers.forEach((ans) => {
      initialGrades[ans.id] = ans.score_earned ?? 0;
    });
    setGrades(initialGrades);
  };

  const submit = async () => {
    const payload = Object.entries(grades).map(([answerId, score]) => ({
      answer_id: Number(answerId),
      score: Number(score)
    }));
    await submitManualGrade(selected.session.id, payload);
    setSelected(null);
    load();
  };

  return (
    <div className="space-y-4">
      <PageHeader title="تصحیح و بررسی" subtitle="بررسی پاسخ‌های تشریحی شهروندان" />
      <div className="grid lg:grid-cols-2 gap-6">
      <Card className="border-primary/10">
        <h3 className="section-title mb-3 text-neutral-800">در انتظار تصحیح</h3>
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-neutral-900">{s.test_title}</div>
                <div className="text-xs text-neutral-500">{s.user_full_name}</div>
              </div>
              <Button variant="secondary" onClick={() => openSession(s.id)}>باز کردن</Button>
            </div>
          ))}
          {!sessions.length && <div className="text-sm text-neutral-500">موردی وجود ندارد.</div>}
        </div>
      </Card>

      <Card className="border-primary/10">
        <h3 className="section-title mb-3 text-neutral-800">تصحیح دستی</h3>
        {!selected && <div className="text-sm text-neutral-500">یک جلسه را انتخاب کنید.</div>}
        {selected && (
          <div className="space-y-3">
            {selected.answers.map((ans) => (
              <div key={ans.id} className="rounded-xl bg-primary-soft/30 p-3 border border-primary/10">
                <div className="text-sm font-semibold text-neutral-900">{ans.question_text}</div>
                <div className="text-xs text-neutral-500">پاسخ: {ans.text_answer || ans.user_choice_text || '-'}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-neutral-500">امتیاز:</span>
                  <Input
                    type="number"
                    min="0"
                    value={grades[ans.id] ?? 0}
                    onChange={(e) => setGrades((prev) => ({ ...prev, [ans.id]: e.target.value }))}
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Button onClick={submit}>ثبت نمرات</Button>
              <Button variant="secondary" onClick={() => setSelected(null)}>بستن</Button>
            </div>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
}
