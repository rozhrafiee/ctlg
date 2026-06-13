import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TestMetrics {
  total: number;
  passed: number;
  failed: number;
  duration: string;
}

interface CoverageMetric {
  name: string;
  coverage: number;
  tests: number;
}

export default function AlgorithmTestingResultsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [testMetrics] = useState<TestMetrics>({
    total: 376,
    passed: 376,
    failed: 0,
    duration: '10.52s'
  });

  const coverageData: CoverageMetric[] = [
    { name: 'ACOC Coverage', coverage: 336, tests: 336 },
    { name: 'Node Coverage', coverage: 100, tests: 14 },
    { name: 'Edge Coverage', coverage: 100, tests: 9 },
    { name: 'Prime Path Coverage', coverage: 100, tests: 6 },
    { name: 'Mutation Killing', coverage: 100, tests: 11 }
  ];

  const mutationData = [
    { algorithm: 'Bubble Sort', mutants: 4, killed: 4, score: 100 },
    { algorithm: 'Merge Sort', mutants: 3, killed: 3, score: 100 },
    { algorithm: 'Binary Search', mutants: 5, killed: 5, score: 100 },
    { algorithm: 'Linear Search', mutants: 2, killed: 2, score: 100 },
    { algorithm: 'Catalog', mutants: 4, killed: 4, score: 100 }
  ];

  const testCategoriesData = [
    { name: 'ACOC', value: 336, fill: '#3b82f6' },
    { name: 'Node', value: 14, fill: '#10b981' },
    { name: 'Edge', value: 9, fill: '#f59e0b' },
    { name: 'Prime Path', value: 6, fill: '#ef4444' },
    { name: 'Mutation', value: 11, fill: '#8b5cf6' }
  ];

  const algorithmDetails = [
    {
      name: 'Bubble Sort',
      description: 'مرتب‌سازی حبابی - مقایسه و جابجایی آیتم‌های مجاور',
      features: ['صعودی/نزولی', 'فیلد انتخاب‌شده', 'خروج زودهنگام', 'کپی لیست'],
      nodeCount: 10,
      edgeCount: 8,
      primePathCount: 3
    },
    {
      name: 'Merge Sort',
      description: 'مرتب‌سازی ادغام - تقسیم و حل بازگشتی',
      features: ['صعودی/نزولی', 'ادغام لیست‌های مرتب‌شده', 'بازگشتی', 'تقسیم و پیروش'],
      nodeCount: 10,
      edgeCount: 8,
      primePathCount: 4
    },
    {
      name: 'Linear Search',
      description: 'جستجوی خطی - پیمایش و مقایسه ترتیبی',
      features: ['جستجو در title و description', 'بدون حساسیت به بزرگی/کوچکی', 'چند فیلدی', 'query خالی'],
      nodeCount: 8,
      edgeCount: 6,
      primePathCount: 2
    },
    {
      name: 'Binary Search',
      description: 'جستجوی دودویی - تقسیم به نیمه‌های مساوی',
      features: ['روی لیست مرتب‌شده', 'جستجوی دقیق', 'حرکت چپ/راست', 'خروج زودهنگام'],
      nodeCount: 10,
      edgeCount: 7,
      primePathCount: 3
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg shadow-lg p-8 text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">الگوریتم‌های کاتالوگ شناختی</h1>
          <p className="text-lg opacity-90">گزارش تست‌های جامع: پوشش، میوتاسیون و تحلیل</p>
          <p className="text-sm opacity-75 mt-2">پروژه ctlg - سامانه یادگیری تطبیقی شناختی</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['overview', 'coverage', 'mutations', 'algorithms', 'analysis'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
              }`}
            >
              {tab === 'overview' && 'نمای کلی'}
              {tab === 'coverage' && 'پوشش'}
              {tab === 'mutations' && 'میوتاسیون'}
              {tab === 'algorithms' && 'الگوریتم‌ها'}
              {tab === 'analysis' && 'تحلیل'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Test Metrics */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="text-4xl font-bold text-blue-600">{testMetrics.total}</div>
                <div className="text-sm text-neutral-600 mt-1">تعداد تست‌ها</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="text-4xl font-bold text-green-600">{testMetrics.passed}</div>
                <div className="text-sm text-neutral-600 mt-1">تست‌های موفق</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                <div className="text-4xl font-bold text-red-600">{testMetrics.failed}</div>
                <div className="text-sm text-neutral-600 mt-1">تست‌های ناموفق</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                <div className="text-2xl font-bold text-purple-600">{testMetrics.duration}</div>
                <div className="text-sm text-neutral-600 mt-1">زمان اجرا</div>
              </div>
            </div>

            {/* Test Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-neutral-800 mb-4">توزیع تست‌ها</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={testCategoriesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {testCategoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-neutral-800 mb-4">نتیجه تست‌ها</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold">موفق</span>
                      <span className="text-sm font-bold text-green-600">100%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold">ناموفق</span>
                      <span className="text-sm font-bold text-red-600">0%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-3">
                      <div className="bg-red-500 h-3 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-neutral-800 mb-4">اطلاعات پلتفرم</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-neutral-600">سیستم عامل</span>
                  <div className="font-semibold text-neutral-900">Windows</div>
                </div>
                <div>
                  <span className="text-sm text-neutral-600">نسخه Python</span>
                  <div className="font-semibold text-neutral-900">3.13.5</div>
                </div>
                <div>
                  <span className="text-sm text-neutral-600">نسخه pytest</span>
                  <div className="font-semibold text-neutral-900">9.0.3</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coverage Tab */}
        {activeTab === 'coverage' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-neutral-800 mb-6">معیارهای پوشش کد</h3>
              
              <div className="space-y-4">
                {coverageData.map((metric) => (
                  <div key={metric.name} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-neutral-800">{metric.name}</span>
                      <div className="flex gap-4">
                        <span className="text-sm text-neutral-600">{metric.tests} تست</span>
                        <span className="text-lg font-bold text-primary">{metric.coverage}</span>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full" 
                        style={{ width: `${(metric.coverage / 336) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">🎯 نتیجه گیری</h4>
                <p className="text-sm text-blue-800">
                  تمام معیارهای پوشش 100% را دستیافتند. 336 ترکیب ACOC، 14 گره، 9 یال، 6 مسیر اصلی و 11 تست میوتاسیون با موفقیت اجرا شدند.
                </p>
              </div>
            </div>

            {/* Coverage Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-semibold text-neutral-800 mb-4">Node Coverage (گره‌ها)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>تمام نقاط شروع و پایان</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>تمام شرایط تصمیم‌گیری</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>تمام حلقه‌ها و شاخه‌ها</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-semibold text-neutral-800 mb-4">Prime Path Coverage (مسیرهای اصلی)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>حلقه بیرونی و داخلی Bubble</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>تقسیم و ادغام Merge</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>حرکت چپ/راست Binary</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Mutations Tab */}
        {activeTab === 'mutations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-neutral-800 mb-6">امتیاز Mutation</h3>
              
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mutationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="algorithm" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="mutants" fill="#8884d8" name="تعداد Mutant" />
                  <Bar dataKey="killed" fill="#82ca9d" name="Killed" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-8">
                <h4 className="font-semibold text-neutral-800 mb-4">خلاصه Mutation</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="text-3xl font-bold text-green-600">100%</div>
                    <div className="text-sm text-green-800 mt-1">امتیاز Mutation کلی</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">18</div>
                    <div className="text-sm text-blue-800 mt-1">Mutant کل</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600">18</div>
                    <div className="text-sm text-purple-800 mt-1">Mutant Killed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mutation Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold text-neutral-800 mb-4">جزئیات Mutant‌ها</h4>
              <div className="space-y-3">
                {mutationData.map((item) => (
                  <div key={item.algorithm} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-neutral-800">{item.algorithm}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-600">{item.killed}/{item.mutants}</span>
                        <div className="w-32 bg-neutral-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(item.killed / item.mutants) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-green-600">{item.score}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Algorithms Tab */}
        {activeTab === 'algorithms' && (
          <div className="space-y-6">
            {algorithmDetails.map((algo) => (
              <div key={algo.name} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b border-neutral-200">
                  <h3 className="text-xl font-bold text-neutral-900">{algo.name}</h3>
                  <p className="text-neutral-600 mt-1">{algo.description}</p>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-3">ویژگی‌ها</h4>
                      <div className="flex flex-wrap gap-2">
                        {algo.features.map((feature) => (
                          <span key={feature} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-3">متریک‌های پوشش</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">گره‌ها:</span>
                          <span className="font-bold text-primary">{algo.nodeCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">یال‌ها:</span>
                          <span className="font-bold text-primary">{algo.edgeCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">مسیرهای اصلی:</span>
                          <span className="font-bold text-primary">{algo.primePathCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Answer 1 */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-bold text-neutral-900 mb-3">
                1️⃣ کدام معیار پوشش بهتر بود؟ چرا؟
              </h3>
              <p className="text-neutral-700 mb-3">
                <strong>پاسخ:</strong> Prime Path Coverage بهترین معیار بود، اما ACOC در پوشش ترکیبات واقعی بهتر عمل کرد.
              </p>
              <div className="bg-blue-50 rounded p-4 space-y-2 text-sm">
                <p><strong>• Prime Path Coverage:</strong> تمام مسیرهای منطقی اصلی را بررسی می‌کند، بنابراین خطاهای منطقی پیچیده را می‌گیرد.</p>
                <p><strong>• ACOC:</strong> تمام ترکیب‌های ورودی واقعی را تست می‌کند (336 ترکیب)، بنابراین برای سناریوهای کاربر بهتر است.</p>
                <p><strong>• نتیجه:</strong> Prime Path برای کد منطقی و ACOC برای سناریوهای واقعی بهتر است.</p>
              </div>
            </div>

            {/* Answer 2 */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-bold text-neutral-900 mb-3">
                2️⃣ کدام تست‌ها شکست خوردند؟
              </h3>
              <p className="text-neutral-700 mb-3">
                <strong>پاسخ:</strong> هیچ‌یک! تمام 376 تست موفق بودند (100%)
              </p>
              <div className="bg-green-50 rounded p-4 space-y-2 text-sm">
                <p className="text-green-800">
                  ✅ 336 تست ACOC موفق<br/>
                  ✅ 14 تست Node Coverage موفق<br/>
                  ✅ 9 تست Edge Coverage موفق<br/>
                  ✅ 6 تست Prime Path موفق<br/>
                  ✅ 11 تست Mutation Killing موفق
                </p>
              </div>
            </div>

            {/* Answer 3 */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <h3 className="text-lg font-bold text-neutral-900 mb-3">
                3️⃣ چگونه میتوان Mutation Score را بهبود داد؟
              </h3>
              <p className="text-neutral-700 mb-3">
                <strong>توصیات برای بهبود:</strong>
              </p>
              <div className="bg-purple-50 rounded p-4 space-y-3 text-sm">
                <div>
                  <strong className="text-purple-900">۱. تست‌های مرزی بیشتر:</strong>
                  <p className="text-purple-800 mt-1">تست‌های بیشتری برای مقادیر مرزی (۰، ۱، n-1) اضافه کنید</p>
                </div>
                <div>
                  <strong className="text-purple-900">۲. موارد خرابی:</strong>
                  <p className="text-purple-800 mt-1">تست‌های بیشتری برای ورودی‌های نامعتبر و استثناآ اضافه کنید</p>
                </div>
                <div>
                  <strong className="text-purple-900">۳. ترکیب‌های پیچیده‌تر:</strong>
                  <p className="text-purple-800 mt-1">ترکیب‌های ACOC بیشتری برای سناریوهای واقعی‌تر تولید کنید</p>
                </div>
                <div>
                  <strong className="text-purple-900">۴. تست‌های عملکردی:</strong>
                  <p className="text-purple-800 mt-1">تست‌های انجام‌دهی را برای اطمینان از صحت خروجی اضافه کنید</p>
                </div>
              </div>
            </div>

            {/* Implementation Summary */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow p-6 border border-green-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">📊 خلاصه پیاده‌سازی</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-neutral-900">الگوریتم‌های پیاده‌سازی‌شده:</strong>
                  <ul className="mt-2 space-y-1 text-neutral-700">
                    <li>✓ Bubble Sort</li>
                    <li>✓ Merge Sort</li>
                    <li>✓ Linear Search</li>
                    <li>✓ Binary Search</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-neutral-900">معیارهای پوشش:</strong>
                  <ul className="mt-2 space-y-1 text-neutral-700">
                    <li>✓ ACOC (336 ترکیب)</li>
                    <li>✓ Node Coverage (14 تست)</li>
                    <li>✓ Edge Coverage (9 تست)</li>
                    <li>✓ Prime Path Coverage (6 تست)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
