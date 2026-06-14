import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAssessment } from '../../hooks/useAssessment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';

export default function PlacementTestPage() {
  const { fetchAvailableTests } = useAssessment();
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchAvailableTests();
      setTests((data || []).filter((t) => t.test_type === 'placement'));
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="آزمون تعیین سطح سواد شناختی"
        subtitle="۱۰ سوال در سه حوزه حافظه، تمرکز و منطق — نمره نهایی = سطح شناختی شما (۱ تا ۱۰۰)"
      />
      <Card className="text-sm text-slate-600 space-y-2">
        <p>این آزمون برای سنجش توانایی تشخیص اطلاعات گمراه‌کننده در بحران‌های شهری طراحی شده است.</p>
        <p>پس از اتمام، سطح شناختی شما در پروفایل ثبت می‌شود و به آزمون‌ها و محتوای متناسب دسترسی پیدا می‌کنید.</p>
      </Card>
      {tests.map((test) => (
        <Card key={test.id} className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{test.title}</div>
            <div className="text-xs text-slate-500">{test.description}</div>
          </div>
          <Link to={`/student/tests/${test.id}/take`}>
            <Button>شروع</Button>
          </Link>
        </Card>
      ))}
      {!tests.length && <Card>آزمونی برای تعیین سطح وجود ندارد.</Card>}
    </div>
  );
}
