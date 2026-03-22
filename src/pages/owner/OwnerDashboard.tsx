import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Clock, CheckCircle, XCircle, Building2, ClipboardList } from 'lucide-react';
import { getOwnerDashboard } from '../../api/bookings';
import StatCard from '../../components/shared/StatCard';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import type { OwnerDashboardResponse } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

export default function OwnerDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<OwnerDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getOwnerDashboard().then((r) => setData(r.data)).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingSkeleton rows={6} />;
  const chartData = [
    { name: t('pendingBookings'), value: data?.pendingBookings ?? 0, fill: '#f97316' },
    { name: t('approvedBookings'), value: data?.approvedBookings ?? 0, fill: '#22c55e' },
    { name: t('rejectedBookings'), value: data?.rejectedBookings ?? 0, fill: '#ef4444' },
  ];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-800">{t('dashboard')}</h1><p className="text-gray-500 text-sm mt-1">{t('fieldOwner')}</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title={t('totalPlaygrounds')} value={data?.totalPlaygrounds ?? 0} icon={Building2} color="green" />
        <StatCard title={t('totalBookings')} value={data?.totalBookings ?? 0} icon={CalendarDays} color="blue" />
        <StatCard title={t('pendingBookings')} value={data?.pendingBookings ?? 0} icon={Clock} color="orange" />
        <StatCard title={t('approvedBookings')} value={data?.approvedBookings ?? 0} icon={CheckCircle} color="green" />
        <StatCard title={t('rejectedBookings')} value={data?.rejectedBookings ?? 0} icon={XCircle} color="red" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">{t('totalBookings')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
              <Bar dataKey="value" radius={[6,6,0,0]}>{chartData.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          <Link to="/owner/playgrounds" className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white rounded-xl p-4 font-semibold transition-colors"><Building2 size={20}/>{t('myPlaygrounds')}</Link>
          <Link to="/owner/bookings" className="flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-100 text-gray-700 rounded-xl p-4 font-semibold transition-colors"><ClipboardList size={20}/>{t('bookingRequests')}</Link>
        </div>
      </div>
    </div>
  );
}
