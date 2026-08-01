import { z } from 'zod';
import { CrudTable } from '../../components/master/CrudTable';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { useOptions } from '../../hooks/useOptions';
import { formatDateTime } from '../../utils/format';

const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'manager_gudang', label: 'Manager Gudang' },
  { value: 'staff_gudang', label: 'Staff Gudang' },
  { value: 'purchasing', label: 'Purchasing' },
  { value: 'finance', label: 'Finance' },
  { value: 'viewer', label: 'Viewer' },
];

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().optional().or(z.literal('')),
  role: z.string().min(1, 'Role wajib dipilih'),
  branch_id: z.coerce.number().positive().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  is_active: z.boolean(),
});

const transformSubmit = (values, editing) => {
  if (!editing && (!values.password || values.password.length < 8)) {
    throw new Error('Password wajib diisi minimal 8 karakter');
  }
  const v = { ...values };
  if (editing) delete v.password;
  if (v.branch_id === '' || v.branch_id === undefined) v.branch_id = null;
  if (v.phone === '') v.phone = null;
  return v;
};

const roleTone = {
  super_admin: 'rose',
  manager_gudang: 'violet',
  staff_gudang: 'blue',
  purchasing: 'green',
  finance: 'amber',
  viewer: 'gray',
};

export default function UsersPage() {
  const { options: branchOptions } = useOptions('/branches/all', { key: 'branches' });

  return (
    <CrudTable
      title="Pengguna"
      subtitle="Kelola akun dan hak akses pengguna"
      queryKey="users"
      endpoint="/users"
      searchPlaceholder="Cari nama atau email..."
      canCreate="users:manage"
      canEdit="users:manage"
      canDelete="users:manage"
      schema={schema}
      transformSubmit={transformSubmit}
      fields={[
        { name: 'name', label: 'Nama Lengkap', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Minimal 8 karakter (hanya saat membuat)' },
        { name: 'role', label: 'Role', type: 'select', required: true, options: ROLE_OPTIONS },
        {
          name: 'branch_id',
          label: 'Cabang',
          type: 'select',
          options: branchOptions.map((b) => ({ value: b.id, label: b.name })),
        },
        { name: 'phone', label: 'Telepon' },
        { name: 'is_active', label: 'Status Akun', type: 'switch' },
      ]}
      columns={[
        {
          key: 'name',
          header: 'Pengguna',
          render: (row) => (
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-200">{row.name}</p>
              <p className="text-xs text-slate-400">{row.email}</p>
            </div>
          ),
        },
        {
          key: 'role',
          header: 'Role',
          render: (row) => <Badge tone={roleTone[row.role] || 'slate'}>{ROLE_OPTIONS.find((r) => r.value === row.role)?.label || row.role}</Badge>,
        },
        {
          key: 'branch',
          header: 'Cabang',
          render: (row) => row.branch?.name || <span className="text-slate-300">-</span>,
        },
        { key: 'phone', header: 'Telepon', render: (row) => row.phone || '-' },
        {
          key: 'is_active',
          header: 'Status',
          render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} />,
        },
        {
          key: 'last_login_at',
          header: 'Login Terakhir',
          render: (row) => (row.last_login_at ? formatDateTime(row.last_login_at) : <span className="text-slate-300">-</span>),
        },
      ]}
    />
  );
}
