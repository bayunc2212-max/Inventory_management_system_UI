import { cn } from '../../utils/cn';

export function Table({ children, className }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-left text-sm', className)}>{children}</table>
    </div>
  );
}

export function THead({ children, className }) {
  return (
    <thead className={cn('border-b border-slate-100 bg-slate-50/70 dark:border-slate-700/50 dark:bg-slate-800/40', className)}>
      {children}
    </thead>
  );
}

export function TH({ children, className }) {
  return (
    <th className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400', className)}>
      {children}
    </th>
  );
}

export function TBody({ children, className }) {
  return <tbody className={cn('divide-y divide-slate-50 dark:divide-slate-800/50', className)}>{children}</tbody>;
}

export function TR({ children, className, onClick }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TD({ children, className }) {
  return <td className={cn('px-4 py-3.5 text-sm text-slate-600 dark:text-slate-300', className)}>{children}</td>;
}
