import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAdaptive } from '../../hooks/useAdaptive';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';

export default function ContentDetailPage() {
  const { id } = useParams();
  const { fetchContentDetail, updateProgress } = useAdaptive();
  const [content, setContent] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchContentDetail(id);
      setContent(data);
    };
    load();
  }, [id]);

  if (!content) return <Card>در حال بارگذاری...</Card>;

  return (
    <div className="space-y-4">
      <PageHeader title={content.title} subtitle={`سطح ${content.min_level} تا ${content.max_level}`} />
      {content.content_type === 'text' && (
        <Card>
          <p className="whitespace-pre-line text-sm text-slate-700">{content.body}</p>
        </Card>
      )}
      {content.content_type === 'video' && (
        <Card>
          <a className="text-brand underline" href={content.video_url} target="_blank" rel="noreferrer">
            مشاهده ویدئو
          </a>
        </Card>
      )}
      <div>
        <Button onClick={() => updateProgress(id, 100)}>علامت‌گذاری به‌عنوان تکمیل‌شده</Button>
      </div>
    </div>
  );
}
