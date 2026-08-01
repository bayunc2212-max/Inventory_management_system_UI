import { cn } from '../../utils/cn';

export function Spinner({ className }) {
  return (
    <div
      className={cn(
        'h-8 w-8 animate-spin rounded-full border-[3px] border-brand-600 border-t-transparent',
        className
      )}
    />
  );
}

export function PageLoader({ text = 'Memuat...' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Spinner className="h-9 w-9" />
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}
