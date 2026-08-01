import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useOptions } from '../../hooks/useOptions';
import { TransactionList } from '../../components/transactions/TransactionList';
import { CreateModal } from '../../components/transactions/CreateModal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/format';

const schema = z.object({
  product_id: z.coerce.number().positive('Produk wajib dipilih'),
  warehouse_id: z.coerce.number().positive('Gudang wajib dipilih'),
  quantity: z.coerce.number().positive('Jumlah wajib > 0'),
  destination: z.string().optional().or(z.literal('')),
  reason: z.string().optional().or(z.literal('')),
});

export default function StockOutPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const { options: products } = useOptions('/products/all', { key: 'products' });
  const { options: warehouseOptions } = useOptions('/warehouses/all', { key: 'warehouses' });

  const defaultValues = useMemo(
    () => ({ product_id: '', warehouse_id: '', quantity: '', destination: '', reason: '' }),
    []
  );

  const handleCreate = async (values) => {
    const res = await api.post('/stock-out', values);
    return res.data;
  };

  return (
    <div>
      <TransactionList
        title="Stock Out"
        subtitle="Catat barang keluar dari gudang"
        queryKey="stock-outs"
        endpoint="/stock-out"
        searchPlaceholder="Cari nomor OUT atau catatan..."
        statusOptions={['pending', 'completed', 'rejected']}
        createButton={
          hasPermission('stock_outs:create') && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Stock Out
            </Button>
          )
        }
        columns={[
          { key: 'out_number', header: 'Nomor', className: 'font-mono text-xs' },
          {
            key: 'product',
            header: 'Produk',
            render: (row) => (
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">{row.product?.name}</p>
                <p className="text-xs text-slate-400">{row.product?.sku}</p>
              </div>
            ),
          },
          { key: 'quantity', header: 'Jumlah' },
          {
            key: 'warehouse',
            header: 'Gudang',
            render: (row) => row.warehouse?.code || <span className="text-slate-300">-</span>,
          },
          { key: 'destination', header: 'Tujuan', render: (row) => row.destination || '-' },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        ]}
        actions={[
          {
            key: 'approve',
            label: 'Setujui',
            perm: 'stock_outs:approve',
            from: ['pending'],
            variant: 'success',
            confirm: 'Setujui pengeluaran barang ini? Stok akan berkurang.',
          },
          {
            key: 'reject',
            label: 'Tolak',
            perm: 'stock_outs:approve',
            from: ['pending'],
            variant: 'danger',
            confirm: 'Tolak pengeluaran barang ini?',
            requireNote: true,
          },
        ]}
        detail={{
          title: 'Detail Stock Out',
          itemsLabel: 'Informasi',
          headerFields: [
            { label: 'Nomor', render: (d) => d.out_number },
            { label: 'Produk', render: (d) => d.product?.name },
            { label: 'Jumlah', render: (d) => `${d.quantity} ${d.product?.unit}` },
            { label: 'Gudang', render: (d) => d.warehouse?.name },
            { label: 'Tujuan', render: (d) => d.destination || '-' },
            { label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
            { label: 'Tanggal', render: (d) => formatDate(d.created_at) },
            { label: 'Catatan', render: (d) => d.reason || '-' },
          ],
          itemColumns: [],
        }}
      />

      <CreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Stock Out"
        subtitle="Keluarkan barang dari gudang"
        schema={schema}
        defaultValues={defaultValues}
        submitText="Simpan"
        onSuccess={(data) => {
          toast.success(data.message);
          queryClient.invalidateQueries({ queryKey: ['stock-outs'] });
        }}
        onSubmit={handleCreate}
      >
        {({ register, errors }) => (
          <>
            <Select label="Produk" error={errors.product_id?.message} {...register('product_id')}>
              <option value="">Pilih produk...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — stok {p.current_stock} {p.unit}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Gudang" error={errors.warehouse_id?.message} {...register('warehouse_id')}>
                <option value="">Pilih gudang...</option>
                {warehouseOptions.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </Select>
              <Input label="Jumlah" type="number" min={1} error={errors.quantity?.message} {...register('quantity')} />
            </div>
            <Input label="Tujuan" placeholder="cth: Cabang, proyek, pelanggan" {...register('destination')} />
            <Textarea label="Alasan / Catatan" rows={2} {...register('reason')} />
          </>
        )}
      </CreateModal>
    </div>
  );
}
