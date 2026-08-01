import { z } from 'zod';
import { CrudTable } from '../../components/master/CrudTable';
import { Badge } from '../../components/ui/Badge';
import { useOptions } from '../../hooks/useOptions';

const schema = z.object({
  warehouse_id: z.coerce.number().positive('Pilih gudang terlebih dahulu'),
  parent_id: z.coerce.number().positive().optional().or(z.literal('')),
  type: z.string().min(1, 'Pilih tipe'),
  code: z.string().min(1, 'Kode wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  description: z.string().optional().or(z.literal('')),
});

const TYPE_LABELS = { area: 'Area', rack: 'Rak', shelf: 'Shelf', bin: 'Bin' };

export default function LocationsPage() {
  const { options: warehouseOptions } = useOptions('/warehouses/all', { key: 'warehouses' });
  const { options: parentOptions } = useOptions('/locations/all', { key: 'locations' });

  return (
    <CrudTable
      title="Lokasi"
      subtitle="Kelola lokasi penyimpanan di dalam gudang"
      queryKey="locations"
      endpoint="/locations"
      searchPlaceholder="Cari kode atau nama lokasi..."
      canCreate="locations:manage"
      canEdit="locations:manage"
      canDelete="locations:manage"
      schema={schema}
      fields={[
        {
          name: 'warehouse_id',
          label: 'Gudang',
          type: 'select',
          required: true,
          options: warehouseOptions.map((w) => ({ value: w.id, label: `${w.code} - ${w.name}` })),
        },
        {
          name: 'type',
          label: 'Tipe',
          type: 'select',
          required: true,
          options: Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label })),
        },
        { name: 'code', label: 'Kode Lokasi', required: true, placeholder: 'cth: A-02' },
        { name: 'name', label: 'Nama Lokasi', required: true },
        {
          name: 'parent_id',
          label: 'Lokasi Induk',
          type: 'select',
          options: parentOptions.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` })),
        },
        { name: 'description', label: 'Deskripsi', type: 'textarea', full: true },
      ]}
      columns={[
        { key: 'code', header: 'Kode' },
        {
          key: 'name',
          header: 'Nama',
          render: (row) => <span className="font-medium text-slate-700 dark:text-slate-200">{row.name}</span>,
        },
        {
          key: 'type',
          header: 'Tipe',
          render: (row) => <Badge tone={row.type === 'bin' ? 'amber' : 'blue'}>{TYPE_LABELS[row.type] || row.type}</Badge>,
        },
        {
          key: 'warehouse',
          header: 'Gudang',
          render: (row) => row.warehouse?.name || <span className="text-slate-300">-</span>,
        },
        {
          key: 'parent',
          header: 'Induk',
          render: (row) => row.parent?.code || <span className="text-slate-300">-</span>,
        },
      ]}
    />
  );
}
