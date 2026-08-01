import { cn } from '../../utils/cn';

const toneMap = {
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300',
  blue: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-300',
};

export function Badge({ tone = 'slate', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        toneMap[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONES = {
  active: 'green',
  inactive: 'gray',
  draft: 'slate',
  pending: 'amber',
  approved: 'green',
  rejected: 'rose',
  completed: 'blue',
  cancelled: 'gray',
  shipped: 'violet',
  received: 'green',
  ongoing: 'blue',
  submitted: 'amber',
  increase: 'green',
  decrease: 'rose',
  low: 'amber',
  out: 'rose',
  ok: 'green',
};

export function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase();
  const tone = STATUS_TONES[key] || 'slate';
  const label = String(status || '-')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return <Badge tone={tone}>{label}</Badge>;
}
