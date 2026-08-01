import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import api, { extractErrorMessage } from '../api/client';
import { useOptions } from '../hooks/useOptions';
import { Card } from '../components/ui/Card';
import { Table, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Select, Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatNumber, formatDateTime } from '../utils/format';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StockReportTab() {
  const { options: categories } = useOptions('/categories/all', { key: 'categories' });
  const { options: warehouses } = useOptions('/warehouses/all', { key: 'warehouses' });
  const [filters, setFilters] = useState({ category_id: '', warehouse_id: '', low_stock: '' });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['reports', 'stock', filters],
    queryFn: async () => {
      const res = await api.get('/reports/stock', { params: { category_id: filters.category_id || undefined, warehouse_id: filters.warehouse_id || undefined, low_stock: filters.low_stock || undefined } });
      return res.data.data;
    },
  });

  const rows = data?.rows ?? [];

  const exportExcel = async () => {
    try {
      const res = await api.get('/reports/export/stock', {
        params: { category_id: filters.category_id || undefined, warehouse_id: filters.warehouse_id || undefined, low_stock: filters.low_stock || undefined },
        responseType: 'blob',
      });
      downloadBlob(res.data, `laporan-stok-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700/50">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <Select label="Kategori" value={filters.category_id} onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}>
            <option value="">Semua kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select label="Gudang" value={filters.warehouse_id} onChange={(e) => setFilters({ ...filters, warehouse_id: e.target.value })}>
            <option value="">Semua gudang</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.code}</option>
            ))}
          </Select>
          <Select label="Stok" value={filters.low_stock} onChange={(e) => setFilters({ ...filters, low_stock: e.target.value })}>
            <option value="">Semua stok</option>
            <option value="true">Hanya stok menipis</option>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && <span className="text-xs text-slate-400">Nilai total: <b>{formatCurrency(data?.totalValue)}</b></span>}
          <Button size="sm" variant="outline" onClick={exportExcel} loading={isFetching}>
            <Download className="h-4 w-4" /> Export Excel
          </Button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : rows.length === 0 ? (
        <EmptyState title="Tidak ada data" description="Tidak ditemukan produk pada filter ini." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>SKU</TH>
              <TH>Produk</TH>
              <TH>Kategori</TH>
              <TH>Gudang</TH>
              <TH>Stok</TH>
              <TH>Harga Beli</TH>
              <TH>Nilai Stok</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((r) => (
              <TR key={r.id}>
                <TD className="font-mono text-xs">{r.sku}</TD>
                <TD>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.unit}</p>
                </TD>
                <TD>{r.category || '-'}</TD>
                <TD>{r.warehouse || '-'}</TD>
                <TD>
                  <Badge tone={r.current_stock <= 0 ? 'rose' : r.current_stock <= r.min_stock ? 'amber' : 'green'}>
                    {formatNumber(r.current_stock)}
                  </Badge>
                </TD>
                <TD>{formatCurrency(r.cost_price)}</TD>
                <TD className="font-semibold">{formatCurrency(r.stock_value)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </Card>
  );
}

const TYPES = ['stock_in', 'stock_out', 'purchase', 'receiving', 'transfer_out', 'transfer_in', 'adjustment', 'opname', 'sale'];

function MovementReportTab() {
  const { options: products } = useOptions('/products/all', { key: 'products' });
  const { options: warehouses } = useOptions('/warehouses/all', { key: 'warehouses' });
  const [filters, setFilters] = useState({ product_id: '', warehouse_id: '', type: '', start_date: '', end_date: '' });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['reports', 'movements', filters],
    queryFn: async () => {
      const res = await api.get('/reports/movements', {
        params: {
          product_id: filters.product_id || undefined,
          warehouse_id: filters.warehouse_id || undefined,
          type: filters.type || undefined,
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined,
        },
      });
      return res.data.data;
    },
  });

  const rows = data?.rows ?? [];

  const exportExcel = async () => {
    try {
      const res = await api.get('/reports/export/movements', {
        params: { start_date: filters.start_date || undefined, end_date: filters.end_date || undefined },
        responseType: 'blob',
      });
      downloadBlob(res.data, `pergerakan-stok-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700/50">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6 lg:gap-4">
          <Select label="Produk" value={filters.product_id} onChange={(e) => setFilters({ ...filters, product_id: e.target.value })}>
            <option value="">Semua produk</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
          <Select label="Gudang" value={filters.warehouse_id} onChange={(e) => setFilters({ ...filters, warehouse_id: e.target.value })}>
            <option value="">Semua gudang</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.code}</option>
            ))}
          </Select>
          <Select label="Tipe" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">Semua tipe</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </Select>
          <Input label="Tanggal Mulai" type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
          <Input label="Tanggal Selesai" type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
        </div>
        <Button size="sm" variant="outline" onClick={exportExcel} loading={isFetching}>
          <Download className="h-4 w-4" /> Export Excel
        </Button>
      </div>

      {!isLoading && (
        <div className="flex flex-wrap gap-4 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Total masuk: <b className="text-emerald-500">{formatNumber(data?.summary?.totalIn)}</b></span>
          <span>Total keluar: <b className="text-rose-500">{formatNumber(data?.summary?.totalOut)}</b></span>
          <span>Record: <b>{formatNumber(data?.summary?.count)}</b></span>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : rows.length === 0 ? (
        <EmptyState title="Tidak ada data" description="Tidak ditemukan pergerakan pada filter ini." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Tanggal</TH>
              <TH>Produk</TH>
              <TH>Gudang</TH>
              <TH>Tipe</TH>
              <TH>Perubahan</TH>
              <TH>Saldo</TH>
              <TH>Referensi</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((r) => (
              <TR key={r.id}>
                <TD className="whitespace-nowrap text-xs text-slate-500">{formatDateTime(r.created_at)}</TD>
                <TD>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{r.product?.name}</p>
                  <p className="text-xs text-slate-400">{r.product?.sku}</p>
                </TD>
                <TD>{r.warehouse?.code || '-'}</TD>
                <TD><Badge tone={r.qty_change > 0 ? 'green' : 'rose'}>{r.type.replace(/_/g, ' ')}</Badge></TD>
                <TD>
                  <span className={`font-semibold ${r.qty_change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {r.qty_change > 0 ? `+${r.qty_change}` : r.qty_change}
                  </span>
                </TD>
                <TD className="font-medium">{r.balance_after}</TD>
                <TD className="text-xs text-slate-400">{r.note || `${r.ref_type}:${r.ref_id}`}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </Card>
  );
}

const TABS = [
  { key: 'stock', label: 'Laporan Stok' },
  { key: 'movement', label: 'Pergerakan Stok' },
];

export default function ReportsPage() {
  const [tab, setTab] = useState('stock');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan"
        subtitle="Laporan stok dan pergerakan barang"
        actions={
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                  tab === t.key
                    ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      />
      {tab === 'stock' ? <StockReportTab /> : <MovementReportTab />}
    </div>
  );
}
