import { cn } from '../../utils/cn';

export function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50',
        checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'
      )}
    >
      <span
        className={cn(
          'inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-[1.4rem]' : 'translate-x-1'
        )}
      />
    </button>
  );
}
