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
import { LineEditor } from '../../components/transactions/LineEditor';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../utils/format';

const schema = z.object({
  supplier_id: z.coerce.number().positive('Supplier wajib dipilih'),
  warehouse_id: z.coerce.number().positive('Gudang wajib dipilih'),
  order_date: z.string().min(1, 'Tanggal pesan wajib diisi'),
  expected_date: z.string().optional().or(z.literal('')),
  tax_rate: z.coerce.number().min(0).optional().or(z.literal('')),
  discount: z.coerce.number().min(0).optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export default function PurchaseOrdersPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [lines, setLines] = useState([]);
  const { options: supplierOptions } = useOptions('/suppliers/all', { key: 'suppliers' });
  const { options: warehouseOptions } = useOptions('/warehouses/all', { key: 'warehouses' });
  const { options: products } = useOptions('/products/all', { key: 'products' });

  const defaultValues = useMemo(
    () => ({ supplier_id: '', warehouse_id: '', order_date: '', expected_date: '', tax_rate: 11, discount: 0, notes: '' }),
    []
  );

  const openCreate = () => {
    setLines([]);
    setCreateOpen(true);
  };

  const handleCreate = async (values) => {
    if (!lines.length) {
      toast.error('Minimal satu item produk wajib diisi');
      throw new Error('no items');
    }
    const items = lines.map((l) => ({
      product_id: l.product_id,
      quantity: l.quantity,
      unit_price: l.unit_price,
    }));
    const res = await api.post('/purchase-orders', { ...values, tax_rate: values.tax_rate || 0, discount: values.discount || 0, items });
    return res.data;
  };

  return (
    <div>
      <TransactionList
        title="Purchase Order"
        subtitle="Kelola pembelian barang dari supplier"
        queryKey="purchase-orders"
        endpoint="/purchase-orders"
        searchPlaceholder="Cari nomor PO atau catatan..."
        statusOptions={['draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed']}
        createButton={
          hasPermission('purchase_orders:manage') && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Buat PO
            </Button>
          )
        }
        columns={[
          { key: 'po_number', header: 'Nomor', className: 'font-mono text-xs' },
          {
            key: 'supplier',
            header: 'Supplier',
            render: (row) => row.supplier?.company_name || <span className="text-slate-300">-</span>,
          },
          {
            key: 'warehouse',
            header: 'Gudang',
            render: (row) => row.warehouse?.code || <span className="text-slate-300">-</span>,
          },
          { key: 'order_date', header: 'Tanggal', render: (row) => formatDate(row.order_date) },
          { key: 'total', header: 'Total', render: (row) => <span className="font-medium">{formatCurrency(row.total)}</span> },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        ]}
        actions={[
          {
            key: 'submit',
            label: 'Kirim',
            perm: 'purchase_orders:manage',
            from: ['draft'],
            variant: 'secondary',
            confirm: 'Kirim PO ini untuk persetujuan?',
          },
          {
            key: 'approve',
            label: 'Setujui',
            perm: 'purchase_orders:approve',
            from: ['pending'],
            variant: 'success',
            confirm: 'Setujui purchase order ini?',
          },
          {
            key: 'reject',
            label: 'Tolak',
            perm: 'purchase_orders:approve',
            from: ['pending', 'approved'],
            variant: 'danger',
            confirm: 'Tolak purchase order ini?',
            requireNote: true,
          },
          {
            key: 'cancel',
            label: 'Batal',
            perm: 'purchase_orders:manage',
            from: ['draft', 'pending'],
            variant: 'danger',
            confirm: 'Batalkan purchase order ini?',
          },
        ]}
        detail={{
          title: 'Detail Purchase Order',
          itemsLabel: 'Item PO',
          headerFields: [
            { label: 'Nomor', render: (d) => d.po_number },
            { label: 'Supplier', render: (d) => d.supplier?.company_name },
            { label: 'Gudang', render: (d) => d.warehouse?.name },
            { label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
            { label: 'Tanggal Pesan', render: (d) => formatDate(d.order_date) },
            { label: 'Tiba', render: (d) => formatDate(d.expected_date) },
            { label: 'Subtotal', render: (d) => formatCurrency(d.subtotal) },
            { label: 'Pajak', render: (d) => `${d.tax_rate ?? 0}% (${formatCurrency(d.tax_amount)})` },
            { label: 'Total', render: (d) => <span className="font-semibold">{formatCurrency(d.total)}</span> },
            { label: 'Dibuat', render: (d) => d.creator?.name },
          ],
          itemColumns: [
            { key: 'product', header: 'Produk', render: (it) => it.product?.name },
            { key: 'quantity', header: 'Jumlah' },
            { key: 'unit_price', header: 'Harga', render: (it) => formatCurrency(it.unit_price) },
            { key: 'subtotal', header: 'Subtotal', render: (it) => formatCurrency(it.subtotal) },
          ],
        }}
      />

      <CreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Buat Purchase Order"
        subtitle="Isi informasi PO dan item yang akan dibeli"
        schema={schema}
        defaultValues={defaultValues}
        submitText="Buat PO"
        onSuccess={(data) => {
          toast.success(data.message);
          queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        }}
        onSubmit={handleCreate}
      >
        {({ register, errors }) => (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Supplier" error={errors.supplier_id?.message} {...register('supplier_id')}>
                <option value="">Pilih supplier...</option>
                {supplierOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.company_name}
                  </option>
                ))}
              </Select>
              <Select label="Gudang Tujuan" error={errors.warehouse_id?.message} {...register('warehouse_id')}>
                <option value="">Pilih gudang...</option>
                {warehouseOptions.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </Select>
              <Input label="Tanggal Pesan" type="date" error={errors.order_date?.message} {...register('order_date')} />
              <Input label="Perkiraan Tiba" type="date" {...register('expected_date')} />
              <Input label="Pajak (%)" type="number" {...register('tax_rate')} />
              <Input label="Diskon (Rp)" type="number" {...register('discount')} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Item Produk</p>
              <LineEditor products={products} lines={lines} onChange={setLines} withPrice />
            </div>
            <Textarea label="Catatan" rows={2} {...register('notes')} />
          </>
        )}
      </CreateModal>
    </div>
  );
}
