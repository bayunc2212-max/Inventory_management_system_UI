import { z } from 'zod';
import { CrudTable } from '../../components/master/CrudTable';
import { StatusBadge } from '../../components/ui/Badge';

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  description: z.string().optional().or(z.literal('')),
  is_active: z.boolean(),
});

export default function BrandsPage() {
  return (
    <CrudTable
      title="Brand"
      subtitle="Kelola brand produk"
      queryKey="brands"
      endpoint="/brands"
      searchPlaceholder="Cari brand..."
      canCreate="brands:manage"
      canEdit="brands:manage"
      canDelete="brands:manage"
      schema={schema}
      fields={[
        { name: 'name', label: 'Nama Brand', required: true },
        { name: 'description', label: 'Deskripsi', type: 'textarea', full: true },
        { name: 'is_active', label: 'Status', type: 'switch' },
      ]}
      columns={[
        { key: 'name', header: 'Nama' },
        {
          key: 'description',
          header: 'Deskripsi',
          render: (row) => row.description || <span className="text-slate-300">-</span>,
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
