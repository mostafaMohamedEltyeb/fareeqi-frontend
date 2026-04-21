import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getRecommendations } from '../../api/recommendations';
import type { PlaygroundResponse, OpenGroupSlotInfo, SportType } from '../../types';
import { fmtDate, fmtTime } from '../../utils/date';
import { MapPin, Star, Clock, Users, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

type SportCard = { type: SportType; emoji: string; labelKey: string; color: string; bg: string };

const SPORTS: SportCard[] = [
  { type: 'FOOTBALL', emoji: '⚽', labelKey: 'football', color: 'text-green-700', bg: 'bg-green-50 border-green-200 hover:border-green-500' },
  { type: 'PADEL',    emoji: '🎾', labelKey: 'padel',    color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200 hover:border-blue-500'   },
];

export default function DiscoverPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  const [selected, setSelected] = useState<SportType | null>(null);
  const [loading, setLoading] = useState(false);
  const [playgrounds, setPlaygrounds] = useState<PlaygroundResponse[]>([]);
  const [sessions, setSessions] = useState<OpenGroupSlotInfo[]>([]);

  const handleSportSelect = async (sport: SportType) => {
    setSelected(sport);
    setLoading(true);
    setPlaygrounds([]);
    setSessions([]);
    try {
      const r = await getRecommendations(sport);
      setPlaygrounds(r.data.recommendedPlaygrounds);
      setSessions(r.data.openGroupSlots);
    } catch {
      toast.error(isRTL ? 'فشل تحميل التوصيات' : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{t('discoverTitle')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('discoverSubtitle')}</p>
      </div>

      {/* Sport type selector */}
      <div className="grid grid-cols-2 gap-4">
        {SPORTS.map((s) => (
          <button
            key={s.type}
            onClick={() => handleSportSelect(s.type)}
            className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 transition-all duration-200 cursor-pointer
              ${s.bg}
              ${selected === s.type ? 'ring-2 ring-offset-2 ring-green-500 scale-[1.02] shadow-md' : 'shadow-sm'}`}
          >
            {selected === s.type && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              </span>
            )}
            <span className="text-5xl">{s.emoji}</span>
            <span className={`text-lg font-bold ${s.color}`}>{t(s.labelKey)}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* No sport selected yet */}
      {!selected && !loading && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏟️</p>
          <p className="font-medium">{t('selectSport')}</p>
        </div>
      )}

      {/* Results */}
      {selected && !loading && (
        <div className="space-y-10">

          {/* ── Recommended Playgrounds ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4">{t('topPlaygrounds')}</h2>
            {playgrounds.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-10 text-center text-gray-400">
                {t('noRecommendations')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {playgrounds.map((pg) => (
                  <PlaygroundCard key={pg.id} pg={pg} t={t} isRTL={isRTL} ArrowIcon={ArrowIcon}
                    onView={() => navigate(`/player/playgrounds/${pg.id}`)} />
                ))}
              </div>
            )}
          </section>

          {/* ── Open Group Sessions ── */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-800">{t('openGroupSessions')}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{t('openGroupSubtitle')}</p>
            </div>
            {sessions.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-10 text-center text-gray-400">
                <p className="font-medium">{t('noOpenSessions')}</p>
                <p className="text-sm mt-1">{t('noOpenSessionsHint')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sessions.map((slot) => (
                  <SessionCard key={slot.slotId} slot={slot} t={t} isRTL={isRTL}
                    onJoin={() => navigate(`/player/playgrounds/${slot.playgroundId}`)} />
                ))}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
}

/* ── Playground card ────────────────────────────── */
function PlaygroundCard({ pg, t, isRTL, ArrowIcon, onView }: {
  pg: PlaygroundResponse; t: any; isRTL: boolean; ArrowIcon: any; onView: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Image */}
      <div className="h-36 bg-gradient-to-br from-green-400 to-green-600 flex-shrink-0 relative overflow-hidden">
        {pg.imageUrls?.[0] ? (
          <img src={pg.imageUrls[0]} alt={pg.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {pg.sportType === 'FOOTBALL' ? '⚽' : '🎾'}
          </div>
        )}
        {pg.featured && (
          <span className="absolute top-2 left-2 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
            <Sparkles size={10} />{t('featuredBadge')}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-bold text-gray-800 truncate">{pg.name}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} /><span className="truncate">{pg.location}</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-auto pt-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={11} className={i < Math.round(pg.ratings || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
            ))}
            <span className="text-gray-400 ml-1">{(pg.ratings || 0).toFixed(1)}</span>
          </div>
          <span className="font-bold text-green-700">{pg.pricePerHour} EGP</span>
        </div>
        <button onClick={onView}
          className="mt-1 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">
          {t('viewAndBook')}<ArrowIcon size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Open session card ──────────────────────────── */
function SessionCard({ slot, t, isRTL, onJoin }: {
  slot: OpenGroupSlotInfo; t: any; isRTL: boolean; onJoin: () => void;
}) {
  const fillPct = slot.capacity > 0 ? (slot.currentParticipants / slot.capacity) * 100 : 0;
  const spotsMsg = t('spotsLeft', { count: slot.availableSpots });

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Playground identity */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-green-100 flex-shrink-0">
          {slot.playgroundImageUrls?.[0] ? (
            <img src={slot.playgroundImageUrls[0]} alt={slot.playgroundName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">
              {slot.sportType === 'FOOTBALL' ? '⚽' : '🎾'}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-800 truncate">{slot.playgroundName}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} />{slot.playgroundLocation}</p>
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
        <Clock size={14} className="text-green-600 flex-shrink-0" />
        <span className="font-medium">{fmtDate(slot.startTime)}</span>
        <span className="text-gray-400">·</span>
        <span>{fmtTime(slot.startTime)} → {fmtTime(slot.endTime)}</span>
      </div>

      {/* Capacity bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1"><Users size={11} />{slot.currentParticipants}/{slot.capacity}</span>
          <span className="text-green-600 font-semibold">{spotsMsg}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${fillPct}%` }} />
        </div>
      </div>

      {/* Who's in */}
      {slot.participantUsernames.length > 0 && (
        <div className="text-xs text-gray-500">
          <span className="font-medium text-gray-600">{t('alreadyJoined')}: </span>
          <span className="flex gap-1 flex-wrap mt-1">
            {slot.participantUsernames.map((u) => (
              <span key={u} className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">{u}</span>
            ))}
          </span>
        </div>
      )}

      {/* Price + CTA */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-50">
        <span className="font-bold text-green-700">{slot.pricePerHour} <span className="text-xs font-normal text-gray-400">EGP/{isRTL ? 'مقعد' : 'spot'}</span></span>
        <button onClick={onJoin}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          {t('joinSession')}
        </button>
      </div>
    </div>
  );
}
