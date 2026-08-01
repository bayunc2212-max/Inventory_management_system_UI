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
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/format';

const schema = z.object({
  product_id: z.coerce.number().positive('Produk wajib dipilih'),
  warehouse_id: z.coerce.number().positive('Gudang wajib dipilih'),
  type: z.string().min(1, 'Tipe penyesuaian wajib dipilih'),
  quantity: z.coerce.number().positive('Jumlah wajib > 0'),
  reason: z.string().min(1, 'Alasan wajib diisi'),
});

export default function AdjustmentsPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const { options: products } = useOptions('/products/all', { key: 'products' });
  const { options: warehouseOptions } = useOptions('/warehouses/all', { key: 'warehouses' });

  const defaultValues = useMemo(
    () => ({ product_id: '', warehouse_id: '', type: 'increase', quantity: '', reason: '' }),
    []
  );

  const handleCreate = async (values) => {
    const res = await api.post('/adjustments', values);
    return res.data;
  };

  return (
    <div>
      <TransactionList
        title="Penyesuaian Stok"
        subtitle="Koreksi stok karena kerusakan, hilang, atau selisih"
        queryKey="adjustments"
        endpoint="/adjustments"
        searchPlaceholder="Cari nomor penyesuaian..."
        statusOptions={['pending', 'approved', 'rejected']}
        createButton={
          hasPermission('adjustments:create') && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Penyesuaian
            </Button>
          )
        }
        columns={[
          { key: 'adjustment_number', header: 'Nomor', className: 'font-mono text-xs' },
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
          {
            key: 'type',
            header: 'Tipe',
            render: (row) => <Badge tone={row.type === 'increase' ? 'green' : 'rose'}>{row.type === 'increase' ? 'Tambah' : 'Kurang'}</Badge>,
          },
          { key: 'quantity', header: 'Jumlah' },
          {
            key: 'warehouse',
            header: 'Gudang',
            render: (row) => row.warehouse?.code || <span className="text-slate-300">-</span>,
          },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        ]}
        actions={[
          {
            key: 'approve',
            label: 'Setujui',
            perm: 'adjustments:approve',
            from: ['pending'],
            variant: 'success',
            confirm: 'Setujui penyesuaian stok ini?',
          },
          {
            key: 'reject',
            label: 'Tolak',
            perm: 'adjustments:approve',
            from: ['pending'],
            variant: 'danger',
            confirm: 'Tolak penyesuaian stok ini?',
            requireNote: true,
          },
        ]}
        detail={{
          title: 'Detail Penyesuaian Stok',
          itemsLabel: 'Informasi',
          headerFields: [
            { label: 'Nomor', render: (d) => d.adjustment_number },
            { label: 'Produk', render: (d) => d.product?.name },
            { label: 'Tipe', render: (d) => <Badge tone={d.type === 'increase' ? 'green' : 'rose'}>{d.type}</Badge> },
            { label: 'Jumlah', render: (d) => d.quantity },
            { label: 'Gudang', render: (d) => d.warehouse?.name },
            { label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
            { label: 'Dibuat', render: (d) => d.creator?.name },
            { label: 'Tanggal', render: (d) => formatDate(d.created_at) },
            { label: 'Alasan', render: (d) => d.reason || '-' },
          ],
          itemColumns: [],
        }}
      />

      <CreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Penyesuaian Stok"
        subtitle="Tambah atau kurangi stok dengan alasan"
        schema={schema}
        defaultValues={defaultValues}
        submitText="Simpan"
        onSuccess={(data) => {
          toast.success(data.message);
          queryClient.invalidateQueries({ queryKey: ['adjustments'] });
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Select label="Tipe" {...register('type')}>
                <option value="increase">Tambah</option>
                <option value="decrease">Kurang</option>
              </Select>
              <Input label="Jumlah" type="number" min={1} error={errors.quantity?.message} {...register('quantity')} />
              <Select label="Gudang" error={errors.warehouse_id?.message} {...register('warehouse_id')}>
                <option value="">Pilih gudang...</option>
                {warehouseOptions.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code}
                  </option>
                ))}
              </Select>
            </div>
            <Textarea label="Alasan (wajib)" rows={2} error={errors.reason?.message} {...register('reason')} />
          </>
        )}
      </CreateModal>
    </div>
  );
}
