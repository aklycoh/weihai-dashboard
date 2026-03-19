import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import CustomTooltip from '../CustomTooltip';

export default function WeeklyTrendChart({
  monthTicks,
  shouldAnimateCharts,
  title,
  weeklyTrend,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_10px_26px_rgba(15,23,42,0.07)] transition-shadow duration-300 hover:shadow-[0_16px_34px_rgba(15,23,42,0.11)]">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
        <TrendingUp className="text-blue-500" size={20} />
        {title}
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={monthTicks}
              tickFormatter={(value) => `${new Date(value).getMonth() + 1}月`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b' }}
              dy={10}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              name="上报户数"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCount)"
              dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              isAnimationActive={shouldAnimateCharts}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
