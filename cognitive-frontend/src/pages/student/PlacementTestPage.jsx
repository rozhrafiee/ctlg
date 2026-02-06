import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function PlacementTestPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <AlertCircle className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">تست تعیین سطح</h1>
          <p className="text-gray-600">
            برای استفاده از سیستم یادگیری تطبیقی، ابتدا باید تست تعیین سطح را انجام دهید
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">📋 راهنمای آزمون:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="ml-2">•</span>
              <span>این آزمون سطح دانش فعلی شما را ارزیابی می‌کند</span>
            </li>
            <li className="flex items-start">
              <span className="ml-2">•</span>
              <span>مدت زمان: حدود 20-30 دقیقه</span>
            </li>
            <li className="flex items-start">
              <span className="ml-2">•</span>
              <span>تعداد سوالات: 20 سوال</span>
            </li>
            <li className="flex items-start">
              <span className="ml-2">•</span>
              <span>بر اساس نتیجه، محتوای مناسب به شما پیشنهاد می‌شود</span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            to="/student/tests"
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            شروع آزمون
          </Link>
        </div>
      </div>
    </div>
  );
}
