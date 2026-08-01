import { cn } from '../../utils/cn';

export function Label({ children, className, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('block text-sm font-medium text-slate-600 dark:text-slate-300', className)}
    >
      {children}
    </label>
  );
}
