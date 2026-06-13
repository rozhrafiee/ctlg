import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssessment } from '../../hooks/useAssessment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import QuestionFormModal from '../../components/assessment/QuestionFormModal';
import PageHeader from '../../components/ui/PageHeader';

export default function TestQuestionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchTestQuestions, addQuestion, updateQuestion, deleteQuestion } = useAssessment();
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const data = await fetchTestQuestions(id);
    setQuestions(data || []);
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const onSave = async (payload) => {
    if (editing?.id) {
      await updateQuestion(editing.id, payload);
    } else {
      await addQuestion(id, payload);
    }
    setShowModal(false);
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="سوالات آزمون"
        subtitle="مدیریت و افزودن سوالات آزمون"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => { setEditing(null); setShowModal(true); }}>افزودن سوال</Button>
            <Button variant="secondary" onClick={() => navigate('/teacher/tests')}>ذخیره آزمون</Button>
          </div>
        }
      />
      {questions.map((q) => (
        <Card key={q.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-neutral-200/80 hover:border-primary/20 transition-colors">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <Badge tone="amber">{q.category}</Badge>
              <Badge tone="teal">{q.question_type}</Badge>
              <span>امتیاز: {q.points}</span>
            </div>
            <div className="mt-2 text-neutral-900 break-words">{q.text}</div>
          </div>
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <Button variant="secondary" onClick={() => { setEditing(q); setShowModal(true); }}>ویرایش</Button>
            <Button variant="ghost" onClick={async () => { await deleteQuestion(q.id); load(); }}>حذف</Button>
          </div>
        </Card>
      ))}
      {!questions.length && (
        <Card>سوالی ثبت نشده است.</Card>
      )}

      {showModal && (
        <QuestionFormModal
          initial={editing || {}}
          onSave={onSave}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
