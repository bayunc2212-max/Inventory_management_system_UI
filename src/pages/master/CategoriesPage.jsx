import { z } from 'zod';
import { CrudTable } from '../../components/master/CrudTable';
import { StatusBadge } from '../../components/ui/Badge';
import { useOptions } from '../../hooks/useOptions';

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  code: z.string().optional().or(z.literal('')),
  parent_id: z.coerce.number().positive().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  is_active: z.boolean(),
});

export default function CategoriesPage() {
  const { options: parentOptions } = useOptions('/categories/all', { key: 'categories' });

  return (
    <CrudTable
      title="Kategori"
      subtitle="Kelola kategori produk"
      queryKey="categories"
      endpoint="/categories"
      searchPlaceholder="Cari nama atau kode..."
      canCreate="categories:manage"
      canEdit="categories:manage"
      canDelete="categories:manage"
      schema={schema}
      fields={[
        { name: 'name', label: 'Nama Kategori', required: true },
        { name: 'code', label: 'Kode', placeholder: 'cth: BB' },
        {
          name: 'parent_id',
          label: 'Kategori Induk',
          type: 'select',
          options: parentOptions.map((p) => ({ value: p.id, label: p.name })),
        },
        { name: 'description', label: 'Deskripsi', type: 'textarea', full: true },
        { name: 'is_active', label: 'Status', type: 'switch' },
      ]}
      columns={[
        { key: 'name', header: 'Nama' },
        { key: 'code', header: 'Kode' },
        {
          key: 'parent',
          header: 'Induk',
          render: (row) => row.parent?.name || <span className="text-slate-300">-</span>,
        },
        {
          key: 'children',
          header: 'Sub-kategori',
          render: (row) => row.children?.length || 0,
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
