import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';

export default function TestGraphsPage() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch test graph data from backend
    const loadGraphData = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/teacher/test-graphs/');
        // const data = await response.json();
        // setGraphData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading graph data:', error);
        setLoading(false);
      }
    };

    loadGraphData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-neutral-500">درحال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="گراف‌های تست و پوشش کد">
        <div className="p-6">
          <p className="text-neutral-600 mb-4">
            این صفحه برای نمایش گراف‌های پوشش کد، تست‌های جهش (Mutation Testing) و آمار آزمون‌ها طراحی شده است.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-neutral-200 rounded p-4">
              <h3 className="font-semibold text-primary mb-3">گراف پوشش کد</h3>
              <div className="h-48 flex items-center justify-center bg-neutral-50 rounded">
                <span className="text-neutral-400">نمودار پوشش کد</span>
              </div>
            </div>

            <div className="border border-neutral-200 rounded p-4">
              <h3 className="font-semibold text-primary mb-3">آمار تست‌های جهش</h3>
              <div className="h-48 flex items-center justify-center bg-neutral-50 rounded">
                <span className="text-neutral-400">نمودار تست‌های جهش</span>
              </div>
            </div>

            <div className="border border-neutral-200 rounded p-4 md:col-span-2">
              <h3 className="font-semibold text-primary mb-3">آمار آزمون‌های دانش‌آموزان</h3>
              <div className="h-48 flex items-center justify-center bg-neutral-50 rounded">
                <span className="text-neutral-400">نمودار کارایی آزمون‌ها</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
