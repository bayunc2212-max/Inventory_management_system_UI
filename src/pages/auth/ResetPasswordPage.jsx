import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api, { extractErrorMessage } from '../../api/client';

const schema = z
  .object({
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      await api.post('/auth/reset-password', { token, password: values.password, confirmPassword: values.confirmPassword });
      toast.success('Password berhasil direset');
      navigate('/login');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Gagal mereset password'));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Buat Password Baru</h2>
        <p className="mt-0.5 text-sm text-slate-400">Masukkan password baru untuk akun Anda</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Input
            label="Password Baru"
            placeholder="Minimal 8 karakter"
            icon={Lock}
            type={showPw ? 'text' : 'password'}
            error={errors.password?.message}
            className="pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Input
          label="Konfirmasi Password"
          placeholder="Ulangi password baru"
          icon={CheckCircle2}
          type="password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Simpan Password Baru
        </Button>
      </form>

      <Link to="/login" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Kembali ke login
      </Link>
    </div>
  );
}
