import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import api, { extractErrorMessage } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useOptions } from '../../hooks/useOptions';
import { useQuery } from '@tanstack/react-query';
import { TransactionList } from '../../components/transactions/TransactionList';
import { CreateModal } from '../../components/transactions/CreateModal';
import { LineEditor } from '../../components/transactions/LineEditor';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../utils/format';

const schema = z.object({
  purchase_order_id: z.coerce.number().positive().optional().or(z.literal('')),
  supplier_id: z.coerce.number().positive('Supplier wajib dipilih'),
  warehouse_id: z.coerce.number().positive('Gudang wajib dipilih'),
  received_date: z.string().min(1, 'Tanggal terima wajib diisi'),
  notes: z.string().optional().or(z.literal('')),
});

export default function GoodsReceiptsPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [lines, setLines] = useState([]);
  const [poId, setPoId] = useState('');
  const { options: supplierOptions } = useOptions('/suppliers/all', { key: 'suppliers' });
  const { options: warehouseOptions } = useOptions('/warehouses/all', { key: 'warehouses' });
  const { options: products } = useOptions('/products/all', { key: 'products' });
  const { options: poOptions } = useOptions('/purchase-orders?limit=50&status=approved', { key: 'pos-for-gr' });

  const { data: poDetail } = useQuery({
    queryKey: ['purchase-orders', 'detail', poId],
    queryFn: async () => {
      if (!poId) return null;
      const res = await api.get(`/purchase-orders/${poId}`);
      return res.data.data;
    },
    enabled: !!poId,
  });

  const defaultValues = useMemo(
    () => ({ purchase_order_id: '', supplier_id: '', warehouse_id: '', received_date: '', notes: '' }),
    []
  );

  const openCreate = () => {
    setLines([]);
    setPoId('');
    setCreateOpen(true);
  };

  const handlePoChange = (value) => {
    setPoId(value);
    const po = poDetail;
    if (po && po.items) {
      setLines(
        po.items.map((it) => ({
          _id: Math.random().toString(36).slice(2, 8),
          product_id: it.product_id,
          quantity: '',
          unit_price: it.unit_price,
          purchase_order_item_id: it.id,
          ordered_qty: it.quantity,
          note: '',
        }))
      );
    }
  };

  const handleCreate = async (values) => {
    if (!lines.length) {
      toast.error('Minimal satu item wajib diisi');
      throw new Error('no items');
    }
    const items = lines.map((l) => ({
      product_id: l.product_id,
      purchase_order_item_id: poId ? l.purchase_order_item_id : null,
      ordered_qty: l.ordered_qty || 0,
      received_qty: l.quantity,
      damaged_qty: 0,
      shortage_qty: 0,
      expired_qty: 0,
      unit_price: l.unit_price || 0,
      note: l.note,
    }));
    const res = await api.post('/goods-receipts', { ...values, items });
    return res.data;
  };

  return (
    <div>
      <TransactionList
        title="Penerimaan Barang"
        subtitle="Catat penerimaan barang dari supplier / PO"
        queryKey="goods-receipts"
        endpoint="/goods-receipts"
        searchPlaceholder="Cari nomor GR atau catatan..."
        statusOptions={['draft', 'received', 'rejected']}
        createButton={
          hasPermission('goods_receipts:manage') && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Buat GR
            </Button>
          )
        }
        columns={[
          { key: 'gr_number', header: 'Nomor', className: 'font-mono text-xs' },
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
          { key: 'received_date', header: 'Tanggal', render: (row) => formatDate(row.received_date) },
          {
            key: 'total',
            header: 'Total',
            render: (row) => <span className="font-medium">{formatCurrency(row.total_amount)}</span>,
          },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        ]}
        detail={{
          title: 'Detail Penerimaan Barang',
          itemsLabel: 'Item Penerimaan',
          headerFields: [
            { label: 'Nomor', render: (d) => d.gr_number },
            { label: 'PO Terkait', render: (d) => d.purchase_order?.po_number || '-' },
            { label: 'Supplier', render: (d) => d.supplier?.company_name },
            { label: 'Gudang', render: (d) => d.warehouse?.name },
            { label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
            { label: 'Tanggal', render: (d) => formatDate(d.received_date) },
            { label: 'Total', render: (d) => <span className="font-semibold">{formatCurrency(d.total_amount)}</span> },
            { label: 'Catatan', render: (d) => d.notes || '-' },
          ],
          itemColumns: [
            { key: 'product', header: 'Produk', render: (it) => it.product?.name },
            { key: 'received_qty', header: 'Diterima' },
            { key: 'damaged_qty', header: 'Rusak' },
            { key: 'shortage_qty', header: 'Kurang' },
            { key: 'expired_qty', header: 'Expired' },
            { key: 'unit_price', header: 'Harga', render: (it) => formatCurrency(it.unit_price) },
            { key: 'total', header: 'Subtotal', render: (it) => formatCurrency(it.total) },
          ],
        }}
      />

      <CreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Buat Penerimaan Barang"
        subtitle="Isi supplier, gudang, dan item yang diterima"
        schema={schema}
        defaultValues={defaultValues}
        submitText="Terima Barang"
        onSuccess={(data) => {
          toast.success(data.message);
          queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }}
        onSubmit={handleCreate}
      >
        {({ register, errors, setValue, watch }) => (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Select
                  label="Dari PO (opsional)"
                  {...register('purchase_order_id')}
                  onChange={(e) => {
                    setValue('purchase_order_id', e.target.value);
                    handlePoChange(e.target.value);
                  }}
                >
                  <option value="">Tanpa PO / pilih PO...</option>
                  {poOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.po_number} — {p.supplier?.company_name} ({formatCurrency(p.total)})
                    </option>
                  ))}
                </Select>
              </div>
              <Select label="Supplier" error={errors.supplier_id?.message} {...register('supplier_id')}>
                <option value="">Pilih supplier...</option>
                {supplierOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.company_name}
                  </option>
                ))}
              </Select>
              <Select label="Gudang" error={errors.warehouse_id?.message} {...register('warehouse_id')}>
                <option value="">Pilih gudang...</option>
                {warehouseOptions.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </Select>
              <Input label="Tanggal Terima" type="date" error={errors.received_date?.message} {...register('received_date')} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                Item Diterima {watch('purchase_order_id') ? '(stok mengikuti qty yang diisi)' : ''}
              </p>
              <LineEditor products={products} lines={lines} onChange={setLines} withPrice />
            </div>
            <Textarea label="Catatan" rows={2} {...register('notes')} />
          </>
        )}
      </CreateModal>
    </div>
  );
}
