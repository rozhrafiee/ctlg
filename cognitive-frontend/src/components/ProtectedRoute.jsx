import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR').format(date);
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getLevelBadge(level) {
  if (level >= 90) return { text: 'الماس شناختی', color: 'bg-purple-500' };
  if (level >= 75) return { text: 'طلایی', color: 'bg-yellow-500' };
  if (level >= 50) return { text: 'نقره‌ای', color: 'bg-gray-400' };
  if (level >= 25) return { text: 'برنزی', color: 'bg-orange-600' };
  return { text: 'نوآموز', color: 'bg-blue-500' };
}
