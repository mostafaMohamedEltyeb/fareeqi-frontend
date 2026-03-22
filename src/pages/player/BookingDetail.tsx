import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getBookingById } from '../../api/bookings';
import type { BookingResponse } from '../../types';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import { ArrowLeft, ArrowRight, Copy, Check } from 'lucide-react';


export default function BookingDetail() {
  const { t, i18n } = useTranslation();
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const isRTL = i18n.language === 'ar';
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (bookingId) getBookingById(Number(bookingId)).then((r) => setBooking(r.data)).finally(() => setLoading(false));
  }, [bookingId]);

  const fmt = (dt: string) => { try { return new Date(dt).toLocaleString(isRTL ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }); } catch { return dt; } };
  const copy = () => { if (booking) { navigator.clipboard.writeText(booking.qrCode); setCopied(true); setTimeout(() => setCopied(false), 2000); } };

  if (loading) return <LoadingSkeleton rows={6} />;
  if (!booking) return <div className="text-center text-gray-400 py-16">{t('noData')}</div>;

  const rows = [
    [t('playground'), booking.playgroundName],
    [t('startTime'), fmt(booking.slotStartTime)],
    [t('endTime'), fmt(booking.slotEndTime)],
    [t('createdAt'), fmt(booking.createdAt)],
    [t('player'), booking.playerUsername],
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"><BackIcon size={16} />{t('back')}</button>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-800">{t('bookingDetails')} #{booking.id}</h1>
          <div className="flex gap-2"><StatusBadge status={booking.status} /><StatusBadge status={booking.paymentStatus} /></div>
        </div>
        <dl className="space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
              <dt className="text-gray-500 text-sm">{label}</dt>
              <dd className="text-gray-800 font-medium text-sm">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5">
          <p className="text-gray-500 text-sm mb-2">{t('qrCode')}</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
            <code className="font-mono text-xs text-gray-700 flex-1 break-all">{booking.qrCode}</code>
            <button onClick={copy} className="p-1.5 text-gray-400 hover:text-green-600 flex-shrink-0">
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            </button>
          </div>
        </div>
        {booking.status === 'APPROVED' && booking.paymentStatus !== 'PAID' && (
          <button onClick={() => navigate(`/player/pay/${booking.id}`)} className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors">
            {t('payNow')}
          </button>
        )}
      </div>
    </div>
  );
}
