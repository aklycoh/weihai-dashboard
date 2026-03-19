import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

const TONE_MAP = {
  success: {
    icon: CheckCircle2,
    wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    iconColor: 'text-emerald-600',
    bodyColor: 'text-emerald-800/90',
  },
  warning: {
    icon: AlertTriangle,
    wrapper: 'border-amber-200 bg-amber-50 text-amber-950',
    iconColor: 'text-amber-600',
    bodyColor: 'text-amber-900/90',
  },
  error: {
    icon: XCircle,
    wrapper: 'border-rose-200 bg-rose-50 text-rose-950',
    iconColor: 'text-rose-600',
    bodyColor: 'text-rose-900/90',
  },
  info: {
    icon: Info,
    wrapper: 'border-blue-200 bg-blue-50 text-blue-950',
    iconColor: 'text-blue-600',
    bodyColor: 'text-blue-900/90',
  },
};

export default function StatusNotice({ tone = 'info', title, message, className = '' }) {
  const style = TONE_MAP[tone] ?? TONE_MAP.info;
  const Icon = style.icon;

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${style.wrapper} ${className}`.trim()}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconColor}`} />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className={`mt-1 text-sm leading-6 ${style.bodyColor}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}
