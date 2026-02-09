import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
          {content.file_url ? (
            <div className="space-y-2">
              <video className="w-full max-w-2xl rounded-lg bg-black" src={content.file_url} controls />
              {content.video_url && (
                <a className="text-brand underline block" href={content.video_url} target="_blank" rel="noreferrer">
                  لینک ویدئو (در تب جدید)
                </a>
              )}
            </div>
          ) : content.video_url ? (
            <a className="text-brand underline" href={content.video_url} target="_blank" rel="noreferrer">
              مشاهده ویدئو
            </a>
          ) : (
            <p className="text-neutral-500">ویدئویی برای این محتوا تعریف نشده است.</p>
          )}
        </Card>
      )}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => updateProgress(id, 100)}>علامت‌گذاری به‌عنوان تکمیل‌شده</Button>
        {content.related_test_id && (
          <Link to={`/student/tests/${content.related_test_id}/take`}>
            <Button variant="secondary">شرکت در آزمون محتوایی (نمره ≥۸۰ = دیده‌شده و ارتقای سطح)</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
