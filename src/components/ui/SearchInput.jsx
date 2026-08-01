import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SearchInput({ value, onChange, placeholder = 'Cari...', className, debounce = 350 }) {
  const setDebounced = useDebouncedCallback(onChange, debounce);
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => setDebounced(e.target.value)}
        placeholder={placeholder}
        className="input-base pl-10"
      />
    </div>
  );
}

function useDebouncedCallback(callback, delay) {
  return useMemo(() => {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => callback(...args), delay);
    };
  }, [callback, delay]);
}
