import { useEffect, useState } from 'react';
import { getAdminFinance, exportAdminCsv } from '../../api/finance';
import type { FinanceSummaryResponse } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, CreditCard, Building2, BarChart2, Download } from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import toast from 'react-hot-toast';

const PERIODS = ['daily', 'weekly', 'monthly', 'yearly'] as const;
type Period = typeof PERIODS[number];

function StatCard({ title, value, sub, icon: Icon, color }: { title: string; value: string; sub?: string; icon: any; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-xl font-bold text-gray-800 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminFinance() {
  const [data, setData] = useState<FinanceSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('monthly');
  const [from, setFrom] = useState(() => new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [exporting, setExporting] = useState(false);

  const load = () => {
    setLoading(true);
    getAdminFinance({ period, from, to })
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load finance data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [period, from, to]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const r = await exportAdminCsv({ from, to });
      downloadBlob(r.data as Blob, `finance-report-${from}-${to}.csv`);
      toast.success('Report downloaded');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  const fmt = (n?: number) => n != null ? `EGP ${Number(n).toLocaleString('en-EG', { minimumFractionDigits: 2 })}` : 'EGP 0.00';
  const topPlayground = data?.playgroundBreakdown?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Finance Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Track revenue, bookings and playground performance</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          <Download size={16} />
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${period === p ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-gray-500 font-medium">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <label className="text-xs text-gray-500 font-medium">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
      </div>

      {loading ? <LoadingSkeleton rows={6} /> : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Revenue" value={fmt(data?.totalRevenue)} icon={TrendingUp} color="green" />
            <StatCard title="Paid Bookings" value={String(data?.totalPaidBookings ?? 0)} icon={CreditCard} color="blue" />
            <StatCard title="Avg per Booking" value={fmt(data?.averageBookingAmount)} icon={BarChart2} color="purple" />
            <StatCard
              title="Top Playground"
              value={topPlayground?.playgroundName ?? '—'}
              sub={topPlayground ? fmt(topPlayground.revenue) : undefined}
              icon={Building2}
              color="orange"
            />
          </div>

          {/* Revenue trend chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Revenue Trend</h3>
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
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}`} />
                  <Tooltip formatter={(v: number) => [`EGP ${v.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#adminGrad)" dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data for selected period</div>
            )}
          </div>

          {/* Playground breakdown table */}
          {data?.playgroundBreakdown?.length ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700">Revenue by Playground</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium text-gray-500">Playground</th>
                      <th className="px-5 py-3 text-right font-medium text-gray-500">Paid Bookings</th>
                      <th className="px-5 py-3 text-right font-medium text-gray-500">Revenue</th>
                      <th className="px-5 py-3 text-right font-medium text-gray-500">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.playgroundBreakdown.map((pg, i) => {
                      const share = data.totalRevenue > 0 ? ((Number(pg.revenue) / Number(data.totalRevenue)) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={pg.playgroundId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                              <span className="font-medium text-gray-800">{pg.playgroundName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right text-gray-600">{pg.bookingCount}</td>
                          <td className="px-5 py-3 text-right font-semibold text-green-700">{fmt(pg.revenue)}</td>
                          <td className="px-5 py-3 text-right">
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
                      <td className="px-5 py-3 font-semibold text-gray-700">Total</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-700">{data.totalPaidBookings}</td>
                      <td className="px-5 py-3 text-right font-bold text-green-700">{fmt(data.totalRevenue)}</td>
                      <td className="px-5 py-3 text-right text-gray-500 text-xs">100%</td>
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
