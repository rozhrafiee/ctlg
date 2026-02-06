import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function Alert({ children, variant = 'info', onClose }) {
  const variants = {
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600'
    },
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600'
    }
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.text} border rounded-lg p-4 flex items-start gap-3 shadow-lg`}>
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
export default Alert;
