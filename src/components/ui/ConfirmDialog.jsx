import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Konfirmasi', message, confirmText = 'Ya, lanjutkan', tone = 'danger', loading = false, children }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      hideClose={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={
            tone === 'danger'
              ? 'rounded-full bg-rose-100 p-2.5 text-rose-600 dark:bg-rose-500/15'
              : 'rounded-full bg-amber-100 p-2.5 text-amber-600 dark:bg-amber-500/15'
          }
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
          {children}
        </div>
      </div>
    </Modal>
  );
}
