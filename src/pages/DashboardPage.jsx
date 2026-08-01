import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Package,
  Banknote,
  AlertTriangle,
  PackageX,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileClock,
  TrendingDown,
} from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency, formatNumber, formatDateTime } from '../utils/format';

export default function DashboardPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/reports/dashboard');
      return res.data.data;
    },
    refetchInterval: 60_000,
  });

  const s = data?.summary;
  const nav = (path, perm) => (hasPermission(perm) ? path : null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-400">Ringkasan kinerja inventori hari ini</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Produk"
          value={formatNumber(s?.totalProducts)}
          icon={Package}
          tone="blue"
          loading={isLoading}
          hint="SKU aktif terdaftar"
          onClick={nav('/products', 'products:view')}
        />
        <StatCard
          title="Nilai Persediaan"
          value={formatCurrency(s?.inventoryValue)}
          icon={Banknote}
          tone="green"
          loading={isLoading}
          hint="Harga beli × stok"
        />
        <StatCard
          title="Stok Menipis"
          value={formatNumber(s?.lowStock)}
          icon={AlertTriangle}
          tone="amber"
          loading={isLoading}
          hint="Di bawah / sama dengan stok min"
          onClick={nav('/products', 'products:view')}
        />
        <StatCard
          title="Stok Habis"
          value={formatNumber(s?.outOfStock)}
          icon={PackageX}
          tone="rose"
          loading={isLoading}
          hint="Perlu restock"
          onClick={nav('/products', 'products:view')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Masuk Hari Ini"
          value={formatNumber(s?.inToday)}
          icon={ArrowDownToLine}
          tone="green"
          loading={isLoading}
          hint={`Bulan ini: ${formatNumber(s?.inMonth)}`}
        />
        <StatCard
          title="Keluar Hari Ini"
          value={formatNumber(s?.outToday)}
          icon={ArrowUpFromLine}
          tone="rose"
          loading={isLoading}
          hint={`Bulan ini: ${formatNumber(s?.outMonth)}`}
        />
        <StatCard
          title="PO Menunggu"
          value={formatNumber(s?.pendingPOs)}
          icon={FileClock}
          tone="violet"
          loading={isLoading}
          hint="Perlu persetujuan"
          onClick={nav('/purchase-orders', 'purchase_orders:view')}
        />
        <StatCard
          title="Produk Terlaris"
          value={formatNumber(data?.topProducts?.length || 0)}
          icon={TrendingDown}
          tone="slate"
          loading={isLoading}
          hint="Berdasarkan pengeluaran bulan ini"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700/50">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Aktivitas Stok Terbaru</h2>
              <p className="text-xs text-slate-400">Pergerakan masuk/keluar terakhir</p>
            </div>
            {hasPermission('movements:view') && (
              <Link to="/movements" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                Lihat semua
              </Link>
            )}
          </div>
          {isLoading ? (
            <Skeleton className="m-4 h-48" />
          ) : data?.recentMovements?.length ? (
            <Table>
              <THead>
                <TR>
                  <TH>Waktu</TH>
                  <TH>Produk</TH>
                  <TH>Gudang</TH>
                  <TH>Tipe</TH>
                  <TH>Perubahan</TH>
                </TR>
              </THead>
              <TBody>
                {data.recentMovements.map((m) => (
                  <TR key={m.id}>
                    <TD className="whitespace-nowrap text-xs text-slate-500">{formatDateTime(m.created_at)}</TD>
                    <TD>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{m.product?.name}</p>
                      <p className="text-xs text-slate-400">{m.product?.sku}</p>
                    </TD>
                    <TD>{m.warehouse?.code || '-'}</TD>
                    <TD><Badge tone={m.qty_change > 0 ? 'green' : 'rose'}>{m.type.replace(/_/g, ' ')}</Badge></TD>
                    <TD>
                      <span className={`font-semibold ${m.qty_change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {m.qty_change > 0 ? `+${m.qty_change}` : m.qty_change}
                      </span>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState title="Belum ada aktivitas" description="Belum ada pergerakan stok." />
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700/50">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Stok Menipis</h2>
                <p className="text-xs text-slate-400">Perlu restock segera</p>
              </div>
              {hasPermission('products:view') && (
                <Link to="/products" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                  Kelola
                </Link>
              )}
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="m-3 h-9" />)
                : data?.lowStockProducts?.length
                  ? data.lowStockProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.sku}</p>
                        </div>
                        <div className="text-right">
                          <Badge tone={p.current_stock <= 0 ? 'rose' : 'amber'}>{p.current_stock} {p.unit}</Badge>
                          <p className="mt-0.5 text-xs text-slate-400">min {p.min_stock}</p>
                        </div>
                      </div>
                    ))
                  : <EmptyState title="Aman" description="Tidak ada stok menipis." />}
            </div>
          </Card>

          <Card>
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700/50">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Produk Terlaris</h2>
              <p className="text-xs text-slate-400">Pengeluaran terbanyak bulan ini</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="m-3 h-9" />)
                : data?.topProducts?.length
                  ? data.topProducts.map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/10 text-xs font-semibold text-brand-600 dark:text-brand-400">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.sku}</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatNumber(p.total_out)} {p.unit}</p>
                      </div>
                    ))
                  : <EmptyState title="Belum ada data" description="Belum ada pengeluaran bulan ini." />}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
