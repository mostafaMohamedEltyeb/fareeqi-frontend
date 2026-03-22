import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, MapPin, CalendarDays, CreditCard, Users, Trophy, Swords, User, LogOut, X, Building2, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props { open: boolean; onClose: () => void; }

export default function Sidebar({ open, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const playerNav = [
    { to: '/player/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/player/playgrounds', icon: MapPin, label: t('playgrounds') },
    { to: '/player/bookings', icon: CalendarDays, label: t('myBookings') },
    { to: '/player/payments', icon: CreditCard, label: t('myPayments') },
    { to: '/player/teams', icon: Trophy, label: t('teams') },
    { to: '/player/matches', icon: Swords, label: t('matches') },
    { to: '/player/profile', icon: User, label: t('profile') },
  ];
  const ownerNav = [
    { to: '/owner/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/owner/playgrounds', icon: Building2, label: t('myPlaygrounds') },
    { to: '/owner/bookings', icon: ClipboardList, label: t('bookingRequests') },
  ];
  const adminNav = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/admin/users', icon: Users, label: t('users') },
    { to: '/admin/bookings', icon: CalendarDays, label: t('allBookings') },
    { to: '/admin/matches', icon: Swords, label: t('matches') },
  ];

  const navItems = user?.userType === 'PLAYER' ? playerNav : user?.userType === 'FIELD_OWNER' ? ownerNav : adminNav;
  const handleLogout = () => { logout(); navigate('/login'); };
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`
        fixed lg:static inset-y-0 z-30 flex flex-col w-64 flex-shrink-0
        bg-gradient-to-b from-green-800 to-green-900 text-white
        transition-transform duration-300
        ${isRTL ? 'right-0' : 'left-0'}
        ${open ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-5 border-b border-green-700">
          <div>
            <h1 className="text-2xl font-bold">{t('fareeqi')} ⚽</h1>
            <p className="text-green-300 text-xs mt-0.5">{t('tagline')}</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-green-700"><X size={18} /></button>
        </div>
        <div className="px-4 py-3 border-b border-green-700 bg-green-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.username}</p>
              <p className="text-green-300 text-xs">{user?.userType === 'PLAYER' ? t('player') : user?.userType === 'FIELD_OWNER' ? t('fieldOwner') : t('admin')}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${isActive ? 'bg-white text-green-800 shadow-sm' : 'text-green-100 hover:bg-green-700/60'}`}>
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              <ChevronIcon size={14} className="opacity-40" />
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-green-700">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-green-100 hover:bg-red-600/80 transition-colors">
            <LogOut size={18} /><span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
