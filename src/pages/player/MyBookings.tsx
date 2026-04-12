import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../../api/bookings';
import { fmtDateTime } from '../../utils/date';
import type { BookingResponse, BookingFilters, BookingStatus, PaymentStatus, PagedResponse } from '../../types';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ConfirmModal from '../../components/shared/ConfirmModal';
import toast from 'react-hot-toast';
import { Search, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;
const BOOKING_STATUSES: BookingStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CHECKED_IN'];
const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'PAID', 'REFUNDED'];
const emptyFilters: BookingFilters = { playgroundName: '', status: '', paymentStatus: '', dateFrom: '', dateTo: '' };

export default function MyBookings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';

  const [data, setData] = useState<PagedResponse<BookingResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<BookingFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<BookingFilters>(emptyFilters);

  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelBooking_, setCancelBooking_] = useState<BookingResponse | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchData = useCallback((page: number, f: BookingFilters) => {
    setLoading(true);
    getMyBookings(f, page, PAGE_SIZE)
      .then((r) => setData(r.data))
      .catch(() => toast.error(isRtl ? 'فشل تحميل الحجوزات' : 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [isRtl]);

  useEffect(() => { fetchData(currentPage, appliedFilters); }, [currentPage, appliedFilters, fetchData]);

  const handleApply = () => { setCurrentPage(0); setAppliedFilters({ ...filters }); };
  const handleReset = () => { setFilters(emptyFilters); setCurrentPage(0); setAppliedFilters(emptyFilters); };

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelId);
      toast.success(isRtl ? 'تم الإلغاء' : 'Cancelled');
      setCancelId(null); setCancelBooking_(null);
      fetchData(currentPage, appliedFilters);
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setCancelling(false); }
  };

  const bookings = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const filterChanged = JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">{t('myBookings')}</h1>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                <tr>{[t('playground'), t('slotTime'), t('status'), t('paymentStatus'), t('createdAt'), t('actions')].map((h) => (
                  <th key={h} className="px-4 py-3 text-start font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">{t('noData')}</td></tr>
                ) : bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 cursor-pointer hover:text-green-600"
                      onClick={() => navigate(`/player/bookings/${b.id}`)}>{b.playgroundName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDateTime(b.slotStartTime)} → {fmtDateTime(b.slotEndTime)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={b.paymentStatus} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDateTime(b.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                          <button onClick={() => { setCancelId(b.id); setCancelBooking_(b); }}
                            className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">{t('cancel')}</button>
                        )}
                        {b.status === 'APPROVED' && b.paymentStatus !== 'PAID' && (
                          <button onClick={() => navigate(`/player/pay/${b.id}`)}
                            className="px-2 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">{t('payNow')}</button>
                        )}
                      </div>
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

      <ConfirmModal
        open={!!cancelId}
        message={
          cancelBooking_?.status === 'APPROVED' && cancelBooking_?.paymentStatus === 'PAID'
            ? (isRtl
                ? 'هذا الحجز مقبول ومدفوع. سيتم خصم رسوم إلغاء (20% من سعر الحجز) وتحديد حالة الدفع كـ "مسترد". هل تريد المتابعة؟'
                : 'This booking is approved and paid. A cancellation fee of 20% will be charged and payment marked as Refunded. Continue?')
            : cancelBooking_?.paymentStatus === 'PAID'
            ? (isRtl
                ? 'هذا الحجز مدفوع. سيتم وضع علامة "مسترد" على الدفع عند الإلغاء. هل تريد المتابعة؟'
                : 'This booking is paid. The payment will be marked as Refunded upon cancellation. Continue?')
            : t('confirmDelete')
        }
        onConfirm={handleCancel}
        onCancel={() => { setCancelId(null); setCancelBooking_(null); }}
        loading={cancelling}
      />
    </div>
  );
}
