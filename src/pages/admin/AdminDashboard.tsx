import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Building2, Trophy, Swords, CalendarDays, Clock, CheckCircle, XCircle, Ban, CreditCard } from 'lucide-react';
import { getAdminDashboard } from '../../api/admin';
import StatCard from '../../components/shared/StatCard';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import type { AdminDashboardResponse } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getAdminDashboard().then((r) => setData(r.data)).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingSkeleton rows={8} />;

  const bookingChart = [
    { name: t('pendingBookings'), value: data?.pendingBookings ?? 0, fill: '#f97316' },
    { name: t('approvedBookings'), value: data?.approvedBookings ?? 0, fill: '#22c55e' },
    { name: t('rejectedBookings'), value: data?.rejectedBookings ?? 0, fill: '#ef4444' },
    { name: t('cancelledBookings'), value: data?.cancelledBookings ?? 0, fill: '#9ca3af' },
    { name: t('paidBookings'), value: data?.paidBookings ?? 0, fill: '#3b82f6' },
  ];
  const overviewChart = [
    { name: t('users'), value: data?.totalUsers ?? 0, fill: '#8b5cf6' },
    { name: t('playgrounds'), value: data?.totalPlaygrounds ?? 0, fill: '#22c55e' },
    { name: t('teams'), value: data?.totalTeams ?? 0, fill: '#f97316' },
    { name: t('matches'), value: data?.totalMatches ?? 0, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-800">{t('dashboard')}</h1><p className="text-gray-500 text-sm mt-1">{t('admin')}</p></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title={t('totalUsers')} value={data?.totalUsers ?? 0} icon={Users} color="purple" />
        <StatCard title={t('totalPlaygrounds')} value={data?.totalPlaygrounds ?? 0} icon={Building2} color="green" />
        <StatCard title={t('totalTeams')} value={data?.totalTeams ?? 0} icon={Trophy} color="orange" />
        <StatCard title={t('totalMatches')} value={data?.totalMatches ?? 0} icon={Swords} color="red" />
        <StatCard title={t('totalBookings')} value={data?.totalBookings ?? 0} icon={CalendarDays} color="blue" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title={t('pendingBookings')} value={data?.pendingBookings ?? 0} icon={Clock} color="orange" />
        <StatCard title={t('approvedBookings')} value={data?.approvedBookings ?? 0} icon={CheckCircle} color="green" />
        <StatCard title={t('rejectedBookings')} value={data?.rejectedBookings ?? 0} icon={XCircle} color="red" />
        <StatCard title={t('cancelledBookings')} value={data?.cancelledBookings ?? 0} icon={Ban} color="gray" />
        <StatCard title={t('paidBookings')} value={data?.paidBookings ?? 0} icon={CreditCard} color="blue" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">{t('totalBookings')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bookingChart}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="name" tick={{fontSize:10}}/><YAxis tick={{fontSize:11}}/><Tooltip/>
              <Bar dataKey="value" radius={[6,6,0,0]}>{bookingChart.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={overviewChart}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip/>
              <Bar dataKey="value" radius={[6,6,0,0]}>{overviewChart.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
