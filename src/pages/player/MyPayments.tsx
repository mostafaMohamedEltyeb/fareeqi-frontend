import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMyPayments } from '../../api/payments';
import type { PaymentResponse } from '../../types';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';

export default function MyPayments() {
  const { t, i18n } = useTranslation();
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getMyPayments().then((r) => setPayments(r.data)).finally(() => setLoading(false)); }, []);
  const fmt = (dt: string | null) => { if (!dt) return '—'; try { return new Date(dt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US'); } catch { return dt; } };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t('myPayments')}</h1>
      {loading ? <LoadingSkeleton /> : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {payments.length === 0 ? <p className="text-center text-gray-400 py-16">{t('noData')}</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{[t('playground'), t('amount'), t('referenceNumber'), t('status'), t('createdAt'), t('paidAt')].map((h) => (
                    <th key={h} className="px-4 py-3 text-start font-semibold text-gray-600">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-800">{p.playgroundName}</td>
                      <td className="px-4 py-3 font-bold text-green-700">{p.amount} SAR</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.referenceNumber}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{fmt(p.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-500">{fmt(p.paidAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
