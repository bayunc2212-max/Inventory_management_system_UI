import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export function EmptyState({
  icon: Icon,
  title = 'Belum ada data',
  description = 'Mulai dengan membuat data baru.',
  action,
  actionText,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}
    >
      <div className="rounded-2xl bg-slate-100 p-4 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500">
        {Icon ? <Icon className="h-10 w-10" /> : <span className="text-4xl">📦</span>}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>
      {action && (
        <Button className="mt-5" onClick={action}>
          {actionText || 'Tambah Data'}
        </Button>
      )}
    </motion.div>
  );
}
