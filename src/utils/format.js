import dayjs from 'dayjs';
import { useSettingsStore } from '../store/settingsStore';

export const formatDate = (date, fmt = 'DD MMM YYYY') =>
  date ? dayjs(date).format(fmt) : '-';

export const formatDateTime = (date, fmt = 'DD MMM YYYY HH:mm') =>
  date ? dayjs(date).format(fmt) : '-';

export const formatCurrency = (value) => {
  const currency = useSettingsStore.getState().get('currency', 'IDR');
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

export const formatNumber = (value) =>
  new Intl.NumberFormat('id-ID').format(Number(value) || 0);

export const toRelative = (date) => dayjs(date).fromNow();
