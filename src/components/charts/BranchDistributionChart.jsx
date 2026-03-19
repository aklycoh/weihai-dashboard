import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Percent } from 'lucide-react';
import { COLORS } from '../../config/dashboard';
import CustomTooltip from '../CustomTooltip';

const MOBILE_BREAKPOINT_QUERY = '(max-width: 639px)';

export default function BranchDistributionChart({ branchStats, shouldAnimateCharts }) {
  const pieData = branchStats.filter((item) => item.actual > 0);
  const totalActual = pieData.reduce((sum, item) => sum + item.actual, 0);
  const [isCompact, setIsCompact] = useState(() => (
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches : false
  ));

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const handleChange = (event) => {
      setIsCompact(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_10px_26px_rgba(15,23,42,0.07)] transition-shadow duration-300 hover:shadow-[0_16px_34px_rgba(15,23,42,0.11)]">
      <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-800">
        <Percent className="text-blue-500" size={20} />
        已上报机构分布占比
      </h3>
      {isCompact ? (
        <p className="mt-3 text-sm text-slate-500">小屏模式下请轻触扇区查看具体机构和占比。</p>
      ) : null}

      <div className={`mt-4 w-full text-xs font-medium ${isCompact ? 'h-64' : 'h-80'}`}>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={isCompact ? { top: 8, right: 12, bottom: 8, left: 12 } : { top: 20, right: 40, bottom: 20, left: 40 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={isCompact ? 58 : 50}
                outerRadius={isCompact ? 94 : 78}
                paddingAngle={3}
                dataKey="actual"
                nameKey="branch"
                label={isCompact ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={!isCompact}
                isAnimationActive={shouldAnimateCharts}
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.branch} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            暂无已上报数据
          </div>
        )}
      </div>

      {isCompact && pieData.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-2">
          {pieData.map((entry, index) => {
            const percent = totalActual > 0 ? (entry.actual / totalActual) * 100 : 0;

            return (
              <div
                key={entry.branch}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{entry.branch}</span>
                </div>
                <span className="text-slate-500">{entry.actual}户 · {percent.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
