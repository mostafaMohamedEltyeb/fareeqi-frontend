import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPlaygroundById, ratePlayground } from '../../api/playgrounds';
import { fmtDateTime, fmtTime, fmtDayLabel } from '../../utils/date';
import { createBooking } from '../../api/bookings';
import { getAllTeams } from '../../api/teams';
import type { PlaygroundDetailResponse, SlotResponse, TeamResponse } from '../../types';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import StatusBadge from '../../components/shared/StatusBadge';
import toast from 'react-hot-toast';
import { MapPin, Star, ArrowLeft, ArrowRight, Users, Clock, Sparkles, Info } from 'lucide-react';

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
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');
  const isRTL = i18n.language === 'ar';
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (id) getPlaygroundById(Number(id)).then((r) => setPlayground(r.data)).finally(() => setLoading(false));
    getAllTeams().then(r => setTeams(r.data)).catch(() => {});
  }, [id]);

  const handleRate = async () => {
    if (!selectedRating || !id) return;
    setRatingLoading(true);
    try {
      await ratePlayground(Number(id), selectedRating);
      toast.success(isRTL ? 'تم التقييم بنجاح!' : 'Rating submitted!');
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setRatingLoading(false); }
  };

  const handleBook = async () => {
    if (!bookingSlot || !playground) return;
    setBookingLoading(true);
    try {
      await createBooking({ slotId: bookingSlot.id, playgroundId: playground.id, teamId: selectedTeamId || undefined });
      toast.success(isRTL ? 'تم الحجز! انتظر موافقة المالك' : 'Booked! Waiting for owner approval');
      setBookingSlot(null);
      setSelectedTeamId('');
      // Refresh slots to update participant count
      getPlaygroundById(Number(id)).then(r => setPlayground(r.data)).catch(() => {});
      navigate('/player/bookings');
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setBookingLoading(false); }
  };

  if (loading) return <LoadingSkeleton rows={8} />;
  if (!playground) return <div className="text-center text-gray-400 py-16">{t('noData')}</div>;

  const fmt = fmtDateTime;

  const availableSlots = playground.slots.filter(s => s.status === 'AVAILABLE' && s.availableSpots > 0);
  const reservedSlots = playground.slots.filter(s => s.status === 'RESERVED' || s.availableSpots === 0);
  const disabledSlots = playground.slots.filter(s => s.status === 'DISABLED');

  return (
    <div className="space-y-6 max-w-4xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <BackIcon size={16} />{t('back')}
      </button>

      {/* Playground header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {playground.imageUrls?.length > 0 ? (
          <div className="h-48 flex gap-1 overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <img src={playground.imageUrls[0]} alt={playground.name} className="w-full h-full object-cover" />
            </div>
            {playground.imageUrls.length > 1 && (
              <div className="w-24 flex flex-col gap-1 overflow-hidden">
                {playground.imageUrls.slice(1, 3).map((url, i) => (
                  <div key={url} className="relative flex-1 overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 1 && playground.imageUrls.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-bold">+{playground.imageUrls.length - 3}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-8xl">
            {playground.sportType === 'FOOTBALL' ? '⚽' : '🎾'}
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-800">{playground.name}</h1>
              {playground.featured && (
                <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
                  <Sparkles size={12} />{t('featuredBadge')}
                </span>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${playground.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {playground.availability ? t('available') : t('notAvailable')}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-gray-400">{t('location')}</p><p className="font-medium flex items-center gap-1"><MapPin size={14} />{playground.location}</p></div>
            <div><p className="text-gray-400">{t('sportType')}</p><p className="font-medium">{playground.sportType}</p></div>
            <div><p className="text-gray-400">{t('pricePerHour')}</p><p className="font-bold text-green-700">{playground.pricePerHour} EGP</p></div>
            <div><p className="text-gray-400">{t('rating')}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} className={i < Math.round(playground.ratings || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />)}
                <span className="text-xs text-gray-500">{playground.ratings?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How booking works — info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-700">
        <Info size={18} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">{isRTL ? 'كيف يعمل الحجز؟' : 'How does booking work?'}</p>
          <p>{t('groupBookingHint')}</p>
          <p className="mt-1">{t('bookingPending')}</p>
        </div>
      </div>

      {/* Time Slots */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">{isRTL ? 'الفتحات الزمنية المتاحة' : 'Available Time Slots'}</h2>

        {playground.slots.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">{t('noData')}</div>
        )}

        {availableSlots.map((slot) => {
          const fillPct = slot.capacity > 0 ? (slot.currentParticipants / slot.capacity) * 100 : 0;
          const isGroupSlot = slot.capacity > 1;
          return (
            <div key={slot.id} className="bg-white rounded-xl border border-green-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Time */}
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <Clock size={16} className="text-green-600" />
                    <span>{fmtDate(slot.startTime)}</span>
                    <span className="text-gray-400">·</span>
                    <span>{fmtTime(slot.startTime)} → {fmtTime(slot.endTime)}</span>
                  </div>

                  {/* Group booking info */}
                  {isGroupSlot && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Users size={12} />{slot.currentParticipants} / {slot.capacity} {isRTL ? 'مقعد' : 'spots'}</span>
                        <span className="text-green-600 font-medium">{slot.availableSpots} {isRTL ? 'متاح' : 'available'}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${fillPct}%` }} />
                      </div>
                      {slot.participantUsernames.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Users size={11} />
                          <span className="font-medium">{t('whoIsJoining')}:</span>
                          <div className="flex gap-1 flex-wrap">
                            {slot.participantUsernames.map(u => (
                              <span key={u} className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium">{u}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {slot.participantUsernames.length === 0 && (
                        <p className="text-xs text-gray-400 italic">{t('noPlayersYet')}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-green-700 font-bold text-lg">{slot.pricePerHour} <span className="text-sm font-normal text-gray-500">EGP{isGroupSlot ? `/${isRTL ? 'مقعد' : 'spot'}` : ''}</span></p>
                  <button onClick={() => setBookingSlot(slot)}
                    className="px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                    {t('joinSlot')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Full slots */}
        {reservedSlots.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{isRTL ? 'محجوزة بالكامل' : 'Fully Booked'}</p>
            {reservedSlots.map(slot => (
              <div key={slot.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4 opacity-70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock size={14} />
                    <span>{fmtDate(slot.startTime)} · {fmtTime(slot.startTime)} → {fmtTime(slot.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{slot.currentParticipants}/{slot.capacity} {isRTL ? 'مقعد' : 'spots'}</span>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{t('fullyBooked')}</span>
                  </div>
                </div>
                {slot.participantUsernames.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                    <Users size={11} />
                    {slot.participantUsernames.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Disabled slots */}
        {disabledSlots.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{isRTL ? 'غير متاحة' : 'Not Available'}</p>
            {disabledSlots.map(slot => (
              <div key={slot.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4 opacity-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Clock size={14} /><span>{fmtDate(slot.startTime)} · {fmtTime(slot.startTime)} → {fmtTime(slot.endTime)}</span>
                  </div>
                  <StatusBadge status="DISABLED" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rate playground */}
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

      {/* Booking confirmation modal */}
      {bookingSlot && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{t('joinSlot')}</h3>
              <p className="text-gray-500 text-sm mt-1">{playground.name}</p>
            </div>

            {/* Slot summary */}
            <div className="bg-green-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Clock size={14} className="text-green-600" />
                <span>{fmt(bookingSlot.startTime)} → {fmtTime(bookingSlot.endTime)}</span>
              </div>
              {bookingSlot.capacity > 1 && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Users size={14} className="text-green-600" />
                  <span>{bookingSlot.availableSpots} {isRTL ? 'مقعد متبقٍ من' : 'spot(s) left of'} {bookingSlot.capacity}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-bold text-green-700 pt-1 border-t border-green-100">
                <span>{t('amount')}</span>
                <span>{bookingSlot.pricePerHour} EGP</span>
              </div>
            </div>

            {/* Approval notice */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 flex gap-2">
              <span className="text-base">⏳</span>
              <span>{isRTL ? 'سيراجع مالك الملعب طلبك ويوافق عليه. ستتلقى إشعاراً عند القبول.' : 'The field owner will review and approve your request. You\'ll get notified when confirmed.'}</span>
            </div>

            {/* Team selector */}
            {teams.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('teamOptional')}</label>
                <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  <option value="">{isRTL ? 'بدون فريق' : 'No team'}</option>
                  {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={() => { setBookingSlot(null); setSelectedTeamId(''); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">{t('cancel')}</button>
              <button onClick={handleBook} disabled={bookingLoading} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
                {bookingLoading ? t('loading') : t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
