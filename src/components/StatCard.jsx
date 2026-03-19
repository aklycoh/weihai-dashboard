export default function StatCard({
  icon: Icon,
  iconContainerClassName,
  iconClassName,
  label,
  value,
  valueClassName = 'text-slate-900',
}) {
  const IconComponent = Icon;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-shadow duration-300 hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)]">
      <div className={`flex h-14 w-14 items-center justify-center rounded-full ${iconContainerClassName}`}>
        <IconComponent className={iconClassName} size={28} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className={`text-3xl font-bold ${valueClassName}`}>{value}</h3>
      </div>
    </div>
  );
}
