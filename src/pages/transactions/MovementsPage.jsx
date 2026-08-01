import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useOptions } from '../../hooks/useOptions';
import { Card } from '../../components/ui/Card';
import { Table, THead, TH, TBody, TR, TD } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/Badge';
import { Select, Input } from '../../components/ui/Input';
import { formatDateTime } from '../../utils/format';

const TYPES = ['stock_in', 'stock_out', 'purchase', 'receiving', 'transfer_out', 'transfer_in', 'adjustment', 'opname', 'sale'];

export default function MovementsPage() {
  const { options: products } = useOptions('/products/all', { key: 'products' });
  const [filters, setFilters] = useState({ product_id: '', type: '', start_date: '', end_date: '' });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['movements', filters, page],
    queryFn: async () => {
      const params = {
        product_id: filters.product_id || undefined,
        type: filters.type || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        page,
        limit: 15,
      };
      const res = await api.get('/movements', { params });
      return { rows: res.data.data, meta: res.data.meta };
    },
  });

  const rows = data?.rows ?? [];
  const meta = data?.meta;

  return (
    <div>
      <PageHeader title="Riwayat Pergerakan Stok" subtitle="Semua transaksi masuk dan keluar stok" />

      <Card>
        <div className="grid grid-cols-2 gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700/50 lg:grid-cols-5">
          <Select value={filters.product_id} onChange={(e) => { setFilters({ ...filters, product_id: e.target.value }); setPage(1); }}>
            <option value="">Semua produk</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Select value={filters.type} onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}>
            <option value="">Semua tipe</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
          <Input type="date" value={filters.start_date} onChange={(e) => { setFilters({ ...filters, start_date: e.target.value }); setPage(1); }} />
          <Input type="date" value={filters.end_date} onChange={(e) => { setFilters({ ...filters, end_date: e.target.value }); setPage(1); }} />
          <span className="hidden text-xs text-slate-400 lg:block lg:self-center">Total {meta?.total ?? rows.length} record</span>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : rows.length === 0 ? (
          <EmptyState title="Tidak ada data" description="Tidak ditemukan pergerakan stok pada filter ini." />
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
              {rows.map((row) => (
                <TR key={row.id}>
                  <TD className="whitespace-nowrap text-xs text-slate-500">{formatDateTime(row.created_at)}</TD>
                  <TD>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{row.product?.name}</p>
                    <p className="text-xs text-slate-400">{row.product?.sku}</p>
                  </TD>
                  <TD>{row.warehouse?.code || '-'}</TD>
                  <TD><StatusBadge status={row.type} /></TD>
                  <TD>
                    <span className={`font-semibold ${row.qty_change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {row.qty_change > 0 ? `+${row.qty_change}` : row.qty_change}
                    </span>
                  </TD>
                  <TD className="font-medium">{row.balance_after}</TD>
                  <TD className="text-xs text-slate-400">{row.note || `${row.ref_type}:${row.ref_id}`}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="border-t border-slate-100 dark:border-slate-700/50">
            <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} pageSize={meta.limit} onChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}
