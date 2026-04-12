import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getOwnerBookings, approveBooking, rejectBooking } from '../../api/bookings';
import { fmtDateTime } from '../../utils/date';
import type { BookingResponse, BookingFilters, BookingStatus, PaymentStatus, PagedResponse } from '../../types';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Search, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;
const BOOKING_STATUSES: BookingStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CHECKED_IN'];
const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'PAID', 'REFUNDED'];
const emptyFilters: BookingFilters = { playerName: '', playgroundName: '', status: '', paymentStatus: '', dateFrom: '', dateTo: '' };

export default function OwnerBookings() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [data, setData] = useState<PagedResponse<BookingResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<BookingFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<BookingFilters>(emptyFilters);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = useCallback((page: number, f: BookingFilters) => {
    setLoading(true);
    getOwnerBookings(f, page, PAGE_SIZE)
      .then((r) => setData(r.data))
      .catch(() => toast.error(isRtl ? 'فشل تحميل الحجوزات' : 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [isRtl]);

  useEffect(() => { fetchData(currentPage, appliedFilters); }, [currentPage, appliedFilters, fetchData]);

  const handleApply = () => { setCurrentPage(0); setAppliedFilters({ ...filters }); };
  const handleReset = () => { setFilters(emptyFilters); setCurrentPage(0); setAppliedFilters(emptyFilters); };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      if (action === 'approve') await approveBooking(id);
      else await rejectBooking(id);
      toast.success(isRtl ? (action === 'approve' ? 'تم القبول' : 'تم الرفض') : (action === 'approve' ? 'Approved' : 'Rejected'));
      fetchData(currentPage, appliedFilters);
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setActionLoading(null); }
  };

  const bookings = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const filterChanged = JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">{t('bookingRequests')}</h1>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" />
            <input type="text" placeholder={t('filterByPlayer')}
              value={filters.playerName}
              onChange={(e) => setFilters((f) => ({ ...f, playerName: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              className="w-full ps-8 pe-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div className="relative">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" />
            <input type="text" placeholder={t('filterByPlayground')}
              value={filters.playgroundName}
              onChange={(e) => setFilters((f) => ({ ...f, playgroundName: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              className="w-full ps-8 pe-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <select value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as BookingStatus | '' }))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700">
            <option value="">{t('allStatuses')}</option>
            {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{t(s.toLowerCase()) || s}</option>)}
          </select>

          <select value={filters.paymentStatus}
            onChange={(e) => setFilters((f) => ({ ...f, paymentStatus: e.target.value as PaymentStatus | '' }))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700">
            <option value="">{t('allPayments')}</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{t(s.toLowerCase()) || s}</option>)}
          </select>

          <input type="date" value={filters.dateFrom}
            onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700" />

          <input type="date" value={filters.dateTo}
            onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700" />
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            <RotateCcw size={14} /> {t('resetFilters')}
          </button>
          <button onClick={handleApply}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors ${filterChanged ? 'bg-green-600 hover:bg-green-700' : 'bg-green-400 cursor-default'}`}>
            <Search size={14} /> {t('search')}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? <LoadingSkeleton /> : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {totalElements > 0 && (
            <div className="px-4 py-2.5 text-xs text-gray-500 border-b border-gray-50 bg-gray-50/60">
              {t('showing')} {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} {t('of')} {totalElements} {t('results')}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{[t('player'), t('playground'), t('slotTime'), t('status'), t('paymentStatus'), t('actions')].map((h) => (
                  <th key={h} className="px-4 py-3 text-start font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">{t('noData')}</td></tr>
                ) : bookings.map((b) => (
                  <tr key={b.id} className={`hover:bg-gray-50/50 transition-colors ${b.status === 'PENDING' ? 'bg-orange-50/30' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{b.playerUsername}</td>
                    <td className="px-4 py-3 text-gray-600">{b.playgroundName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDateTime(b.slotStartTime)} → {fmtDateTime(b.slotEndTime)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={b.paymentStatus} /></td>
                    <td className="px-4 py-3">
                      {b.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleAction(b.id, 'approve')} disabled={actionLoading === b.id}
                            className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 disabled:opacity-50">
                            <CheckCircle size={13} /> {t('approve')}
                          </button>
                          <button onClick={() => handleAction(b.id, 'reject')} disabled={actionLoading === b.id}
                            className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 disabled:opacity-50">
                            <XCircle size={13} /> {t('reject')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">{t('page')} {currentPage + 1} / {totalPages}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />} {t('prevPage')}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i)
                  .filter((i) => Math.abs(i - currentPage) <= 2)
                  .map((i) => (
                    <button key={i} onClick={() => setCurrentPage(i)}
                      className={`w-8 h-8 text-xs font-medium rounded-lg border transition-colors ${i === currentPage ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {i + 1}
                    </button>
                  ))}
                <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  {t('nextPage')} {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
