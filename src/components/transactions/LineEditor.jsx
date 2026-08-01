import { Plus, Trash2 } from 'lucide-react';
import { Select, Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function LineEditor({
  products,
  lines,
  onChange,
  withPrice = false,
  withNote = false,
  priceLabel = 'Harga Satuan',
  unitLabel = 'Jumlah',
}) {
  const update = (idx, patch) => {
    const next = lines.map((l, i) => (i === idx ? { ...l, ...patch } : l));
    onChange(next);
  };

  const remove = (idx) => onChange(lines.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_100px_100px_32px] gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>Produk</span>
        <span>{unitLabel}</span>
        {withPrice && <span>{priceLabel}</span>}
        {!withPrice && <span />}
        <span />
      </div>
      <div className="grid grid-cols-[1fr_100px_100px_32px] gap-2">
        {lines.map((line, idx) => (
          <div key={line._id} className="contents">
            <Select
              value={line.product_id || ''}
              onChange={(e) => update(idx, { product_id: Number(e.target.value) })}
              placeholder="Pilih produk..."
            >
              <option value="">Pilih produk...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — stok {p.current_stock} {p.unit}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              min={1}
              value={line.quantity}
              onChange={(e) => update(idx, { quantity: Number(e.target.value) })}
              placeholder={unitLabel}
            />
            {withPrice ? (
              <Input
                type="number"
                min={0}
                value={line.unit_price}
                onChange={(e) => update(idx, { unit_price: Number(e.target.value) })}
                placeholder={priceLabel}
              />
            ) : (
              <div />
            )}
            <button
              type="button"
              onClick={() => remove(idx)}
              title="Hapus baris"
              className="self-center justify-self-end rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {withNote && (
        <div className="space-y-2">
          {lines.map((line, idx) => (
            <Input
              key={line._id}
              value={line.note || ''}
              onChange={(e) => update(idx, { note: e.target.value })}
              placeholder={`Catatan baris ${idx + 1} (opsional)`}
            />
          ))}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([...lines, { _id: Math.random().toString(36).slice(2, 8), product_id: '', quantity: '', unit_price: '', note: '' }])
        }
      >
        <Plus className="h-4 w-4" /> Tambah Baris
      </Button>
    </div>
  );
}
