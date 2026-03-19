import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Calendar } from 'lucide-react';
import CustomTooltip from '../CustomTooltip';
import { getMonthEndDate, isSameDate } from '../../utils/date';

export default function ProgressTimelineChart({
  progressAsOf,
  progressTicks,
  progressTimeline,
  shouldAnimateCharts,
}) {
  return (
    <div className="flex h-[350px] flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_10px_26px_rgba(15,23,42,0.07)] transition-shadow duration-300 hover:shadow-[0_16px_34px_rgba(15,23,42,0.11)]">
      <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Calendar className="text-blue-500" size={20} />
            时序计划完成情况
          </h3>
          <p className="mt-1 text-sm text-slate-500">统计截至：{progressAsOf}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          累计完成率
        </span>
      </div>
      <div className="flex-1 rounded-lg border border-slate-200 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={progressTimeline} margin={{ top: 16, right: 20, left: 12, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={progressTicks}
              tickFormatter={(value) => {
                const dateObj = new Date(value);
                const monthEndDate = getMonthEndDate(dateObj.getFullYear(), dateObj.getMonth());
                return isSameDate(dateObj, monthEndDate)
                  ? `${dateObj.getMonth() + 1}月`
                  : `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
              }}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b' }}
              dy={10}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={64}
              tick={{ fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '16px' }} />
            <Line
              type="monotone"
              dataKey="planRate"
              name="计划完成率"
              stroke="#f59e0b"
              strokeWidth={3}
              strokeDasharray="6 4"
              dot={{ r: 3, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }}
              activeDot={{ r: 5 }}
              isAnimationActive={shouldAnimateCharts}
            />
            <Line
              type="monotone"
              dataKey="actualRate"
              name="实际完成率"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4, fill: '#fff', stroke: '#2563eb', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              isAnimationActive={shouldAnimateCharts}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
