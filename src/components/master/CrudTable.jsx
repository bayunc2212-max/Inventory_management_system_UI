import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
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
import { Input, Textarea, Select } from '../ui/Input';
import { Label } from '../ui/Label';
import { Switch } from '../ui/Switch';
import { EmptyState } from '../ui/EmptyState';
import { TableSkeleton } from '../ui/Skeleton';
import { PageHeader } from '../ui/PageHeader';

function FieldControl({ field, register, errors, options }) {
  const err = errors[field.name]?.message;
  const common = { ...register(field.name), label: field.label, error: err, placeholder: field.placeholder };

  switch (field.type) {
    case 'textarea':
      return <Textarea rows={field.rows || 3} {...common} />;
    case 'select':
      return (
        <Select {...common}>
          <option value="">{field.placeholder || 'Pilih...'}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      );
    case 'switch':
      return (
        <div className="space-y-1.5">
          <Label>{field.label}</Label>
          <div className="flex items-center gap-3">
            <Switch checked={!!options.watch(field.name)} onChange={(v) => options.setValue(field.name, v)} />
            <span className="text-xs text-slate-400">{options.watch(field.name) ? 'Aktif' : 'Nonaktif'}</span>
          </div>
        </div>
      );
    case 'number':
      return <Input type="number" step="any" {...common} />;
    default:
      return <Input type={field.type || 'text'} {...common} />;
  }
}

export function CrudTable({
  title,
  subtitle,
  queryKey,
  endpoint,
  columns,
  fields,
  schema,
  searchPlaceholder = 'Cari...',
  canCreate = false,
  canEdit = false,
  canDelete = false,
  pageSize = 10,
  transformSubmit,
  rowKey = 'id',
}) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, { search: debouncedSearch, page, pageSize }],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;
      const res = await api.get(endpoint, { params });
      return { rows: res.data.data, meta: res.data.meta };
    },
  });

  const items = data?.rows ?? [];
  const meta = data?.meta;

  const defaultValues = useMemo(() => {
    const base = {};
    fields.forEach((f) => {
      base[f.name] =
        editing && editing[f.name] !== undefined && editing[f.name] !== null
          ? editing[f.name]
          : f.type === 'switch'
            ? true
            : f.type === 'number'
              ? ''
              : '';
    });
    return base;
  }, [fields, editing]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const { reset, watch, setValue, handleSubmit, register, formState } = form;

  const submitMutation = useMutation({
    mutationFn: async (values) => {
      const payload = transformSubmit ? transformSubmit(values, editing) : values;
      if (editing) {
        const { data } = await api.put(`${endpoint}/${editing[rowKey]}`, payload);
        return data;
      }
      const { data } = await api.post(endpoint, payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setModalOpen(false);
      setEditing(null);
      reset();
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete(`${endpoint}/${deleteTarget[rowKey]}`);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const openCreate = () => {
    setEditing(null);
    reset(defaultValues);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    const values = {};
    fields.forEach((f) => {
      values[f.name] = row[f.name] ?? (f.type === 'switch' ? true : '');
    });
    reset(values);
    setModalOpen(true);
  };

  const onSubmit = (values) => submitMutation.mutate(values);

  const active = (perm) => hasPermission(perm);

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          canCreate &&
          active(canCreate) && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Tambah {title}
            </Button>
          )
        }
      />

      <Card>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700/50">
          <SearchInput value={search} onChange={setSearch} placeholder={searchPlaceholder} className="w-full max-w-sm" />
          <span className="hidden text-xs text-slate-400 sm:block">{meta?.total ?? items.length} data</span>
        </div>

        {isLoading ? (
          <TableSkeleton rows={pageSize > 6 ? 6 : pageSize} cols={columns.length} />
        ) : items.length === 0 ? (
          <EmptyState
            title={search ? 'Tidak ada hasil' : 'Belum ada data'}
            description={search ? `Tidak ditemukan data untuk "${search}"` : `Buat ${title.toLowerCase()} baru untuk memulai.`}
            action={!search && canCreate && active(canCreate) ? openCreate : undefined}
            actionText={`Tambah ${title}`}
          />
        ) : (
          <Table>
            <THead>
              <TR>
                {columns.map((col) => (
                  <TH key={col.key || col.header}>{col.header}</TH>
                ))}
                {(canEdit || canDelete) && <TH className="text-right">Aksi</TH>}
              </TR>
            </THead>
            <TBody>
              {items.map((row) => (
                <TR key={row[rowKey]}>
                  {columns.map((col) => (
                    <TD key={col.key || col.header} className={col.className}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TD>
                  ))}
                  {(canEdit || canDelete) && (
                    <TD className="text-right">
                      <div className="inline-flex items-center gap-1">
                        {canEdit && active(canEdit) && (
                          <button
                            onClick={() => openEdit(row)}
                            title="Edit"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-sky-50 hover:text-sky-500 dark:hover:bg-sky-500/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && active(canDelete) && (
                          <button
                            onClick={() => setDeleteTarget(row)}
                            title="Hapus"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </TD>
                  )}
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

      <Modal
        open={modalOpen}
        onClose={() => {
          if (!submitMutation.isPending) {
            setModalOpen(false);
            setEditing(null);
          }
        }}
        title={editing ? `Edit ${title}` : `Tambah ${title}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={submitMutation.isPending}>
              Batal
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={submitMutation.isPending}>
              {editing ? 'Simpan Perubahan' : `Tambah ${title}`}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
              <FieldControl field={field} register={register} errors={formState.errors} options={{ watch, setValue }} />
            </div>
          ))}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate()}
        title="Hapus data?"
        message={`Data "${deleteTarget?.name || deleteTarget?.company_name || deleteTarget?.code || ''}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
