import { cn } from '../../utils/cn';

const initials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const tone = ['bg-brand-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500', 'bg-sky-500'];

export function Avatar({ name, src, size = 'md', className }) {
  const idx = (name || '').length % tone.length;
  const sizeClass = { sm: 'h-8 w-8 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' }[size];
  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold text-white', tone[idx], sizeClass, className)}>
      {src ? <img src={src} alt={name} className="h-full w-full rounded-full object-cover" /> : initials(name)}
    </div>
  );
}
