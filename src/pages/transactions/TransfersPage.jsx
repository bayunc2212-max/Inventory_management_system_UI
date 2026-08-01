import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, ArrowLeftRight } from 'lucide-react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useOptions } from '../../hooks/useOptions';
import { TransactionList } from '../../components/transactions/TransactionList';
import { CreateModal } from '../../components/transactions/CreateModal';
import { LineEditor } from '../../components/transactions/LineEditor';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/format';

const schema = z.object({
  from_warehouse_id: z.coerce.number().positive('Gudang asal wajib dipilih'),
  to_warehouse_id: z.coerce.number().positive('Gudang tujuan wajib dipilih'),
  notes: z.string().optional().or(z.literal('')),
});

export default function TransfersPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [lines, setLines] = useState([]);
  const { options: warehouseOptions } = useOptions('/warehouses/all', { key: 'warehouses' });
  const { options: products } = useOptions('/products/all', { key: 'products' });

  const defaultValues = useMemo(() => ({ from_warehouse_id: '', to_warehouse_id: '', notes: '' }), []);

  const openCreate = () => {
    setLines([]);
    setCreateOpen(true);
  };

  const handleCreate = async (values) => {
    if (!lines.length) {
      toast.error('Minimal satu item produk wajib diisi');
      throw new Error('no items');
    }
    if (values.from_warehouse_id === values.to_warehouse_id) {
      toast.error('Gudang asal dan tujuan tidak boleh sama');
      throw new Error('same warehouse');
    }
    const items = lines.map((l) => ({ product_id: l.product_id, quantity: l.quantity, note: l.note }));
    const res = await api.post('/transfers', { ...values, items });
    return res.data;
  };

  return (
    <div>
      <TransactionList
        title="Transfer Stok"
        subtitle="Pindahkan stok antar gudang"
        queryKey="transfers"
        endpoint="/transfers"
        searchPlaceholder="Cari nomor transfer atau catatan..."
        statusOptions={['draft', 'pending', 'shipped', 'received', 'cancelled']}
        createButton={
          hasPermission('transfers:create') && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Transfer
            </Button>
          )
        }
        columns={[
          { key: 'transfer_number', header: 'Nomor', className: 'font-mono text-xs' },
          {
            key: 'route',
            header: 'Rute',
            render: (row) => (
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{row.from_warehouse?.code}</span>
                <ArrowLeftRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium text-slate-700 dark:text-slate-200">{row.to_warehouse?.code}</span>
              </div>
            ),
          },
          {
            key: 'itemCount',
            header: 'Item',
            render: (row) => row.items?.length || 0,
          },
          { key: 'created_at', header: 'Tanggal', render: (row) => formatDate(row.created_at) },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        ]}
        actions={[
          {
            key: 'ship',
            label: 'Kirim',
            perm: 'transfers:approve',
            from: ['pending'],
            variant: 'secondary',
            confirm: 'Konfirmasi pengiriman? Stok gudang asal akan berkurang.',
          },
          {
            key: 'receive',
            label: 'Terima',
            perm: 'transfers:approve',
            from: ['shipped'],
            variant: 'success',
            confirm: 'Konfirmasi penerimaan? Stok gudang tujuan akan bertambah.',
          },
          {
            key: 'cancel',
            label: 'Batal',
            perm: 'transfers:create',
            from: ['draft', 'pending'],
            variant: 'danger',
            confirm: 'Batalkan transfer ini?',
          },
        ]}
        detail={{
          title: 'Detail Transfer Stok',
          itemsLabel: 'Item Transfer',
          headerFields: [
            { label: 'Nomor', render: (d) => d.transfer_number },
            { label: 'Dari', render: (d) => d.from_warehouse?.name },
            { label: 'Ke', render: (d) => d.to_warehouse?.name },
            { label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
            { label: 'Tanggal Dibuat', render: (d) => formatDate(d.created_at) },
            { label: 'Catatan', render: (d) => d.notes || '-' },
          ],
          itemColumns: [
            { key: 'product', header: 'Produk', render: (it) => it.product?.name },
            { key: 'quantity', header: 'Jumlah' },
            { key: 'note', header: 'Catatan', render: (it) => it.note || '-' },
          ],
        }}
      />

      <CreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Transfer Stok"
        subtitle="Pilih gudang asal, tujuan, dan item"
        schema={schema}
        defaultValues={defaultValues}
        submitText="Buat Transfer"
        onSuccess={(data) => {
          toast.success(data.message);
          queryClient.invalidateQueries({ queryKey: ['transfers'] });
        }}
        onSubmit={handleCreate}
      >
        {({ register, errors }) => (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Gudang Asal" error={errors.from_warehouse_id?.message} {...register('from_warehouse_id')}>
                <option value="">Pilih gudang...</option>
                {warehouseOptions.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </Select>
              <Select label="Gudang Tujuan" error={errors.to_warehouse_id?.message} {...register('to_warehouse_id')}>
                <option value="">Pilih gudang...</option>
                {warehouseOptions.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Item Produk</p>
              <LineEditor products={products} lines={lines} onChange={setLines} withNote />
            </div>
            <Textarea label="Catatan" rows={2} {...register('notes')} />
          </>
        )}
      </CreateModal>
    </div>
  );
}
