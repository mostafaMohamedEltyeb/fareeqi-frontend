import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMyNotifications, markNotificationRead } from '../../api/notifications';
import { fmtDateTime } from '../../utils/date';
import type { NotificationResponse } from '../../types';
import { useAuthStore } from '../../store/authStore';

export default function NotificationBell() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const isRTL = i18n.language === 'ar';

  const fetchNotifications = async () => {
    if (!user) return;
    try { const r = await getMyNotifications(); setNotifications(r.data); } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter((n) => n.status === 'UNREAD').length;

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, status: 'READ' as const } : n));
    } catch {}
  };

  const formatTime = fmtDateTime;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
        <Bell size={22} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className={`absolute top-12 ${isRTL ? 'left-0' : 'right-0'} w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden`}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-gray-800">{t('notifications')}</span>
            {unread > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{unread}</span>}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">{t('noNotifications')}</p>
            ) : notifications.map((n) => (
              <div key={n.id} onClick={() => n.status === 'UNREAD' && handleMarkRead(n.id)}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${n.status === 'UNREAD' ? 'bg-green-50/60' : ''}`}>
                <div className="flex items-start gap-2">
                  {n.status === 'UNREAD' && <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.status === 'UNREAD' ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatTime(n.dateTime)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
