import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllBookings, updatePaymentStatus } from '../../api/bookings';
import type { BookingResponse, BookingFilters, BookingStatus, PaymentStatus, PagedResponse } from '../../types';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import toast from 'react-hot-toast';
import { Search, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

const BOOKING_STATUSES: BookingStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CHECKED_IN'];
const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'PAID', 'REFUNDED'];

// Always format dates as Gregorian (en-GB gives "15 May 2024, 10:30")
const fmtDate = (dt: string) => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date(dt));
  } catch {
    return dt;
  }
};

const emptyFilters: BookingFilters = {
  playerName: '', playgroundName: '', status: '', paymentStatus: '', dateFrom: '', dateTo: '',
};

export default function AllBookings() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [data, setData] = useState<PagedResponse<BookingResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<BookingFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<BookingFilters>(emptyFilters);

  const [payModal, setPayModal] = useState<BookingResponse | null>(null);
  const [payStatus, setPayStatus] = useState('PAID');
  const [saving, setSaving] = useState(false);

  const fetchBookings = useCallback((page: number, f: BookingFilters) => {
    setLoading(true);
    getAllBookings(f, page, PAGE_SIZE)
      .then((r) => setData(r.data))
      .catch(() => toast.error(isRtl ? 'فشل تحميل الحجوزات' : 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [isRtl]);

  useEffect(() => { fetchBookings(currentPage, appliedFilters); }, [currentPage, appliedFilters, fetchBookings]);

  const handleApplyFilters = () => { setCurrentPage(0); setAppliedFilters({ ...filters }); };
  const handleResetFilters = () => { setFilters(emptyFilters); setCurrentPage(0); setAppliedFilters(emptyFilters); };

  const handleUpdatePayment = async () => {
    if (!payModal) return;
    setSaving(true);
    try {
      await updatePaymentStatus(payModal.id, { paymentStatus: payStatus });
      toast.success(isRtl ? 'تم التحديث' : 'Updated');
      setPayModal(null);
      fetchBookings(currentPage, appliedFilters);
    } catch (err: any) {
      toast.error(err.displayMessage);
    } finally {
      setSaving(false);
    }
  };

  const bookings = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const filterChanged = JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">{t('allBookings')}</h1>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Player name */}
          <div className="relative">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" />
            <input
              type="text"
              placeholder={t('filterByPlayer')}
              value={filters.playerName}
              onChange={(e) => setFilters((f) => ({ ...f, playerName: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="w-full ps-8 pe-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Playground name */}
          <div className="relative">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" />
            <input
              type="text"
              placeholder={t('filterByPlayground')}
              value={filters.playgroundName}
              onChange={(e) => setFilters((f) => ({ ...f, playgroundName: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="w-full ps-8 pe-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Booking status */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as BookingStatus | '' }))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700"
          >
            <option value="">{t('allStatuses')}</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>{t(s.toLowerCase()) || s}</option>
            ))}
          </select>

          {/* Payment status */}
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters((f) => ({ ...f, paymentStatus: e.target.value as PaymentStatus | '' }))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700"
          >
            <option value="">{t('allPayments')}</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{t(s.toLowerCase()) || s}</option>
            ))}
          </select>

          {/* Date from */}
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
          />

          {/* Date to */}
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw size={14} /> {t('resetFilters')}
          </button>
          <button
            onClick={handleApplyFilters}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors ${filterChanged ? 'bg-green-600 hover:bg-green-700' : 'bg-green-400 cursor-default'}`}
          >
            <Search size={14} /> {t('search')}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Summary */}
          {totalElements > 0 && (
            <div className="px-4 py-2.5 text-xs text-gray-500 border-b border-gray-50 bg-gray-50/60">
              {t('showing')} {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} {t('of')} {totalElements} {t('results')}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[t('player'), t('playground'), t('slotTime'), t('status'), t('paymentStatus'), t('createdAt'), t('actions')].map((h) => (
                    <th key={h} className="px-4 py-3 text-start font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">{t('noData')}</td>
                  </tr>
                ) : bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{b.playerUsername}</td>
                    <td className="px-4 py-3 text-gray-600">{b.playgroundName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDate(b.slotStartTime)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={b.paymentStatus} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDate(b.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setPayModal(b); setPayStatus(b.paymentStatus); }}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 whitespace-nowrap"
                      >
                        {t('updatePayment')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                {t('page')} {currentPage + 1} / {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                  {t('prevPage')}
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i)
                  .filter((i) => Math.abs(i - currentPage) <= 2)
                  .map((i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-8 h-8 text-xs font-medium rounded-lg border transition-colors ${
                        i === currentPage
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('nextPage')}
                  {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Update payment modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-800 text-lg mb-4">{t('updatePayment')}</h3>
            <p className="text-sm text-gray-500 mb-3">{payModal.playgroundName} — {payModal.playerUsername}</p>
            <select
              value={payStatus}
              onChange={(e) => setPayStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white mb-4"
            >
              <option value="PENDING">{t('pending')}</option>
              <option value="PAID">{t('paid')}</option>
              <option value="REFUNDED">{t('refunded')}</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setPayModal(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleUpdatePayment}
                disabled={saving}
                className="flex-1 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? t('loading') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
