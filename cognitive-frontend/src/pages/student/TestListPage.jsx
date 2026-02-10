import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAssessment } from '../../hooks/useAssessment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';

export default function TestListPage() {
  const { fetchAvailableTests } = useAssessment();
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchAvailableTests();
      setTests(data || []);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="آزمون‌های قابل انجام" subtitle="لیست آزمون‌های فعال برای شما" />
      {tests.map((test) => (
        <Card key={test.id} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{test.title}</h3>
              <Badge tone="teal">{test.test_type}</Badge>
            </div>
            <div className="text-xs text-slate-500">{test.description}</div>
          </div>
          <Link to={`/student/tests/${test.id}/take`}>
            <Button>شروع آزمون</Button>
          </Link>
        </Card>
      ))}
      {!tests.length && <Card>آزمونی وجود ندارد.</Card>}
    </div>
  );
}
