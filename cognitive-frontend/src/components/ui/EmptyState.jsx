import Button from './Button';

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="surface p-10 text-center">
      <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-500">{description}</p>
      {actionLabel && (
        <div className="mt-4">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
