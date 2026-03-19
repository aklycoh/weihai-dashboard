import { toDateKey } from '../utils/date';

export default function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const tooltipLabel = (() => {
    const firstRow = payload[0]?.payload;

    if (firstRow?.weekLabel) return firstRow.weekLabel;
    if (firstRow?.date) return firstRow.date;

    if (typeof label === 'number' && Number.isFinite(label)) {
      const dateObj = new Date(label);
      if (!Number.isNaN(dateObj.getTime())) {
        return toDateKey(dateObj);
      }
    }

    return label;
  })();

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-2 font-semibold text-slate-800">{tooltipLabel}</p>
      {payload.map((entry, index) => (
        <p key={`${entry.name}-${index}`} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value} {entry.name.includes('比例') || entry.name.includes('率') ? '%' : '户'}
        </p>
      ))}
    </div>
  );
}
