import { cn } from '../../lib/utils';

export default function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-neutral-200/90 bg-primary-soft/30 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400',
        'shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary',
        'hover:border-primary/20 hover:bg-primary-soft/40 focus:bg-white',
        className
      )}
      {...props}
    />
  );
}
