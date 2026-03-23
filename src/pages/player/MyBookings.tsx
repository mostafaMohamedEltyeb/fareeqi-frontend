import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../../api/bookings';
import type { BookingResponse } from '../../types';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ConfirmModal from '../../components/shared/ConfirmModal';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelBooking_, setCancelBooking_] = useState<BookingResponse | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetch = () => { setLoading(true); getMyBookings().then((r) => setBookings(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelId);
      toast.success(i18n.language === 'ar' ? 'تم الإلغاء' : 'Cancelled');
      setCancelId(null);
      setCancelBooking_(null);
      fetch();
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setCancelling(false); }
  };

  const fmt = (dt: string) => { try { return new Date(dt).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }); } catch { return dt; } };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t('myBookings')}</h1>
      {loading ? <LoadingSkeleton /> : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {bookings.length === 0 ? <p className="text-center text-gray-400 py-16">{t('noData')}</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{[t('playground'), t('slotTime'), t('status'), t('paymentStatus'), t('createdAt'), t('actions')].map((h) => (
                    <th key={h} className="px-4 py-3 text-start font-semibold text-gray-600">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 cursor-pointer hover:text-green-600" onClick={() => navigate(`/player/bookings/${b.id}`)}>{b.playgroundName}</td>
                      <td className="px-4 py-3 text-gray-500">{fmt(b.slotStartTime)} → {fmt(b.slotEndTime)}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3"><StatusBadge status={b.paymentStatus} /></td>
                      <td className="px-4 py-3 text-gray-500">{fmt(b.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                            <button onClick={() => { setCancelId(b.id); setCancelBooking_(b); }} className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">{t('cancel')}</button>
                          )}
                          {b.status === 'APPROVED' && b.paymentStatus !== 'PAID' && (
                            <button onClick={() => navigate(`/player/pay/${b.id}`)} className="px-2 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">{t('payNow')}</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <ConfirmModal
        open={!!cancelId}
        message={
          cancelBooking_?.status === 'APPROVED' && cancelBooking_?.paymentStatus === 'PAID'
            ? (i18n.language === 'ar'
                ? `هذا الحجز مقبول ومدفوع. سيتم خصم رسوم إلغاء (20% من سعر الحجز) وتحديد حالة الدفع كـ "مسترد". هل تريد المتابعة؟`
                : `This booking is approved and paid. A cancellation fee of 20% will be charged and payment marked as Refunded. Continue?`)
            : cancelBooking_?.paymentStatus === 'PAID'
            ? (i18n.language === 'ar'
                ? 'هذا الحجز مدفوع. سيتم وضع علامة "مسترد" على الدفع عند الإلغاء. هل تريد المتابعة؟'
                : 'This booking is paid. The payment will be marked as Refunded upon cancellation. Continue?')
            : t('confirmDelete')
        }
        onConfirm={handleCancel}
        onCancel={() => { setCancelId(null); setCancelBooking_(null); }}
        loading={cancelling}
      />
    </div>
  );
}
