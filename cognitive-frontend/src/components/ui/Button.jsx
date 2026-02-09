import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800',
  secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  accent: 'bg-amber-500 text-white hover:bg-amber-600',
};

export default function Button({ variant = 'primary', className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
        'focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2',
        'disabled:opacity-60 disabled:pointer-events-none',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
