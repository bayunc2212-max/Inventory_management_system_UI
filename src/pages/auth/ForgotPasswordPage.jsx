import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api, { extractErrorMessage } from '../../api/client';

const schema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
});

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      await api.post('/auth/forgot-password', values);
      setSentEmail(values.email);
      setSent(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Gagal mengirim tautan reset'));
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Cek email Anda</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Jika <span className="font-medium text-slate-600 dark:text-slate-300">{sentEmail}</span> terdaftar, kami
          telah mengirim tautan untuk mereset password Anda.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Lupa Password</h2>
        <p className="mt-0.5 text-sm text-slate-400">
          Masukkan email Anda, kami akan mengirimkan tautan untuk reset password.
        </p>
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
        <Button type="submit" loading={isSubmitting} className="w-full">
          Kirim Tautan Reset
        </Button>
      </form>

      <Link
        to="/login"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke login
      </Link>
    </div>
  );
}
