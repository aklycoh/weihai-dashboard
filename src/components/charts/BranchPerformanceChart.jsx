import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import CustomTooltip from '../CustomTooltip';

export default function BranchPerformanceChart({ branchStats, shouldAnimateCharts }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_10px_26px_rgba(15,23,42,0.07)] transition-shadow duration-300 hover:shadow-[0_16px_34px_rgba(15,23,42,0.11)] lg:col-span-2">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <BarChart2 className="text-blue-500" size={20} />
          各机构完成情况对比
        </h3>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={branchStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="branch" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              yAxisId="left"
              dataKey="planned"
              name="应上报任务"
              fill="#94a3b8"
              radius={[4, 4, 0, 0]}
              barSize={32}
              isAnimationActive={shouldAnimateCharts}
            />
            <Bar
              yAxisId="left"
              dataKey="actual"
              name="实际上报数"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={32}
              isAnimationActive={shouldAnimateCharts}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="rate"
              name="完成比例"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={shouldAnimateCharts}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
