import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAssessment } from '../../hooks/useAssessment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import PageHeader from '../../components/ui/PageHeader';

export default function TeacherTestList() {
  const { fetchTeacherTests, deleteTest, loading } = useAssessment();
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    const data = await fetchTeacherTests();
    setTests(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !tests.length) return <Spinner />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="آزمون‌های من"
        subtitle="مدیریت آزمون‌های ساخته شده"
        actions={<Button onClick={() => navigate('/teacher/tests/create')}>آزمون جدید</Button>}
      />
      {tests.map((test) => (
        <Card key={test.id} className="flex items-center justify-between border-neutral-200/80 hover:border-primary/20 transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-900">{test.title}</h3>
              <Badge tone="teal">{test.test_type}</Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-1">{test.description}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/teacher/tests/${test.id}/questions`}><Button variant="secondary">سوالات</Button></Link>
            <Link to={`/teacher/tests/${test.id}/edit`}><Button variant="secondary">ویرایش</Button></Link>
            <Button variant="ghost" onClick={async () => { await deleteTest(test.id); load(); }}>حذف</Button>
          </div>
        </Card>
      ))}
      {!tests.length && (
        <Card>هنوز آزمونی ثبت نشده است.</Card>
      )}
    </div>
  );
}
