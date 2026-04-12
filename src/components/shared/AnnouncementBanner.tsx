import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { X, Tag, Copy, Check, Megaphone } from 'lucide-react';
import { getActiveAnnouncements } from '../../api/announcements';
import { fmtDate } from '../../utils/date';
import type { AnnouncementResponse, BadgeColor } from '../../types';

const colorMap: Record<BadgeColor, { banner: string; badge: string; code: string }> = {
  green:  { banner: 'bg-green-50 border-green-200',   badge: 'bg-green-600 text-white',  code: 'bg-green-100 text-green-800 border-green-300' },
  blue:   { banner: 'bg-blue-50 border-blue-200',     badge: 'bg-blue-600 text-white',   code: 'bg-blue-100 text-blue-800 border-blue-300' },
  orange: { banner: 'bg-orange-50 border-orange-200', badge: 'bg-orange-500 text-white', code: 'bg-orange-100 text-orange-800 border-orange-300' },
  red:    { banner: 'bg-red-50 border-red-200',       badge: 'bg-red-600 text-white',    code: 'bg-red-100 text-red-800 border-red-300' },
};

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium hover:opacity-80 transition-opacity"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export default function AnnouncementBanner() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const location = useLocation();

  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(() => {
    try {
      const raw = sessionStorage.getItem('dismissed_announcements');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Re-fetch on every route change so new announcements appear without a full refresh
  useEffect(() => {
    getActiveAnnouncements()
      .then((r) => setAnnouncements(r.data))
      .catch(() => {
        // Silently ignore — banner is non-critical; network errors shouldn't break the layout
      });
  }, [location.pathname]);

  const dismiss = (id: number) => {
    const next = new Set(dismissed).add(id);
    setDismissed(next);
    sessionStorage.setItem('dismissed_announcements', JSON.stringify([...next]));
  };

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {visible.map((a) => {
        const color = colorMap[a.badgeColor as BadgeColor] ?? colorMap.green;
        return (
          <div key={a.id} className={`flex items-start gap-3 border rounded-xl px-4 py-3 ${color.banner}`}>
            <span className={`flex-shrink-0 p-1.5 rounded-lg ${color.badge}`}>
              <Megaphone size={16} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{a.title}</p>
              <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{a.message}</p>
              {a.voucherCode && (
                <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg border text-sm font-mono font-bold ${color.code}`}>
                  <Tag size={13} />
                  <span>{a.voucherCode}</span>
                  <CopyButton code={a.voucherCode} />
                </div>
              )}
              {a.endDate && (
                <p className="text-xs text-gray-400 mt-1.5">
                  {isRTL ? 'صالح حتى: ' : 'Valid until: '}
                  {fmtDate(a.endDate)}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(a.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
