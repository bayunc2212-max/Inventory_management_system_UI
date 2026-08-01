import { z } from 'zod';
import { CrudTable } from '../../components/master/CrudTable';
import { StatusBadge } from '../../components/ui/Badge';
import { useOptions } from '../../hooks/useOptions';

const schema = z.object({
  code: z.string().min(1, 'Kode wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  branch_id: z.coerce.number().positive().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  pic_name: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  is_active: z.boolean(),
});

export default function WarehousesPage() {
  const { options: branchOptions } = useOptions('/branches/all', { key: 'branches' });

  return (
    <CrudTable
      title="Gudang"
      subtitle="Kelola gudang dan lokasi penyimpanan"
      queryKey="warehouses"
      endpoint="/warehouses"
      searchPlaceholder="Cari kode, nama, PIC..."
      canCreate="warehouses:manage"
      canEdit="warehouses:manage"
      canDelete="warehouses:manage"
      schema={schema}
      fields={[
        { name: 'code', label: 'Kode Gudang', required: true, placeholder: 'cth: GDG-03' },
        { name: 'name', label: 'Nama Gudang', required: true },
        {
          name: 'branch_id',
          label: 'Cabang',
          type: 'select',
          options: branchOptions.map((b) => ({ value: b.id, label: b.name })),
        },
        { name: 'pic_name', label: 'PIC' },
        { name: 'phone', label: 'Telepon' },
        { name: 'address', label: 'Alamat', type: 'textarea', full: true },
        { name: 'is_active', label: 'Status', type: 'switch' },
      ]}
      columns={[
        { key: 'code', header: 'Kode' },
        {
          key: 'name',
          header: 'Nama',
          render: (row) => <span className="font-medium text-slate-700 dark:text-slate-200">{row.name}</span>,
        },
        {
          key: 'branch',
          header: 'Cabang',
          render: (row) => row.branch?.name || <span className="text-slate-300">-</span>,
        },
        {
          key: 'locations',
          header: 'Lokasi',
          render: (row) => row.locations?.length || 0,
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
