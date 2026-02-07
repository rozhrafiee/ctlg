import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

// رنگ‌های پیش‌فرض
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

/**
 * 📊 Chart - خط نمودار
 */
export const Chart = ({ data, dataKey, xKey = 'name', height = 300, color = '#3b82f6' }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey={xKey} stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem'
          }} 
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * 📊 BarChart Component
 */
export const ChartBar = ({ data, dataKey, xKey = 'name', height = 300, color = '#3b82f6' }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey={xKey} stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem'
          }} 
        />
        <Legend />
        <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * 🥧 PieChart Component - Simple CSS fallback to avoid recharts React conflict
 */
export const ChartPie = ({ data, dataKey = 'value', nameKey = 'name', height = 300 }) => {
  const safeData = Array.isArray(data) ? data : [];
  const total = safeData.reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0);

  if (safeData.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-gray-500">
        داده‌ای موجود نیست
      </div>
    );
  }

  const stops = safeData.reduce((acc, item, i) => {
    const prevEnd = acc.length ? acc[acc.length - 1].end : 0;
    const pct = total > 0 ? ((Number(item[dataKey]) || 0) / total) * 100 : 0;
    acc.push({ color: COLORS[i % COLORS.length], start: prevEnd, end: prevEnd + pct });
    return acc;
  }, []);
  const gradientStr = stops.map(s => `${s.color} ${s.start}% ${s.end}%`).join(', ');

  return (
    <div style={{ height }} className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48 rounded-full" style={{
        background: `conic-gradient(${gradientStr})`
      }} />
      <div className="flex flex-wrap justify-center gap-4">
        {safeData.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-sm">{item[nameKey]}: {total > 0 ? ((Number(item[dataKey]) || 0) / total * 100).toFixed(0) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export const CustomLineChart = Chart;
export const CustomBarChart = ChartBar;
export const CustomPieChart = ChartPie;