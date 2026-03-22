import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

interface Props { open: boolean; message: string; onConfirm: () => void; onCancel: () => void; loading?: boolean; }

export default function ConfirmModal({ open, message, onConfirm, onCancel, loading }: Props) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <p className="text-gray-800 font-medium">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50">{t('cancel')}</button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50">
            {loading ? t('loading') : t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
