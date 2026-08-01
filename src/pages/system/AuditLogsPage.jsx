import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useDebounce } from '../../hooks/useDebounce';
import { Card } from '../../components/ui/Card';
import { Table, THead, TH, TBody, TR, TD } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select, Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { formatDateTime } from '../../utils/format';

const actionTone = {
  create: 'green',
  update: 'blue',
  delete: 'rose',
  login: 'slate',
  logout: 'slate',
};

function DetailCell({ before, after }) {
  const render = (raw) => {
    if (!raw) return null;
    try {
      const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const entries = Object.entries(obj).slice(0, 4);
      if (!entries.length) return null;
      return entries.map(([k, v]) => (
        <span key={k} className="mr-2 inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <b className="text-slate-600 dark:text-slate-300">{k}:</b> {String(v)}
        </span>
      ));
    } catch {
      return <span className="text-[11px] text-slate-400">{String(raw).slice(0, 60)}</span>;
    }
  };
  return (
    <div className="flex flex-wrap gap-1">
      {after ? render(after) : before ? render(before) : <span className="text-slate-300">-</span>}
    </div>
  );
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const { data: options } = useQuery({
    queryKey: ['audit-options'],
    queryFn: async () => {
      const res = await api.get('/audit-logs/options');
      return res.data.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', { search: debouncedSearch, action, entityType, startDate, endDate, page }],
    queryFn: async () => {
      const res = await api.get('/audit-logs', {
        params: {
          search: debouncedSearch || undefined,
          action: action || undefined,
          entity_type: entityType || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          page,
          limit: 15,
        },
      });
      return { rows: res.data.data, meta: res.data.meta };
    },
  });

  const rows = data?.rows ?? [];
  const meta = data?.meta;

  return (
    <div>
      <PageHeader title="Log Aktivitas" subtitle="Riwayat aktivitas semua pengguna" />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700/50">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari pengguna, aksi, entitas..." className="w-full max-w-xs" />
          <Select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className="w-36">
            <option value="">Semua aksi</option>
            {(options?.actions || []).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
          <Select value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1); }} className="w-44">
            <option value="">Semua entitas</option>
            {(options?.entityTypes || []).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
          <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="w-40" />
          <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="w-40" />
          <span className="ml-auto text-xs text-slate-400">{meta?.total ?? rows.length} record</span>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : rows.length === 0 ? (
          <EmptyState title="Tidak ada data" description="Tidak ditemukan log pada filter ini." />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Waktu</TH>
                <TH>Pengguna</TH>
                <TH>Aksi</TH>
                <TH>Entitas</TH>
                <TH>Detail</TH>
                <TH>IP</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  <TD className="whitespace-nowrap text-xs text-slate-500">{formatDateTime(row.created_at)}</TD>
                  <TD>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{row.user?.name || 'Sistem'}</p>
                    {row.user?.email && <p className="text-xs text-slate-400">{row.user.email}</p>}
                  </TD>
                  <TD><Badge tone={actionTone[row.action] || 'slate'}>{row.action}</Badge></TD>
                  <TD>
                    <span className="text-sm text-slate-600 dark:text-slate-300">{row.entity_type}</span>
                    {row.entity_id && <p className="text-xs text-slate-400">#{row.entity_id}</p>}
                  </TD>
                  <TD><DetailCell before={row.before_data} after={row.after_data} /></TD>
                  <TD className="font-mono text-xs text-slate-400">{row.ip_address || '-'}</TD>
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
