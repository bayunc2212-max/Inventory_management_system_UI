import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function CreateModal({ open, onClose, title, subtitle, schema, defaultValues = {}, onSubmit, onSuccess, size = 'lg', submitText = 'Simpan', children }) {
  const form = useForm({ resolver: zodResolver(schema), defaultValues });
  const { reset, handleSubmit, register, watch, setValue, formState, clearErrors } = form;

  const close = () => {
    if (formState.isSubmitting) return;
    reset(defaultValues);
    clearErrors();
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    try {
      const data = await onSubmit(values);
      onSuccess?.(data);
      reset(defaultValues);
      clearErrors();
      onClose();
    } catch {
      /* toast ditangani pemanggil */
    }
  });

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      subtitle={subtitle}
      size={size}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={formState.isSubmitting}>
            Batal
          </Button>
          <Button onClick={submit} loading={formState.isSubmitting}>
            {submitText}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {children({ register, errors: formState.errors, watch, setValue })}
      </form>
    </Modal>
  );
}
