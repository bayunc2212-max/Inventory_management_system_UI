import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Pagination({ page, totalPages, total, onChange, pageSize }) {
  if (!total) return null;

  const pages = [];
  const current = page;
  const max = totalPages;
  const start = Math.max(1, current - 2);
  const end = Math.min(max, current + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row">
      <p className="text-xs text-slate-400">
        Menampilkan {total === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} dari {total} data
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {start > 1 && (
          <>
            <PageBtn n={1} current={current} onChange={onChange} />
            {start > 2 && <span className="px-1 text-xs text-slate-400">…</span>}
          </>
        )}
        {pages.map((n) => (
          <PageBtn key={n} n={n} current={current} onChange={onChange} />
        ))}
        {end < max && (
          <>
            {end < max - 1 && <span className="px-1 text-xs text-slate-400">…</span>}
            <PageBtn n={max} current={current} onChange={onChange} />
          </>
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 dark:hover:bg-slate-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PageBtn({ n, current, onChange }) {
  const active = n === current;
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => onChange(n)}
      className={cn(
        'h-8 w-8 rounded-lg text-xs font-medium transition',
        active
          ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
          : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
      )}
    >
      {n}
    </motion.button>
  );
}
