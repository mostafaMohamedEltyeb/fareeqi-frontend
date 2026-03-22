import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllBookings, updatePaymentStatus } from '../../api/bookings';
import type { BookingResponse } from '../../types';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function AllBookings() {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState<BookingResponse | null>(null);
  const [payStatus, setPayStatus] = useState('PAID');
  const [saving, setSaving] = useState(false);

  const fetch = () => { setLoading(true); getAllBookings().then((r) => setBookings(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const handleUpdatePayment = async () => {
    if (!payModal) return;
    setSaving(true);
    try { await updatePaymentStatus(payModal.id, { paymentStatus: payStatus }); toast.success(i18n.language === 'ar' ? 'تم التحديث' : 'Updated'); setPayModal(null); fetch(); }
    catch (err: any) { toast.error(err.displayMessage); }
    finally { setSaving(false); }
  };

  const fmt = (dt: string) => { try { return new Date(dt).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }); } catch { return dt; } };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t('allBookings')}</h1>
      {loading ? <LoadingSkeleton /> : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{[t('player'), t('playground'), t('slotTime'), t('status'), t('paymentStatus'), t('createdAt'), t('actions')].map((h) => (
                  <th key={h} className="px-4 py-3 text-start font-semibold text-gray-600">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{b.playerUsername}</td>
                    <td className="px-4 py-3 text-gray-600">{b.playgroundName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmt(b.slotStartTime)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status}/></td>
                    <td className="px-4 py-3"><StatusBadge status={b.paymentStatus}/></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmt(b.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setPayModal(b); setPayStatus(b.paymentStatus); }}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100">
                        {t('updatePayment')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {payModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-800 text-lg mb-4">{t('updatePayment')}</h3>
            <p className="text-sm text-gray-500 mb-3">{payModal.playgroundName} — {payModal.playerUsername}</p>
            <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white mb-4">
              <option value="PENDING">{t('pending')}</option>
              <option value="PAID">{t('paid')}</option>
              <option value="REFUNDED">{t('refunded')}</option>
            </select>
            <div className="flex gap-3">
              <button onClick={() => setPayModal(null)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">{t('cancel')}</button>
              <button onClick={handleUpdatePayment} disabled={saving} className="flex-1 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {saving ? t('loading') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
