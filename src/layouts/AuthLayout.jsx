import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Boxes } from 'lucide-react';

export default function AuthLayout() {
  const { pathname } = useLocation();
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-[#0b1020]">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30">
            <Boxes className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Stockify</h1>
            <p className="text-sm text-slate-400">Sistem Manajemen Inventori</p>
          </div>
        </div>

        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="card p-6 sm:p-8"
        >
          <Outlet />
        </motion.div>

        <p className="mt-6 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Stockify —{' '}
          <Link to="/login" className="font-medium text-brand-500 hover:underline">
            Inventory System
          </Link>
        </p>
      </div>
    </div>
  );
}
