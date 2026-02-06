import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Brain, BookOpen, TrendingUp, Users } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      if (user.role === 'student') {
        navigate('/student/dashboard');
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              سیستم یادگیری هوشمند شناختی
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100">
              یادگیری شخصی‌سازی شده بر اساس سطح شناختی شما
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              {user ? 'ورود به داشبورد' : 'شروع کنید'}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            ویژگی‌های سیستم
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Brain}
              title="ارزیابی شناختی"
              description="تعیین سطح شناختی دقیق با تست تخصصی"
              color="bg-blue-500"
            />
            <FeatureCard
              icon={TrendingUp}
              title="یادگیری تطبیقی"
              description="محتوا متناسب با سطح شما پیشنهاد می‌شود"
              color="bg-green-500"
            />
            <FeatureCard
              icon={BookOpen}
              title="مسیر یادگیری"
              description="مسیر آموزشی شخصی‌سازی شده"
              color="bg-purple-500"
            />
            <FeatureCard
              icon={Users}
              title="پنل استاد"
              description="مدیریت محتوا و ارزیابی دانش‌آموزان"
              color="bg-pink-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            چگونه کار می‌کند؟
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <StepCard
              number="1"
              title="ثبت نام و تست تعیین سطح"
              description="ابتدا ثبت نام کنید و تست تعیین سطح شناختی را انجام دهید تا سیستم بتواند سطح دقیق شما را تشخیص دهد."
            />
            <StepCard
              number="2"
              title="دریافت محتوای پیشنهادی"
              description="بر اساس سطح شناختی شما، محتوای آموزشی مناسب پیشنهاد می‌شود و مسیر یادگیری شخصی ایجاد می‌گردد."
            />
            <StepCard
              number="3"
              title="یادگیری و پیشرفت"
              description="با مطالعه محتواها و انجام آزمون‌ها، پیشرفت کنید و سطح شناختی خود را ارتقا دهید."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            آماده شروع یادگیری هوشمند هستید؟
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            همین حالا ثبت نام کنید و تجربه یادگیری متفاوت را آغاز کنید
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            ثبت نام رایگان
          </Button>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className={`${color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="flex items-start gap-6">
      <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-lg">{description}</p>
      </div>
    </div>
  );
}

export default HomePage;
