import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-primary-soft/40 border border-primary/15 text-neutral-700 hover:bg-primary-soft/60 hover:border-primary/25',
  ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
  accent: 'bg-accent text-white hover:bg-accent-dark',
};

export default function Button({ variant = 'primary', className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2',
        'disabled:opacity-60 disabled:pointer-events-none',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
