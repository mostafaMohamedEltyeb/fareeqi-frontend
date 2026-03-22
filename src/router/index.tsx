import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import PlayerDashboard from '../pages/player/PlayerDashboard';
import BrowsePlaygrounds from '../pages/player/BrowsePlaygrounds';
import PlaygroundDetail from '../pages/player/PlaygroundDetail';
import MyBookings from '../pages/player/MyBookings';
import BookingDetail from '../pages/player/BookingDetail';
import PaymentPage from '../pages/player/PaymentPage';
import MyPayments from '../pages/player/MyPayments';
import TeamsPage from '../pages/player/TeamsPage';
import MatchesPage from '../pages/player/MatchesPage';
import PlayerProfile from '../pages/player/PlayerProfile';
import OwnerDashboard from '../pages/owner/OwnerDashboard';
import MyPlaygrounds from '../pages/owner/MyPlaygrounds';
import SlotManagement from '../pages/owner/SlotManagement';
import OwnerBookings from '../pages/owner/OwnerBookings';
import VerifyBooking from '../pages/owner/VerifyBooking';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import AllBookings from '../pages/admin/AllBookings';
import AdminMatches from '../pages/admin/AdminMatches';

function Guard({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.userType)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: <Guard><AppLayout /></Guard>,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'player/dashboard', element: <Guard roles={['PLAYER']}><PlayerDashboard /></Guard> },
      { path: 'player/playgrounds', element: <Guard roles={['PLAYER']}><BrowsePlaygrounds /></Guard> },
      { path: 'player/playgrounds/:id', element: <Guard roles={['PLAYER']}><PlaygroundDetail /></Guard> },
      { path: 'player/bookings', element: <Guard roles={['PLAYER']}><MyBookings /></Guard> },
      { path: 'player/bookings/:bookingId', element: <Guard roles={['PLAYER']}><BookingDetail /></Guard> },
      { path: 'player/pay/:bookingId', element: <Guard roles={['PLAYER']}><PaymentPage /></Guard> },
      { path: 'player/payments', element: <Guard roles={['PLAYER']}><MyPayments /></Guard> },
      { path: 'player/teams', element: <Guard roles={['PLAYER']}><TeamsPage /></Guard> },
      { path: 'player/matches', element: <Guard roles={['PLAYER']}><MatchesPage /></Guard> },
      { path: 'player/profile', element: <Guard roles={['PLAYER']}><PlayerProfile /></Guard> },
      { path: 'owner/dashboard', element: <Guard roles={['FIELD_OWNER']}><OwnerDashboard /></Guard> },
      { path: 'owner/playgrounds', element: <Guard roles={['FIELD_OWNER']}><MyPlaygrounds /></Guard> },
      { path: 'owner/playgrounds/:playgroundId/slots', element: <Guard roles={['FIELD_OWNER']}><SlotManagement /></Guard> },
      { path: 'owner/bookings', element: <Guard roles={['FIELD_OWNER']}><OwnerBookings /></Guard> },
      { path: 'owner/verify', element: <Guard roles={['FIELD_OWNER']}><VerifyBooking /></Guard> },
      { path: 'admin/dashboard', element: <Guard roles={['ADMIN']}><AdminDashboard /></Guard> },
      { path: 'admin/users', element: <Guard roles={['ADMIN']}><UserManagement /></Guard> },
      { path: 'admin/bookings', element: <Guard roles={['ADMIN']}><AllBookings /></Guard> },
      { path: 'admin/matches', element: <Guard roles={['ADMIN']}><AdminMatches /></Guard> },
      { path: '*', element: <Navigate to="/login" replace /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
