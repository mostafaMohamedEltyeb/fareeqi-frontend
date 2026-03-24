import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminFinance, exportAdminCsv } from '../../api/finance';
import type { FinanceSummaryResponse } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, CreditCard, Building2, BarChart2, Download, Plus, Sparkles, Wallet } from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import toast from 'react-hot-toast';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminFinance() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [data, setData] = useState<FinanceSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('monthly');
  const [from, setFrom] = useState(() => new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAdminFinance({ period, from, to })
      .then(r => setData(r.data))
      .catch(() => toast.error(t('failedToLoadFinance')))
      .finally(() => setLoading(false));
  }, [period, from, to]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const r = await exportAdminCsv({ from, to });
      downloadBlob(r.data as Blob, `finance-report-${from}-${to}.csv`);
      toast.success(t('reportDownloaded'));
    } catch { toast.error(t('exportFailed')); }
    finally { setExporting(false); }
  };

  const fmt = (n?: number) =>
    n != null ? `EGP ${Number(n).toLocaleString(isRTL ? 'ar-EG' : 'en-EG', { minimumFractionDigits: 2 })}` : 'EGP 0.00';

  const topPlayground = data?.playgroundBreakdown?.[0];
  const periods: Period[] = ['daily', 'weekly', 'monthly', 'yearly'];

  const volume = Number(data?.totalRevenue ?? 0);
  const fees   = Number(data?.totalPlatformFees ?? 0);
  const subRev = Number(data?.totalSubscriptionCosts ?? 0);
  const income = Number(data?.netProfit ?? fees + subRev);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('financeReports')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('trackRevenue')}</p>
        </div>
        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50">
          <Download size={16} />
          {exporting ? t('exporting') : t('exportCsv')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}>
              {t(p)}
            </button>
          ))}
        </div>
        <div className={`flex items-center gap-2 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
          <label className="text-xs text-gray-500 font-medium">{t('fromDate')}</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <label className="text-xs text-gray-500 font-medium">{t('toDate')}</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
      </div>

      {loading ? <LoadingSkeleton rows={6} /> : (
        <>
          {/* ── Platform Income Breakdown ──────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">
              {isRTL ? 'تفصيل إيرادات المنصة' : 'Platform Income Breakdown'}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {/* Bookings Volume */}
              <div className="flex-1 min-w-[140px] bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">
                    {isRTL ? 'حجم المعاملات' : 'Bookings Volume'}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-700">{fmt(volume)}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isRTL ? `${data?.totalPaidBookings ?? 0} حجز مكتمل` : `${data?.totalPaidBookings ?? 0} completed bookings`}
                </p>
              </div>

              <Plus size={18} className="text-gray-300 flex-shrink-0" />

              {/* Booking Fees Income */}
              <div className="flex-1 min-w-[140px] bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard size={16} className="text-blue-500" />
                  <span className="text-xs font-medium text-blue-700">
                    {isRTL ? 'رسوم الحجوزات' : 'Booking Fees'}
                  </span>
                </div>
                <p className="text-xl font-bold text-blue-700">+ {fmt(fees)}</p>
                <p className="text-xs text-blue-400 mt-0.5">
                  {volume > 0 ? `${((fees / volume) * 100).toFixed(1)}%` : '0%'}{' '}
                  {isRTL ? 'من حجم المعاملات' : 'of volume'}
                </p>
              </div>

              <Plus size={18} className="text-gray-300 flex-shrink-0" />

              {/* Subscription Revenue */}
              <div className="flex-1 min-w-[140px] bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-yellow-500" />
                  <span className="text-xs font-medium text-yellow-700">
                    {isRTL ? 'إيرادات الاشتراكات' : 'Subscription Revenue'}
                  </span>
                </div>
                <p className="text-xl font-bold text-yellow-600">+ {fmt(subRev)}</p>
                <p className="text-xs text-yellow-500 mt-0.5">
                  {isRTL ? 'اشتراكات الإبراز' : 'Featured playground subs'}
                </p>
              </div>

              <Plus size={18} className="text-gray-300 flex-shrink-0" />

              {/* Total Platform Income */}
              <div className="flex-1 min-w-[140px] bg-emerald-600 border-2 border-emerald-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet size={16} className="text-white opacity-80" />
                  <span className="text-xs font-medium text-white opacity-80">
                    {isRTL ? 'إجمالي دخل المنصة' : 'Total Platform Income'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{fmt(income)}</p>
                <p className="text-xs text-white opacity-70 mt-0.5">
                  {isRTL ? 'رسوم + اشتراكات' : 'Fees + subscriptions'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Secondary stat cards ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: t('avgPerBooking'), value: fmt(data?.averageBookingAmount), icon: BarChart2, color: 'bg-purple-50 text-purple-600' },
              { title: t('paidBookings'),  value: String(data?.totalPaidBookings ?? 0), icon: CreditCard, color: 'bg-blue-50 text-blue-600' },
              { title: t('topPlayground'), value: topPlayground?.playgroundName ?? '—', sub: topPlayground ? fmt(topPlayground.revenue) : undefined, icon: Building2, color: 'bg-orange-50 text-orange-600' },
            ].map(({ title, value, sub, icon: Icon, color }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}><Icon size={22} /></div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">{title}</p>
                  <p className="text-xl font-bold text-gray-800 truncate">{value}</p>
                  {sub && <p className="text-xs text-gray-400">{sub}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* ── Revenue trend chart ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">{t('revenueTrend')}</h3>
            {data?.periodBreakdown?.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.periodBreakdown} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`EGP ${v.toLocaleString()}`, t('totalRevenue')]} />
                  <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#adminGrad)" dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">{t('noDataForPeriod')}</div>
            )}
          </div>

          {/* ── Playground breakdown table ─────────────────────────────────── */}
          {data?.playgroundBreakdown?.length ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700">{t('revenueByPlayground')}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-start font-medium text-gray-500">{t('playground')}</th>
                      <th className="px-5 py-3 text-end font-medium text-gray-500">{t('paidBookings')}</th>
                      <th className="px-5 py-3 text-end font-medium text-gray-500">{t('totalRevenue')}</th>
                      <th className="px-5 py-3 text-end font-medium text-gray-500">{t('shareLabel')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.playgroundBreakdown.map((pg, i) => {
                      const share = volume > 0 ? ((Number(pg.revenue) / volume) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={pg.playgroundId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                              <span className="font-medium text-gray-800">{pg.playgroundName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-end text-gray-600">{pg.bookingCount}</td>
                          <td className="px-5 py-3 text-end font-semibold text-green-700">{fmt(pg.revenue)}</td>
                          <td className="px-5 py-3 text-end">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${share}%` }} />
                              </div>
                              <span className="text-xs text-gray-500 w-8">{share}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-100">
                    <tr>
                      <td className="px-5 py-3 font-semibold text-gray-700">{t('totalBookings')}</td>
                      <td className="px-5 py-3 text-end font-semibold text-gray-700">{data.totalPaidBookings}</td>
                      <td className="px-5 py-3 text-end font-bold text-green-700">{fmt(volume)}</td>
                      <td className="px-5 py-3 text-end text-gray-500 text-xs">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
