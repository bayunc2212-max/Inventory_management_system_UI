import { z } from 'zod';
import { CrudTable } from '../../components/master/CrudTable';
import { StatusBadge } from '../../components/ui/Badge';

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  is_active: z.boolean(),
});

export default function CustomersPage() {
  return (
    <CrudTable
      title="Pelanggan"
      subtitle="Kelola data pelanggan"
      queryKey="customers"
      endpoint="/customers"
      searchPlaceholder="Cari nama, telepon, email..."
      canCreate="customers:manage"
      canEdit="customers:manage"
      canDelete="customers:manage"
      schema={schema}
      fields={[
        { name: 'name', label: 'Nama Pelanggan', required: true },
        { name: 'phone', label: 'Telepon' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'address', label: 'Alamat', type: 'textarea', full: true },
        { name: 'notes', label: 'Catatan', type: 'textarea', full: true },
        { name: 'is_active', label: 'Status', type: 'switch' },
      ]}
      columns={[
        {
          key: 'name',
          header: 'Nama',
          render: (row) => <span className="font-medium text-slate-700 dark:text-slate-200">{row.name}</span>,
        },
        { key: 'phone', header: 'Telepon', render: (row) => row.phone || '-' },
        {
          key: 'email',
          header: 'Email',
          render: (row) => row.email || <span className="text-slate-300">-</span>,
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
