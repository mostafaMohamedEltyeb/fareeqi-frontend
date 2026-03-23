import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMyPayments } from '../../api/payments';
import { getPlayerFinance } from '../../api/finance';
import type { PaymentResponse, FinanceSummaryResponse } from '../../types';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import { TrendingUp, CreditCard, BarChart2 } from 'lucide-react';

export default function MyPayments() {
  const { t, i18n } = useTranslation();
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [finance, setFinance] = useState<FinanceSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyPayments().then(r => setPayments(r.data)),
      getPlayerFinance().then(r => setFinance(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const fmt = (dt: string | null) => {
    if (!dt) return '—';
    try { return new Date(dt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US'); } catch { return dt; }
  };

  const fmtMoney = (n?: number) =>
    n != null ? `EGP ${Number(n).toLocaleString('en-EG', { minimumFractionDigits: 2 })}` : 'EGP 0.00';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t('myPayments')}</h1>

      {/* Spending summary */}
      {!loading && finance && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: t('totalSpent'), value: fmtMoney(finance.totalRevenue), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
            { title: t('completedPayments'), value: String(finance.totalPaidBookings), icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
            { title: t('avgPerBooking'), value: fmtMoney(finance.averageBookingAmount), icon: BarChart2, color: 'text-purple-600 bg-purple-50' },
          ].map(({ title, value, icon: Icon, color }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{title}</p>
                <p className="text-lg font-bold text-gray-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

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
                      <td className="px-4 py-3 font-bold text-green-700">{p.amount} EGP</td>
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
