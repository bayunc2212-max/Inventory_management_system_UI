import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { extractErrorMessage } from '../../api/client';

const schema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const data = await login(values.email, values.password);
      toast.success(`Selamat datang kembali, ${data.user.name}`);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Gagal login'));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Masuk</h2>
        <p className="mt-0.5 text-sm text-slate-400">Silakan masuk dengan akun Anda</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          placeholder="nama@perusahaan.com"
          icon={Mail}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="relative">
          <Input
            label="Password"
            placeholder="••••••••"
            icon={Lock}
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
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

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-medium text-brand-500 hover:underline">
            Lupa password?
          </Link>
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full">
          Masuk
        </Button>
      </form>

      <div className="mt-5 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-400 dark:bg-slate-800/50">
        Akun demo: <span className="font-medium text-slate-600 dark:text-slate-300">admin@company.com</span> /{' '}
        <span className="font-medium text-slate-600 dark:text-slate-300">Admin@123</span>
      </div>
    </div>
  );
}
