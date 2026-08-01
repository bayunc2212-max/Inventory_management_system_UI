import { z } from 'zod';
import { CrudTable } from '../../components/master/CrudTable';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { useOptions } from '../../hooks/useOptions';
import { formatCurrency } from '../../utils/format';

const schema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  sku: z.string().min(1, 'SKU wajib diisi'),
  barcode: z.string().optional().or(z.literal('')),
  category_id: z.coerce.number().positive().optional().or(z.literal('')),
  brand_id: z.coerce.number().positive().optional().or(z.literal('')),
  unit: z.string().min(1, 'Satuan wajib diisi'),
  cost_price: z.coerce.number().min(0).optional().or(z.literal('')),
  selling_price: z.coerce.number().min(0).optional().or(z.literal('')),
  min_stock: z.coerce.number().min(0).optional().or(z.literal('')),
  max_stock: z.coerce.number().min(0).optional().or(z.literal('')),
  warehouse_id: z.coerce.number().positive().optional().or(z.literal('')),
  location_id: z.coerce.number().positive().optional().or(z.literal('')),
  weight: z.coerce.number().min(0).optional().or(z.literal('')),
  expired_at: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  is_active: z.boolean(),
});

const transformSubmit = (values) => {
  const v = { ...values };
  ['category_id', 'brand_id', 'warehouse_id', 'location_id', 'max_stock', 'weight', 'expired_at', 'barcode'].forEach(
    (k) => {
      if (v[k] === '' || v[k] === undefined) v[k] = null;
    }
  );
  v.cost_price = v.cost_price === '' ? 0 : Number(v.cost_price);
  v.selling_price = v.selling_price === '' ? 0 : Number(v.selling_price);
  v.min_stock = v.min_stock === '' ? 0 : Number(v.min_stock);
  return v;
};

function StockCell({ row }) {
  if (row.current_stock <= 0) {
    return <Badge tone="rose">0</Badge>;
  }
  if (row.current_stock <= row.min_stock) {
    return <Badge tone="amber">{row.current_stock}</Badge>;
  }
  return <span className="font-medium text-slate-600 dark:text-slate-300">{row.current_stock}</span>;
}

export default function ProductsPage() {
  const { options: categoryOptions } = useOptions('/categories/all', { key: 'categories' });
  const { options: brandOptions } = useOptions('/brands/all', { key: 'brands' });
  const { options: warehouseOptions } = useOptions('/warehouses/all', { key: 'warehouses' });
  const { options: locationOptions } = useOptions('/locations/all', { key: 'locations' });

  return (
    <CrudTable
      title="Produk"
      subtitle="Kelola data produk dan stok"
      queryKey="products"
      endpoint="/products"
      searchPlaceholder="Cari nama, SKU, atau barcode..."
      canCreate="products:create"
      canEdit="products:update"
      canDelete="products:delete"
      schema={schema}
      transformSubmit={transformSubmit}
      fields={[
        { name: 'name', label: 'Nama Produk', required: true, full: true },
        { name: 'sku', label: 'SKU', required: true },
        { name: 'barcode', label: 'Barcode' },
        { name: 'unit', label: 'Satuan', placeholder: 'pcs' },
        {
          name: 'category_id',
          label: 'Kategori',
          type: 'select',
          options: categoryOptions.map((c) => ({ value: c.id, label: c.name })),
        },
        {
          name: 'brand_id',
          label: 'Brand',
          type: 'select',
          options: brandOptions.map((b) => ({ value: b.id, label: b.name })),
        },
        { name: 'cost_price', label: 'Harga Beli', type: 'number' },
        { name: 'selling_price', label: 'Harga Jual', type: 'number' },
        { name: 'min_stock', label: 'Stok Minimum', type: 'number' },
        { name: 'max_stock', label: 'Stok Maksimum', type: 'number' },
        {
          name: 'warehouse_id',
          label: 'Gudang',
          type: 'select',
          options: warehouseOptions.map((w) => ({ value: w.id, label: `${w.code} - ${w.name}` })),
        },
        {
          name: 'location_id',
          label: 'Lokasi',
          type: 'select',
          options: locationOptions.map((l) => ({ value: l.id, label: `${l.code} - ${l.name}` })),
        },
        { name: 'weight', label: 'Berat (kg)', type: 'number' },
        { name: 'expired_at', label: 'Kedaluwarsa', type: 'date' },
        { name: 'description', label: 'Deskripsi', type: 'textarea', full: true },
        { name: 'is_active', label: 'Status', type: 'switch' },
      ]}
      columns={[
        { key: 'sku', header: 'SKU', className: 'font-mono text-xs' },
        {
          key: 'name',
          header: 'Nama',
          render: (row) => (
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-200">{row.name}</p>
              {row.barcode && <p className="text-xs text-slate-400">{row.barcode}</p>}
            </div>
          ),
        },
        {
          key: 'category',
          header: 'Kategori',
          render: (row) => row.category?.name || <span className="text-slate-300">-</span>,
        },
        {
          key: 'brand',
          header: 'Brand',
          render: (row) => row.brand?.name || <span className="text-slate-300">-</span>,
        },
        {
          key: 'warehouse',
          header: 'Gudang',
          render: (row) => row.warehouse?.code || <span className="text-slate-300">-</span>,
        },
        {
          key: 'current_stock',
          header: 'Stok',
          render: (row) => (
            <div className="flex items-center gap-2">
              <StockCell row={row} />
              <span className="text-xs text-slate-400">{row.unit}</span>
            </div>
          ),
        },
        {
          key: 'selling_price',
          header: 'Harga Jual',
          render: (row) => formatCurrency(row.selling_price),
        },
        {
          key: 'is_active',
          header: 'Status',
          render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} />,
        },
      ]}
    />
  );
}
