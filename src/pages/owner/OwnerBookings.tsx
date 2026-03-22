import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getOwnerBookings, approveBooking, rejectBooking } from '../../api/bookings';
import type { BookingResponse } from '../../types';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

export default function OwnerBookings() {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetch = () => { setLoading(true); getOwnerBookings().then((r) => setBookings(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      if (action === 'approve') await approveBooking(id);
      else await rejectBooking(id);
      toast.success(i18n.language === 'ar' ? (action === 'approve' ? 'تم القبول' : 'تم الرفض') : (action === 'approve' ? 'Approved' : 'Rejected'));
      fetch();
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setActionLoading(null); }
  };

  const fmt = (dt: string) => { try { return new Date(dt).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }); } catch { return dt; } };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t('bookingRequests')}</h1>
      {loading ? <LoadingSkeleton /> : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {bookings.length === 0 ? <p className="text-center text-gray-400 py-16">{t('noData')}</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{[t('player'), t('playground'), t('slotTime'), t('status'), t('paymentStatus'), t('actions')].map((h) => (
                    <th key={h} className="px-4 py-3 text-start font-semibold text-gray-600">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b) => (
                    <tr key={b.id} className={`hover:bg-gray-50/50 transition-colors ${b.status === 'PENDING' ? 'bg-orange-50/30' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-800">{b.playerUsername}</td>
                      <td className="px-4 py-3 text-gray-600">{b.playgroundName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmt(b.slotStartTime)} → {fmt(b.slotEndTime)}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status}/></td>
                      <td className="px-4 py-3"><StatusBadge status={b.paymentStatus}/></td>
                      <td className="px-4 py-3">
                        {b.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleAction(b.id, 'approve')} disabled={actionLoading === b.id}
                              className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 disabled:opacity-50">
                              <CheckCircle size={13}/>{t('approve')}
                            </button>
                            <button onClick={() => handleAction(b.id, 'reject')} disabled={actionLoading === b.id}
                              className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 disabled:opacity-50">
                              <XCircle size={13}/>{t('reject')}
                            </button>
                          </div>
                        )}
                      </td>
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
