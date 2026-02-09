import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdaptive } from '../../hooks/useAdaptive';
import { useAssessment } from '../../hooks/useAssessment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';

export default function TeacherContentList() {
  const { fetchTeacherContents, deleteContent } = useAdaptive();
  const { createTestForContent } = useAssessment();
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    const data = await fetchTeacherContents();
    setItems(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="محتواهای من"
        subtitle="مدیریت محتوای آموزشی"
        actions={<Button onClick={() => navigate('/teacher/contents/create')}>محتوای جدید</Button>}
      />
      {items.map((item) => (
        <Card key={item.id} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <Badge tone="teal">{item.content_type}</Badge>
            </div>
            <p className="text-xs text-slate-500">سطح {item.min_level} تا {item.max_level}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/teacher/contents/${item.id}/edit`}><Button variant="secondary">ویرایش</Button></Link>
            <Button
              variant="secondary"
              onClick={async () => {
                const res = await createTestForContent(item.id);
                const testId = res?.test?.id;
                if (testId) navigate(`/teacher/tests/${testId}/questions`);
              }}
            >
              ساخت آزمون از محتوا
            </Button>
            <Button variant="ghost" onClick={async () => { await deleteContent(item.id); load(); }}>حذف</Button>
          </div>
        </Card>
      ))}
      {!items.length && <Card>محتوایی ثبت نشده است.</Card>}
    </div>
  );
}
