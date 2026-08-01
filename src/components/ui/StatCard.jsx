import { cn } from '../../utils/cn';
import { Card } from './Card';
import { Skeleton } from './Skeleton';

const iconTone = {
  blue: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300',
};

export function StatCard({ title, value, icon: Icon, tone = 'blue', hint, loading = false, onClick }) {
  return (
    <Card hover={!!onClick} className={cn(onClick && 'cursor-pointer')} onClick={onClick}>
      <div className="flex items-start justify-between p-5">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-24" />
          ) : (
            <p className="mt-1.5 truncate text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
          )}
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div className={cn('rounded-xl p-3', iconTone[tone])}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
      </div>
    </Card>
  );
}
