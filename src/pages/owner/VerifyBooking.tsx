import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { verifyQrCode } from '../../api/bookings';
import type { BookingResponse } from '../../types';
import StatusBadge from '../../components/shared/StatusBadge';
import toast from 'react-hot-toast';
import { QrCode, CheckCircle2, User, MapPin, Clock } from 'lucide-react';

export default function VerifyBooking() {
  const { t, i18n } = useTranslation();
  const [qrInput, setQrInput] = useState('');
  const [result, setResult] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const isRTL = i18n.language === 'ar';

  const fmt = (dt: string) => {
    try { return new Date(dt).toLocaleString(isRTL ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return dt; }
  };

  const handleVerify = async () => {
    const code = qrInput.trim();
    if (!code) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await verifyQrCode(code);
      setResult(res.data);
      toast.success(isRTL ? 'تم تسجيل الدخول بنجاح ✅' : 'Check-in successful ✅');
    } catch (err: any) {
      toast.error(err.displayMessage || (isRTL ? 'رمز غير صالح' : 'Invalid QR code'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-xl"><QrCode size={22} className="text-green-700" /></div>
        <h1 className="text-2xl font-bold text-gray-800">{t('verifyBooking')}</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <p className="text-sm text-gray-500">{t('qrInstruction')}</p>
        <div className="flex gap-2">
          <input
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            placeholder={t('enterQrCode')}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
          />
          <button
            onClick={handleVerify}
            disabled={loading || !qrInput.trim()}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors"
          >
            {loading ? '...' : t('verifyBtn')}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-xl border-2 border-green-400 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <CheckCircle2 size={24} className="text-green-600" />
            <div>
              <p className="font-bold text-green-700 text-lg">{t('checkedIn')}</p>
              <p className="text-xs text-gray-400">#{result.id}</p>
            </div>
            <div className="ms-auto"><StatusBadge status={result.status} /></div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-500">{isRTL ? 'اللاعب' : 'Player'}:</span>
              <span className="font-semibold text-gray-800">{result.playerUsername}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-500">{t('playground')}:</span>
              <span className="font-semibold text-gray-800">{result.playgroundName}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-500">{t('slotTime')}:</span>
              <span className="font-semibold text-gray-800">{fmt(result.slotStartTime)} → {fmt(result.slotEndTime)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500 ms-7">{t('paymentStatus')}:</span>
              <StatusBadge status={result.paymentStatus} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
