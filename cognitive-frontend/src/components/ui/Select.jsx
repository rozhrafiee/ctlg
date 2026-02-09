import { cn } from '../../lib/utils';

export default function Select({ className, ...props }) {
  return (
    <select
      className={cn(
        'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900',
        'focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400',
        className
      )}
      {...props}
    />
  );
}
