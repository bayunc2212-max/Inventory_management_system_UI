import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { extractErrorMessage } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';

const GROUP_LABELS = {
  general: 'Umum',
  finance: 'Keuangan',
  barcode: 'Barcode & SKU',
  inventory: 'Inventori',
  backup: 'Backup',
  notification: 'Notifikasi',
};

function SettingField({ group, keyName, value, description, onChange }) {
  const isBool = value === '1' || value === '0';
  const isTime = keyName.includes('time') || keyName.includes('_time');
  const isNumber = keyName === 'tax_rate' || keyName === 'low_stock_threshold' || keyName === 'notification_expiry_days';
  const isCurrency = keyName === 'currency';
  const isLogo = keyName === 'company_logo';

  const label = (keyName.replace(/_/g, ' ') || '').replace(/\b\w/g, (c) => c.toUpperCase());

  if (isBool) {
    return (
      <div className="flex items-center justify-between gap-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
        <Switch checked={value === '1'} onChange={(v) => onChange(keyName, v ? '1' : '0')} />
      </div>
    );
  }

  return (
    <div className="space-y-1.5 py-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
        {group === 'finance' && keyName === 'tax_rate' && <span className="text-xs text-slate-400">{description}</span>}
      </div>
      {isCurrency ? (
        <Select value={value || 'IDR'} onChange={(e) => onChange(keyName, e.target.value)}>
          <option value="IDR">IDR - Rupiah</option>
          <option value="USD">USD - Dollar</option>
        </Select>
      ) : isTime ? (
        <Input type="time" value={value || ''} onChange={(e) => onChange(keyName, e.target.value)} />
      ) : isLogo ? (
        <Input value={value || ''} placeholder="/uploads/logo.png" onChange={(e) => onChange(keyName, e.target.value)} />
      ) : (
        <Input type={isNumber ? 'number' : 'text'} value={value ?? ''} onChange={(e) => onChange(keyName, e.target.value)} />
      )}
      {!isBool && !(group === 'finance' && keyName === 'tax_rate') && (
        <p className="text-xs text-slate-400">{description}</p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const queryClient = useQueryClient();
  const [values, setValues] = useState({});

  const { data: meta, isLoading } = useQuery({
    queryKey: ['settings-meta'],
    queryFn: async () => {
      const res = await api.get('/settings/meta');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (!meta) return;
    const next = {};
    Object.values(meta).forEach((group) => group.forEach((s) => (next[s.key] = s.value ?? '')));
    setValues((prev) => ({ ...prev, ...next }));
  }, [meta]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put('/settings', payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      useSettingsStore.getState().load().catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['settings-meta'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const onChange = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const canManage = hasPermission('settings:manage');

  return (
    <div>
      <PageHeader
        title="Pengaturan"
        subtitle="Konfigurasi aplikasi, perusahaan, dan sistem"
        actions={
          canManage && (
            <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate(values)}>
              Simpan Pengaturan
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
          {Object.entries(meta || {}).map(([group, fields]) => (
            <Card key={group}>
              <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700/50">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{GROUP_LABELS[group] || group}</h2>
              </div>
              <div className="divide-y divide-slate-100 px-5 dark:divide-slate-700/50">
                {fields.map((f) => (
                  <SettingField
                    key={f.key}
                    group={group}
                    keyName={f.key}
                    value={values[f.key]}
                    description={f.description}
                    onChange={canManage ? onChange : () => {}}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
