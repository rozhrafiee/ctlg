import { cn } from '../../lib/utils';

export default function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900',
        'focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400',
        className
      )}
      {...props}
    />
  );
}
