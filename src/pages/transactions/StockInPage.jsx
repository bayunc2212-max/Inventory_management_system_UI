import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import api, { extractErrorMessage } from '../../api/client';
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
  supplier_id: z.coerce.number().positive().optional().or(z.literal('')),
  quantity: z.coerce.number().positive('Jumlah wajib > 0'),
  reason: z.string().optional().or(z.literal('')),
});

export default function StockInPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const { options: products } = useOptions('/products/all', { key: 'products' });
  const { options: warehouseOptions } = useOptions('/warehouses/all', { key: 'warehouses' });
  const { options: supplierOptions } = useOptions('/suppliers/all', { key: 'suppliers' });

  const defaultValues = useMemo(
    () => ({ product_id: '', warehouse_id: '', supplier_id: '', quantity: '', reason: '' }),
    []
  );

  const handleCreate = async (values) => {
    const res = await api.post('/stock-in', {
      ...values,
      supplier_id: values.supplier_id || null,
    });
    return res.data;
  };

  return (
    <div>
      <TransactionList
        title="Stock In"
        subtitle="Catat barang masuk ke gudang"
        queryKey="stock-ins"
        endpoint="/stock-in"
        searchPlaceholder="Cari nomor IN atau catatan..."
        createButton={
          hasPermission('stock_ins:manage') && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Stock In
            </Button>
          )
        }
        columns={[
          { key: 'ins_number', header: 'Nomor', className: 'font-mono text-xs' },
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
          { key: 'created_at', header: 'Tanggal', render: (row) => formatDate(row.created_at) },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        ]}
        actions={[
          {
            key: 'cancel',
            label: 'Batalkan',
            perm: 'stock_ins:manage',
            variant: 'danger',
            confirm: 'Batalkan transaksi stock in ini? Stok akan dikembalikan.',
          },
        ]}
        detail={{
          title: 'Detail Stock In',
          itemsLabel: 'Informasi',
          headerFields: [
            { label: 'Nomor', render: (d) => d.ins_number },
            { label: 'Produk', render: (d) => d.product?.name },
            { label: 'Jumlah', render: (d) => `${d.quantity} ${d.product?.unit}` },
            { label: 'Gudang', render: (d) => d.warehouse?.name },
            { label: 'Supplier', render: (d) => d.supplier?.company_name || '-' },
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
        title="Stock In"
        subtitle="Tambah stok barang masuk"
        schema={schema}
        defaultValues={defaultValues}
        submitText="Simpan"
        onSuccess={(data) => {
          toast.success(data.message);
          queryClient.invalidateQueries({ queryKey: ['stock-ins'] });
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }}
        onSubmit={handleCreate}
      >
        {({ register, errors }) => (
          <>
            <Select label="Produk" error={errors.product_id?.message} {...register('product_id')}>
              <option value="">Pilih produk...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
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
              <div className="sm:col-span-2">
                <Select label="Supplier (opsional)" {...register('supplier_id')}>
                  <option value="">Tanpa supplier</option>
                  {supplierOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.company_name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <Textarea label="Alasan / Catatan" rows={2} {...register('reason')} />
          </>
        )}
      </CreateModal>
    </div>
  );
}
