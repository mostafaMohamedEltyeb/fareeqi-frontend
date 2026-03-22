import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPlaygroundById, ratePlayground } from '../../api/playgrounds';
import { createBooking } from '../../api/bookings';
import type { PlaygroundDetailResponse, SlotResponse } from '../../types';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import StatusBadge from '../../components/shared/StatusBadge';
import toast from 'react-hot-toast';
import { MapPin, Star, ArrowLeft, ArrowRight } from 'lucide-react';


export default function PlaygroundDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playground, setPlayground] = useState<PlaygroundDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [bookingSlot, setBookingSlot] = useState<SlotResponse | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const isRTL = i18n.language === 'ar';
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (id) getPlaygroundById(Number(id)).then((r) => setPlayground(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleRate = async () => {
    if (!selectedRating || !id) return;
    setRatingLoading(true);
    try {
      await ratePlayground(Number(id), selectedRating);
      toast.success(i18n.language === 'ar' ? 'تم التقييم بنجاح!' : 'Rating submitted!');
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setRatingLoading(false); }
  };

  const handleBook = async () => {
    if (!bookingSlot || !playground) return;
    setBookingLoading(true);
    try {
      await createBooking({ slotId: bookingSlot.id, playgroundId: playground.id });
      toast.success(i18n.language === 'ar' ? 'تم الحجز بنجاح!' : 'Booking created!');
      setBookingSlot(null);
      navigate('/player/bookings');
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setBookingLoading(false); }
  };

  if (loading) return <LoadingSkeleton rows={8} />;
  if (!playground) return <div className="text-center text-gray-400 py-16">{t('noData')}</div>;

  const fmt = (dt: string) => new Date(dt).toLocaleString(isRTL ? 'ar-SA' : 'en-US', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <BackIcon size={16} />{t('back')}
      </button>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-8xl">
          {playground.sportType === 'FOOTBALL' ? '⚽' : '🎾'}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-800">{playground.name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${playground.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {playground.availability ? t('available') : t('notAvailable')}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-gray-400">{t('location')}</p><p className="font-medium flex items-center gap-1"><MapPin size={14} />{playground.location}</p></div>
            <div><p className="text-gray-400">{t('sportType')}</p><p className="font-medium">{playground.sportType}</p></div>
            <div><p className="text-gray-400">{t('pricePerHour')}</p><p className="font-bold text-green-700">{playground.pricePerHour} SAR</p></div>
            <div><p className="text-gray-400">{t('rating')}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} className={i < Math.round(playground.ratings || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />)}
                <span className="text-xs text-gray-500">{playground.ratings?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-1">{t('ratePlayground')}</h2>
        <p className="text-xs text-gray-400 mb-3">{isRTL ? 'يمكنك التقييم فقط بعد زيارة الملعب وتسجيل دخولك' : 'You can rate only after your visit is checked in'}</p>
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={28} className={`cursor-pointer transition-colors ${i < (hoverRating || selectedRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              onClick={() => setSelectedRating(i + 1)} onMouseEnter={() => setHoverRating(i + 1)} onMouseLeave={() => setHoverRating(0)} />
          ))}
          {selectedRating > 0 && (
            <button onClick={handleRate} disabled={ratingLoading} className="ms-4 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {ratingLoading ? t('loading') : t('save')}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">{t('myBookings')}</h2>
        {playground.slots.length === 0 ? <p className="text-gray-400 text-sm">{t('noData')}</p> : (
          <div className="space-y-2">
            {playground.slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="flex items-center gap-4 text-sm">
                  <StatusBadge status={slot.status} />
                  <span className="text-gray-600">{fmt(slot.startTime)} → {fmt(slot.endTime)}</span>
                  <span className="font-semibold text-green-700">{slot.pricePerHour} SAR</span>
                </div>
                {slot.status === 'AVAILABLE' && (
                  <button onClick={() => setBookingSlot(slot)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
                    {t('bookNow')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {bookingSlot && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-800 text-lg mb-3">{t('bookNow')}</h3>
            <p className="text-gray-600 text-sm mb-1">{playground.name}</p>
            <p className="text-gray-500 text-xs mb-4">{fmt(bookingSlot.startTime)} → {fmt(bookingSlot.endTime)}</p>
            <p className="font-bold text-green-700 text-lg mb-5">{bookingSlot.pricePerHour} SAR</p>
            <div className="flex gap-3">
              <button onClick={() => setBookingSlot(null)} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50">{t('cancel')}</button>
              <button onClick={handleBook} disabled={bookingLoading} className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {bookingLoading ? t('loading') : t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
