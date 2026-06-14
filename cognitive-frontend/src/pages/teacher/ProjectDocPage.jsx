import Card from '../../components/ui/Card';

export default function ProjectDocPage() {
  return (
    <div className="space-y-4">
      <Card title="توضیح کامل پروژه (ACOC · CFG · Mutation)">
        <p className="text-sm text-slate-600 mb-3">
          همه توضیحات استاد اینجاست: سناریو، فرمول تعداد تست، جهش‌ها، دستور pytest.
        </p>
        <div className="rounded-lg border border-slate-200 overflow-hidden bg-white" style={{ height: '85vh' }}>
          <iframe
            title="توضیح پروژه"
            src="/tozih-proje.html"
            className="w-full h-full border-0"
          />
        </div>
      </Card>
    </div>
  );
}
