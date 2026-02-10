import { cn } from '../../lib/utils';

export default function Card({ className, ...props }) {
  return (
    <div className={cn('surface p-5', className)} {...props} />
  );
}
