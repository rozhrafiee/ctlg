import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAssessment } from '../../hooks/useAssessment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import QuestionFormModal from '../../components/assessment/QuestionFormModal';
import PageHeader from '../../components/ui/PageHeader';

export default function TestQuestionsPage() {
  const { id } = useParams();
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
        actions={<Button onClick={() => { setEditing(null); setShowModal(true); }}>افزودن سوال</Button>}
      />
      {questions.map((q) => (
        <Card key={q.id} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Badge tone="amber">{q.category}</Badge>
              <Badge tone="teal">{q.question_type}</Badge>
              <span>امتیاز: {q.points}</span>
            </div>
            <div className="mt-2 text-slate-900">{q.text}</div>
          </div>
          <div className="flex gap-2">
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
