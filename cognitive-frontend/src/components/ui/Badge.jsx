import { cn } from '../../lib/utils';

export default function Badge({ tone = 'slate', className, ...props }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    teal: 'bg-cyan-100 text-cyan-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
  };

  return (
    <span
      className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', tones[tone], className)}
      {...props}
    />
  );
}
