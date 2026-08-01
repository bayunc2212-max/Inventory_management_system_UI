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
import { LineEditor } from '../../components/transactions/LineEditor';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/format';

const schema = z.object({
  warehouse_id: z.coerce.number().positive('Gudang wajib dipilih'),
  opname_date: z.string().min(1, 'Tanggal opname wajib diisi'),
  notes: z.string().optional().or(z.literal('')),
});

export default function OpnamesPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [lines, setLines] = useState([]);
  const { options: warehouseOptions } = useOptions('/warehouses/all', { key: 'warehouses' });
  const { options: products } = useOptions('/products/all', { key: 'products' });

  const defaultValues = useMemo(() => ({ warehouse_id: '', opname_date: '', notes: '' }), []);

  const openCreate = () => {
    setLines([]);
    setCreateOpen(true);
  };

  const handleCreate = async (values) => {
    if (!lines.length) {
      toast.error('Minimal satu item wajib diisi');
      throw new Error('no items');
    }
    const items = lines.map((l) => ({ product_id: l.product_id, physical_qty: l.quantity, note: l.note }));
    const res = await api.post('/opnames', { ...values, items });
    return res.data;
  };

  return (
    <div>
      <TransactionList
        title="Opname Stok"
        subtitle="Perhitungan fisik stok berkala"
        queryKey="opnames"
        endpoint="/opnames"
        searchPlaceholder="Cari nomor opname..."
        statusOptions={['draft', 'submitted', 'approved', 'rejected']}
        createButton={
          hasPermission('opnames:create') && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Opname
            </Button>
          )
        }
        columns={[
          { key: 'opname_number', header: 'Nomor', className: 'font-mono text-xs' },
          {
            key: 'warehouse',
            header: 'Gudang',
            render: (row) => row.warehouse?.name || <span className="text-slate-300">-</span>,
          },
          { key: 'opname_date', header: 'Tanggal', render: (row) => formatDate(row.opname_date) },
          {
            key: 'selisih',
            header: 'Selisih',
            render: (row) => {
              const diff = (row.items || []).reduce((s, it) => s + Number(it.difference_qty || 0), 0);
              return diff === 0 ? (
                <Badge tone="green">0</Badge>
              ) : diff < 0 ? (
                <Badge tone="rose">{diff}</Badge>
              ) : (
                <Badge tone="amber">+{diff}</Badge>
              );
            },
          },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        ]}
        actions={[
          {
            key: 'submit',
            label: 'Kirim',
            perm: 'opnames:create',
            from: ['draft'],
            variant: 'secondary',
            confirm: 'Kirim hasil opname untuk persetujuan?',
          },
          {
            key: 'approve',
            label: 'Setujui',
            perm: 'opnames:approve',
            from: ['submitted'],
            variant: 'success',
            confirm: 'Setujui opname? Selisih akan diposting ke stok.',
          },
          {
            key: 'reject',
            label: 'Tolak',
            perm: 'opnames:approve',
            from: ['submitted'],
            variant: 'danger',
            confirm: 'Tolak opname ini?',
            requireNote: true,
          },
        ]}
        detail={{
          title: 'Detail Opname Stok',
          itemsLabel: 'Item Opname',
          headerFields: [
            { label: 'Nomor', render: (d) => d.opname_number },
            { label: 'Gudang', render: (d) => d.warehouse?.name },
            { label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
            { label: 'Tanggal', render: (d) => formatDate(d.opname_date) },
            { label: 'Dibuat', render: (d) => d.creator?.name },
            { label: 'Catatan', render: (d) => d.notes || '-' },
          ],
          itemColumns: [
            { key: 'product', header: 'Produk', render: (it) => it.product?.name },
            { key: 'system_qty', header: 'Sistem' },
            { key: 'physical_qty', header: 'Fisik' },
            {
              key: 'difference_qty',
              header: 'Selisih',
              render: (it) => {
                const d = Number(it.difference_qty || 0);
                return d === 0 ? (
                  <span className="text-slate-400">{d}</span>
                ) : d < 0 ? (
                  <span className="font-medium text-rose-500">{d}</span>
                ) : (
                  <span className="font-medium text-emerald-500">+{d}</span>
                );
              },
            },
            { key: 'note', header: 'Catatan', render: (it) => it.note || '-' },
          ],
        }}
      />

      <CreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Opname Stok"
        subtitle="Masukkan hasil hitung fisik per produk"
        schema={schema}
        defaultValues={defaultValues}
        submitText="Buat Opname"
        onSuccess={(data) => {
          toast.success(data.message);
          queryClient.invalidateQueries({ queryKey: ['opnames'] });
        }}
        onSubmit={handleCreate}
      >
        {({ register, errors }) => (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Gudang" error={errors.warehouse_id?.message} {...register('warehouse_id')}>
                <option value="">Pilih gudang...</option>
                {warehouseOptions.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </Select>
              <Input label="Tanggal Opname" type="date" error={errors.opname_date?.message} {...register('opname_date')} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Item &amp; Hitungan Fisik</p>
              <LineEditor
                products={products}
                lines={lines}
                onChange={setLines}
                unitLabel="Stok Fisik"
                withNote
              />
            </div>
            <Textarea label="Catatan" rows={2} {...register('notes')} />
          </>
        )}
      </CreateModal>
    </div>
  );
}
