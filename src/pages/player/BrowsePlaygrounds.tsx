import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getPlaygrounds } from '../../api/playgrounds';
import type { PlaygroundResponse } from '../../types';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import { MapPin, Star, Search, Filter } from 'lucide-react';

export default function BrowsePlaygrounds() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [playgrounds, setPlaygrounds] = useState<PlaygroundResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ location: '', sportType: '', availability: '', minPrice: '', maxPrice: '', minRating: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.location) params.location = filters.location;
      if (filters.sportType) params.sportType = filters.sportType;
      if (filters.availability) params.availability = filters.availability;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;
      const r = await getPlaygrounds(params);
      setPlaygrounds(r.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const stars = (r: number) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={14} className={i < Math.round(r) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
  ));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t('playgrounds')}</h1>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="relative col-span-2 md:col-span-1">
            <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder={t('searchByLocation')} className="w-full border border-gray-200 rounded-lg ps-9 pe-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <select value={filters.sportType} onChange={(e) => setFilters({ ...filters, sportType: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="">{t('allSports')}</option>
            <option value="FOOTBALL">{t('football')}</option>
            <option value="PADEL">{t('padel')}</option>
          </select>
          <select value={filters.availability} onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="">{t('availability')}</option>
            <option value="true">{t('available')}</option>
            <option value="false">{t('notAvailable')}</option>
          </select>
          <input type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            placeholder={t('minPrice')} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            placeholder={t('maxPrice')} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <button onClick={fetchData} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
            <Filter size={16} />{t('filter')}
          </button>
        </div>
      </div>
      {loading ? <LoadingSkeleton rows={6} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {playgrounds.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400 py-16">{t('noData')}</div>
          ) : playgrounds.map((p) => (
            <div key={p.id} onClick={() => navigate(`/player/playgrounds/${p.id}`)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group">
              <div className="h-32 overflow-hidden relative">
                {p.imageUrls?.length > 0
                  ? <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-5xl group-hover:from-green-500 transition-all">
                      {p.sportType === 'FOOTBALL' ? '⚽' : '🎾'}
                    </div>
                }
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm">{p.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.availability ? t('available') : t('notAvailable')}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                  <MapPin size={12} />{p.location}
                </div>
                <div className="flex items-center gap-1 mb-3">{stars(p.ratings || 0)}<span className="text-xs text-gray-500 ms-1">{p.ratings?.toFixed(1) || '0.0'}</span></div>
                <div className="flex items-center justify-between">
                  <span className="text-green-700 font-bold text-sm">{p.pricePerHour} EGP<span className="text-gray-400 font-normal text-xs">/hr</span></span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.sportType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
