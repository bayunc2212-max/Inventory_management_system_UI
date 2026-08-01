import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

const baseField =
  'input-base disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800';

const Input = forwardRef(function Input(
  { label, error, hint, className, wrapperClassName, icon: Icon, ...props },
  ref
) {
  const id = useId();
  return (
    <div className={cn('space-y-1.5', wrapperClassName)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
        )}
        <input
          ref={ref}
          id={id}
          className={cn(baseField, Icon && 'pl-10', error && 'border-rose-400 focus:ring-rose-500/15', className)}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-rose-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
});

const Textarea = forwardRef(function Textarea(
  { label, error, hint, className, rows = 3, ...props },
  ref
) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={cn(baseField, 'resize-none', error && 'border-rose-400', className)}
        {...props}
      />
      {error ? <p className="text-xs font-medium text-rose-500">{error}</p> : hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
});

const Select = forwardRef(function Select({ label, error, hint, className, children, ...props }, ref) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <select
        ref={ref}
        id={id}
        className={cn(baseField, 'cursor-pointer appearance-none', error && 'border-rose-400', className)}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-xs font-medium text-rose-500">{error}</p> : hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
});

export { Input, Textarea, Select };
