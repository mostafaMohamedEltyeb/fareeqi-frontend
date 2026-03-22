import { Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from '../shared/LanguageSwitcher';

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-10 flex-shrink-0">
      <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
        <Menu size={22} />
      </button>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <NotificationBell />
      </div>
    </header>
  );
}
