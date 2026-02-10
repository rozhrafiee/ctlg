import { cn } from '../../lib/utils';

export default function Badge({ tone = 'slate', className, ...props }) {
  const tones = {
    slate: 'bg-neutral-100 text-neutral-700',
    teal: 'bg-secondary-soft text-secondary-dark',
    amber: 'bg-accent-soft text-accent-dark',
    rose: 'bg-rose-100 text-rose-700',
  };

  return (
    <span
      className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', tones[tone], className)}
      {...props}
    />
  );
}
