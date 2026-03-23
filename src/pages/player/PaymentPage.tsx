import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { initiatePayment, confirmPayment, cancelPaymentApi } from '../../api/payments';
import { validateVoucher } from '../../api/vouchers';
import { getBookingById } from '../../api/bookings';
import { getSettings } from '../../api/settings';
import type { PaymentResponse, BookingResponse, VoucherValidationResponse, AppSettingsResponse } from '../../types';
import toast from 'react-hot-toast';
import { CreditCard, CheckCircle, ArrowLeft, ArrowRight, Lock, Tag, X } from 'lucide-react';

export default function PaymentPage() {
  const { t, i18n } = useTranslation();
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherValidationResponse | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettingsResponse | null>(null);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (!bookingId) return;
    getBookingById(Number(bookingId)).then(r => setBooking(r.data)).catch(() => {});
    getSettings().then(r => setSettings(r.data)).catch(() => {});
  }, [bookingId]);
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim() || !booking?.slotPricePerHour) return;
    setVoucherLoading(true);
    try {
      const r = await validateVoucher(voucherInput.trim().toUpperCase(), booking.slotPricePerHour);
      setAppliedVoucher(r.data);
      toast.success(t('voucherApplied'));
    } catch (err: any) {
      toast.error(err.displayMessage || t('voucherInvalid'));
    } finally { setVoucherLoading(false); }
  };

  const handleInitiate = async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const r = await initiatePayment(Number(bookingId), appliedVoucher ? voucherInput.trim().toUpperCase() : undefined);
      setPayment(r.data);
      setStep(2);
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    if (!payment) return;
    setLoading(true);
    try {
      const r = await confirmPayment(payment.id);
      setPayment(r.data);
      setStep(3);
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setLoading(false); }
  };

  const handleCancel = async () => {
    if (!payment) return navigate(-1);
    setLoading(true);
    try { await cancelPaymentApi(payment.id); navigate('/player/bookings'); }
    catch (err: any) { toast.error(err.displayMessage); }
    finally { setLoading(false); }
  };

  const baseAmount = (booking?.slotPricePerHour && booking.slotPricePerHour > 0)
    ? booking.slotPricePerHour
    : 0;
  const feePercent = settings?.platformFeePercent ?? 5;

  return (
    <div className="max-w-md mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"><BackIcon size={16} />{t('back')}</button>

      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
            {s < 3 && <div className={`h-1 w-16 rounded ${step > s ? 'bg-green-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">{t('bookingSummary')}</h2>
          <p className="text-gray-500 text-sm">{isRTL ? 'حجز رقم' : 'Booking'} #{bookingId}</p>

          {/* Voucher input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1"><Tag size={14} />{t('voucherCode')}</label>
            <div className="flex gap-2">
              <input
                value={voucherInput}
                onChange={(e) => { setVoucherInput(e.target.value.toUpperCase()); setAppliedVoucher(null); }}
                placeholder={isRTL ? 'أدخل كود الخصم' : 'Enter voucher code'}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
              />
              {appliedVoucher ? (
                <button onClick={() => { setAppliedVoucher(null); setVoucherInput(''); }} className="px-3 py-2 text-red-500 border border-red-200 rounded-xl text-sm hover:bg-red-50">
                  <X size={16} />
                </button>
              ) : (
                <button onClick={handleApplyVoucher} disabled={voucherLoading || !voucherInput.trim()} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                  {voucherLoading ? '...' : t('applyVoucher')}
                </button>
              )}
            </div>
            {appliedVoucher && (
              <p className="text-green-600 text-xs font-medium">
                ✓ {appliedVoucher.code} — {isRTL ? 'خصم' : 'Discount'} {appliedVoucher.discountType === 'PERCENTAGE' ? `${appliedVoucher.discountValue}%` : `EGP ${appliedVoucher.discountValue}`}
              </p>
            )}
          </div>

          {/* Price breakdown */}
          {!booking ? (
            <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-400 text-sm">{t('loading')}</div>
          ) : baseAmount === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm">
              {isRTL ? 'سيتم احتساب السعر الفعلي عند المتابعة للدفع.' : 'Exact price will be calculated when you proceed to pay.'}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{t('baseFee')}</span>
                <span>EGP {baseAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-xs">
                <span>{t('platformFee')} ({feePercent}%)</span>
                <span>+ EGP {(baseAmount * feePercent / 100).toFixed(2)}</span>
              </div>
              {appliedVoucher && (
                <div className="flex justify-between text-green-600 text-xs">
                  <span>{t('discount')}</span>
                  <span>- EGP {appliedVoucher.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
                <span>{t('totalAmount')}</span>
                <span className="text-green-700">
                  EGP {appliedVoucher ? appliedVoucher.newTotal.toFixed(2) : (baseAmount * (1 + feePercent / 100)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <button onClick={handleInitiate} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <CreditCard size={20} />{loading ? t('loading') : t('proceedToPay')}
          </button>
        </div>
      )}

      {step === 2 && payment && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">{t('confirmPayment')}</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <p className="text-xs text-gray-500 mb-1">{t('playground')}</p>
            <p className="font-semibold text-gray-800 mb-2">{payment.playgroundName}</p>
            {payment.baseAmount != null && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>{t('baseFee')}</span><span>EGP {payment.baseAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>{t('platformFee')}</span><span>+ EGP {(payment.platformFeeAmount ?? 0).toFixed(2)}</span>
                </div>
                {(payment.discountAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-600 text-xs">
                    <span>{t('discount')} ({payment.appliedVoucherCode})</span>
                    <span>- EGP {(payment.discountAmount ?? 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
                  <span>{t('totalAmount')}</span>
                  <span className="text-green-700 text-lg">EGP {payment.amount.toFixed(2)}</span>
                </div>
              </>
            )}
            {payment.baseAmount == null && (
              <p className="text-green-700 font-bold text-lg mt-1">EGP {payment.amount} </p>
            )}
            <p className="text-xs text-gray-400 mt-1 font-mono">{payment.referenceNumber}</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('cardNumber')}</label>
              <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} maxLength={19}
                placeholder="•••• •••• •••• ••••" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('expiry')}</label>
                <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} maxLength={5}
                  placeholder="MM/YY" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('cvv')}</label>
                <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} maxLength={3}
                  placeholder="•••" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono" type="password" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400"><Lock size={12} />{isRTL ? 'محاكاة دفع — بيانات وهمية فقط' : 'Simulated payment — dummy data only'}</div>
          <div className="flex gap-3">
            <button onClick={handleCancel} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">{t('cancel')}</button>
            <button onClick={handleConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {loading ? t('loading') : t('confirmPayment')}
            </button>
          </div>
        </div>
      )}

      {step === 3 && payment && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={44} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{t('paymentSuccess')}</h2>
          <p className="text-gray-500">{t('paymentSuccessMsg')}</p>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{t('referenceNumber')}</p>
            <p className="font-mono font-bold text-green-700 text-lg">{payment.referenceNumber}</p>
          </div>
          <button onClick={() => navigate('/player/bookings')} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors">
            {t('viewMyBookings')}
          </button>
        </div>
      )}
    </div>
  );
}
