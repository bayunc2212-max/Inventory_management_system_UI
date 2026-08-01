import { z } from 'zod';
import { CrudTable } from '../../components/master/CrudTable';
import { StatusBadge } from '../../components/ui/Badge';

const schema = z.object({
  company_name: z.string().min(1, 'Nama perusahaan wajib diisi'),
  pic_name: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  npwp: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  rating: z.coerce.number().min(0).max(5).optional().or(z.literal('')),
  is_active: z.boolean(),
});

export default function SuppliersPage() {
  return (
    <CrudTable
      title="Supplier"
      subtitle="Kelola data pemasok"
      queryKey="suppliers"
      endpoint="/suppliers"
      searchPlaceholder="Cari perusahaan, PIC, email..."
      canCreate="suppliers:manage"
      canEdit="suppliers:manage"
      canDelete="suppliers:manage"
      schema={schema}
      fields={[
        { name: 'company_name', label: 'Nama Perusahaan', required: true },
        { name: 'pic_name', label: 'Nama PIC' },
        { name: 'phone', label: 'Telepon' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'npwp', label: 'NPWP' },
        { name: 'rating', label: 'Rating (0-5)', type: 'number' },
        { name: 'address', label: 'Alamat', type: 'textarea', full: true },
        { name: 'notes', label: 'Catatan', type: 'textarea', full: true },
        { name: 'is_active', label: 'Status', type: 'switch' },
      ]}
      columns={[
        {
          key: 'company_name',
          header: 'Perusahaan',
          render: (row) => <span className="font-medium text-slate-700 dark:text-slate-200">{row.company_name}</span>,
        },
        {
          key: 'pic_name',
          header: 'PIC',
          render: (row) => row.pic_name || <span className="text-slate-300">-</span>,
        },
        { key: 'phone', header: 'Telepon', render: (row) => row.phone || '-' },
        {
          key: 'email',
          header: 'Email',
          render: (row) => row.email || <span className="text-slate-300">-</span>,
        },
        {
          key: 'rating',
          header: 'Rating',
          render: (row) => (Number(row.rating) > 0 ? `★ ${row.rating}` : <span className="text-slate-300">-</span>),
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
