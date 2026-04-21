import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPlaygrounds, removePlaygroundImage } from '../../api/playgrounds';
import type { PlaygroundResponse } from '../../types';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ConfirmModal from '../../components/shared/ConfirmModal';
import toast from 'react-hot-toast';
import { Images, Trash2, Search, X } from 'lucide-react';

interface ImageEntry {
  playgroundId: number;
  playgroundName: string;
  ownerUsername: string;
  imageUrl: string;
}

export default function ImageModeration() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [filtered, setFiltered] = useState<ImageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);
  const [confirmEntry, setConfirmEntry] = useState<ImageEntry | null>(null);

  const load = () => {
    setLoading(true);
    getPlaygrounds({})
      .then((r) => {
        const all: ImageEntry[] = (r.data as PlaygroundResponse[])
          .flatMap((pg) =>
            (pg.imageUrls || []).map((url) => ({
              playgroundId: pg.id,
              playgroundName: pg.name,
              ownerUsername: pg.ownerUsername,
              imageUrl: url,
            }))
          );
        setEntries(all);
        setFiltered(all);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    const q = value.toLowerCase();
    setFiltered(
      entries.filter(
        (e) =>
          e.playgroundName.toLowerCase().includes(q) ||
          e.ownerUsername.toLowerCase().includes(q)
      )
    );
  };

  const handleRemove = async () => {
    if (!confirmEntry) return;
    setRemovingUrl(confirmEntry.imageUrl);
    setConfirmEntry(null);
    try {
      await removePlaygroundImage(confirmEntry.playgroundId, confirmEntry.imageUrl);
      toast.success(t('imageRemovedSuccess'));
      const next = entries.filter((e) => e.imageUrl !== confirmEntry.imageUrl);
      setEntries(next);
      const q = search.toLowerCase();
      setFiltered(
        next.filter(
          (e) =>
            e.playgroundName.toLowerCase().includes(q) ||
            e.ownerUsername.toLowerCase().includes(q)
        )
      );
    } catch (err: any) {
      toast.error(err.displayMessage || (isRTL ? 'فشل الحذف' : 'Remove failed'));
    } finally {
      setRemovingUrl(null);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Images size={24} className="text-green-600" />
            {t('imageModeration')}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{t('imageModerationSubtitle')}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2 text-sm text-green-700 font-semibold">
          {t('totalImages')}: {entries.length}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={isRTL ? 'بحث باسم الملعب أو المالك...' : 'Search by playground or owner...'}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        />
        {search && (
          <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <Images size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">{search ? t('noData') : t('noImagesUploaded')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((entry) => (
            <ImageCard
              key={entry.imageUrl}
              entry={entry}
              removing={removingUrl === entry.imageUrl}
              onRemove={() => setConfirmEntry(entry)}
              t={t}
              isRTL={isRTL}
            />
          ))}
        </div>
      )}

      {/* Confirm modal */}
      <ConfirmModal
        open={!!confirmEntry}
        message={t('confirmRemoveImage')}
        onConfirm={handleRemove}
        onCancel={() => setConfirmEntry(null)}
      />
    </div>
  );
}

function ImageCard({ entry, removing, onRemove, t, isRTL }: {
  entry: ImageEntry; removing: boolean; onRemove: () => void; t: any; isRTL: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-gray-100 flex-shrink-0">
        {!imgError ? (
          <img
            src={entry.imageUrl}
            alt={entry.playgroundName}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Images size={36} />
          </div>
        )}
        {/* Remove overlay button */}
        <button
          onClick={onRemove}
          disabled={removing}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50 shadow-md"
          title={t('removeImage')}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-semibold text-gray-800 text-sm truncate">{entry.playgroundName}</p>
        <p className="text-xs text-gray-400">{t('uploadedBy')}: <span className="text-gray-600 font-medium">{entry.ownerUsername}</span></p>
      </div>

      {/* Remove button (always visible below) */}
      <div className="px-3 pb-3">
        <button
          onClick={onRemove}
          disabled={removing}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 size={14} />
          {removing ? t('removingImage') : t('removeImage')}
        </button>
      </div>
    </div>
  );
}
