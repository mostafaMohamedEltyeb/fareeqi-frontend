import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AnnouncementBanner from '../shared/AnnouncementBanner';
import { useAuthStore } from '../../store/authStore';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const user = useAuthStore((s) => s.user);
  const showBanner = user?.userType === 'PLAYER' || user?.userType === 'FIELD_OWNER';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-6">
          {showBanner && <AnnouncementBanner />}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
