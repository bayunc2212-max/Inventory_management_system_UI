import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';
import api, { extractErrorMessage } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useDebounce } from '../../hooks/useDebounce';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Table, THead, TH, TBody, TR, TD } from '../ui/Table';
import { Pagination } from '../ui/Pagination';
import { SearchInput } from '../ui/SearchInput';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Textarea } from '../ui/Input';
import { EmptyState } from '../ui/EmptyState';
import { TableSkeleton } from '../ui/Skeleton';
import { PageHeader } from '../ui/PageHeader';
import { StatusBadge } from '../ui/Badge';

export function TransactionList({
  title,
  subtitle,
  queryKey,
  endpoint,
  columns,
  actions = [],
  detail,
  createButton,
  statusOptions,
  searchPlaceholder = 'Cari...',
}) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);
  const [detailId, setDetailId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, { search: debouncedSearch, status, page }],
    queryFn: async () => {
      const params = { search: debouncedSearch || undefined, status: status || undefined, page, limit: 10 };
      const res = await api.get(endpoint, { params });
      return { rows: res.data.data, meta: res.data.meta };
    },
  });

  const rows = data?.rows ?? [];
  const meta = data?.meta;

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: [queryKey, 'detail', detailId],
    queryFn: async () => {
      if (!detailId) return null;
      const res = await api.get(`${endpoint}/${detailId}`);
      return res.data.data;
    },
    enabled: !!detailId,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ row, action }) => {
      const payload = action.requireNote ? { notes: rejectNote } : {};
      const { data } = await api.post(`${endpoint}/${row.id}/${action.key}`, payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setPendingAction(null);
      setRejectNote('');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const runAction = (row, action) => {
    if (action.confirm || action.requireNote) {
      setPendingAction({ row, action });
    } else {
      actionMutation.mutate({ row, action });
    }
  };

  const visibleActions = (row) =>
    actions.filter((a) => (!a.from || a.from.includes(row.status)) && hasPermission(a.perm));

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={createButton}
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700/50">
          <SearchInput value={search} onChange={setSearch} placeholder={searchPlaceholder} className="w-full max-w-sm" />
          <div className="flex items-center gap-2">
            {statusOptions && (
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="input-base w-44 cursor-pointer appearance-none py-2 text-xs"
              >
                <option value="">Semua status</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            )}
            <span className="hidden text-xs text-slate-400 sm:block">{meta?.total ?? rows.length} data</span>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} cols={columns.length + 2} />
        ) : rows.length === 0 ? (
          <EmptyState title="Tidak ada data" description={`Belum ada transaksi ${title.toLowerCase()}.`} />
        ) : (
          <Table>
            <THead>
              <TR>
                {columns.map((col) => (
                  <TH key={col.key || col.header}>{col.header}</TH>
                ))}
                <TH className="text-right">Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  {columns.map((col) => (
                    <TD key={col.key || col.header} className={col.className}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TD>
                  ))}
                  <TD className="text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      {detail && (
                        <button
                          onClick={() => setDetailId(row.id)}
                          title="Detail"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-sky-50 hover:text-sky-500 dark:hover:bg-sky-500/10"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {visibleActions(row).map((a) => (
                        <Button key={a.key} size="sm" variant={a.variant || 'secondary'} onClick={() => runAction(row, a)}>
                          {a.label}
                        </Button>
                      ))}
                    </div>
                  </TD>
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

      {detail && (
        <Modal
          open={!!detailId}
          onClose={() => setDetailId(null)}
          size="xl"
          title={detail.title}
          subtitle={detailData ? `${detailData.po_number || detailData.gr_number || detailData.ins_number || detailData.out_number || detailData.transfer_number || detailData.adjustment_number || detailData.opname_number || ''}` : 'Memuat...'}
          footer={
            detailData && visibleActions(detailData).length > 0 ? (
              <div className="flex flex-wrap justify-end gap-2">
                {visibleActions(detailData).map((a) => (
                  <Button key={a.key} variant={a.variant || 'secondary'} loading={actionMutation.isPending} onClick={() => runAction(detailData, a)}>
                    {a.label}
                  </Button>
                ))}
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setDetailId(null)}>
                Tutup
              </Button>
            )
          }
        >
          {detailLoading ? (
            <TableSkeleton rows={4} cols={4} />
          ) : detailData ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {detail.headerFields.map((f) => (
                    <div key={f.label}>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{f.label}</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {f.render ? f.render(detailData) : f.value}
                      </p>
                    </div>
                  ))}
                </div>
                {detail.itemColumns.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{detail.itemsLabel || 'Item'}</p>
                    <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <Table>
                        <THead>
                          <TR>
                            {detail.itemColumns.map((col) => (
                              <TH key={col.key || col.header}>{col.header}</TH>
                            ))}
                          </TR>
                        </THead>
                        <TBody>
                          {(detailData.items || []).map((it, idx) => (
                            <TR key={it.id || idx}>
                              {detail.itemColumns.map((col) => (
                                <TD key={col.key || col.header}>
                                  {col.render ? col.render(it) : it[col.key]}
                                </TD>
                              ))}
                            </TR>
                          ))}
                        </TBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
          ) : null}
        </Modal>
      )}

      <ConfirmDialog
        open={!!pendingAction}
        onClose={() => {
          setPendingAction(null);
          setRejectNote('');
        }}
        onConfirm={() => actionMutation.mutate({ row: pendingAction.row, action: pendingAction.action })}
        title={pendingAction?.action?.confirmTitle || 'Konfirmasi tindakan'}
        message={pendingAction?.action?.confirm}
        confirmText={pendingAction?.action?.confirmText || pendingAction?.action?.label}
        loading={actionMutation.isPending}
      >
        {pendingAction?.action?.requireNote && (
          <div className="mt-4">
            <Textarea
              label="Catatan"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Tuliskan alasan penolakan..."
            />
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}

export { StatusBadge };
