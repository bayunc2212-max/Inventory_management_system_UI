import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function ForbiddenPage() {
  const location = useLocation();
  return (
    <ErrorShell
      code="403"
      icon={<ShieldAlert className="h-10 w-10" />}
      title="Akses Ditolak"
      description="Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi administrator jika ini merupakan kesalahan."
      action={
        <Button onClick={() => (window.location.href = '/')}>Kembali ke Dashboard</Button>
      }
    />
  );
}

export function NotFoundPage() {
  const location = useLocation();
  return (
    <ErrorShell
      code="404"
      title="Halaman Tidak Ditemukan"
      description="Halaman yang Anda cari tidak tersedia atau telah dipindahkan."
      action={
        <Link to={location.state?.from?.pathname || '/'}>
          <Button>Kembali</Button>
        </Link>
      }
    />
  );
}

function ErrorShell({ code, icon, title, description, action }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-[#0b1020]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <p className="text-7xl font-black text-slate-200 dark:text-slate-700">{code}</p>
        <div className="mt-2 flex justify-center text-brand-500">{icon}</div>
        <h1 className="mt-4 text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
        <div className="mt-6 flex justify-center">{action}</div>
      </motion.div>
    </div>
  );
}
