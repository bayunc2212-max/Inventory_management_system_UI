import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import api, { extractErrorMessage } from '../../api/client';
import { formatDateTime } from '../../utils/format';

const profileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(150),
  phone: z.string().max(30).optional().or(z.literal('')),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password lama wajib diisi'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  manager_gudang: 'Manager Gudang',
  staff_gudang: 'Staff Gudang',
  purchasing: 'Purchasing',
  finance: 'Finance',
  viewer: 'Viewer',
};

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', phone: user?.phone || '' },
  });

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const onProfileSubmit = async (values) => {
    try {
      const { data } = await api.put('/auth/profile', values);
      setUser(data.data);
      toast.success('Profil berhasil diperbarui');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const onPasswordSubmit = async (values) => {
    try {
      await api.post('/auth/change-password', values);
      passwordForm.reset();
      toast.success('Password berhasil diubah');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Profil Saya" subtitle="Kelola informasi akun dan password Anda" />

      <div className="space-y-6">
        <Card>
          <CardBody>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Avatar name={user?.name} src={user?.avatar} size="lg" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{user?.name}</h2>
                <p className="text-sm text-slate-400">{user?.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="violet">{ROLE_LABELS[user?.role] || user?.role}</Badge>
                  {user?.branch && <Badge tone="blue">{user.branch.name}</Badge>}
                  <Badge tone={user?.is_active ? 'green' : 'gray'}>{user?.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Terakhir login:{' '}
              <span className="font-medium text-slate-500 dark:text-slate-300">
                {formatDateTime(user?.last_login_at)}
              </span>
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Informasi Profil" subtitle="Perbarui nama dan nomor telepon Anda" />
          <CardBody>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <Input
                label="Nama Lengkap"
                error={profileForm.formState.errors.name?.message}
                {...profileForm.register('name')}
              />
              <Input
                label="Nomor Telepon"
                placeholder="08xxxxxxxxxx"
                error={profileForm.formState.errors.phone?.message}
                {...profileForm.register('phone')}
              />
              <div className="flex justify-end">
                <Button type="submit" loading={profileForm.formState.isSubmitting}>
                  <Save className="h-4 w-4" /> Simpan Profil
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Ganti Password" subtitle="Pastikan password kuat dan tidak digunakan di tempat lain" />
          <CardBody>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <Input
                label="Password Lama"
                type="password"
                autoComplete="current-password"
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register('currentPassword')}
              />
              <Input
                label="Password Baru"
                type="password"
                autoComplete="new-password"
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register('newPassword')}
              />
              <Input
                label="Konfirmasi Password Baru"
                type="password"
                autoComplete="new-password"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword')}
              />
              <div className="flex justify-end">
                <Button type="submit" variant="secondary" loading={passwordForm.formState.isSubmitting}>
                  <KeyRound className="h-4 w-4" /> Ganti Password
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
