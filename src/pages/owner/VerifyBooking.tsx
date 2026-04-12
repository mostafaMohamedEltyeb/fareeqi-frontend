import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { verifyQrCode } from '../../api/bookings';
import { fmtDateTime } from '../../utils/date';
import type { BookingResponse } from '../../types';
import StatusBadge from '../../components/shared/StatusBadge';
import toast from 'react-hot-toast';
import { QrCode, CheckCircle2, User, MapPin, Clock, ScanLine } from 'lucide-react';

export default function VerifyBooking() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [qrInput, setQrInput] = useState('');
  const [result, setResult] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const isRTL = i18n.language === 'ar';

  const fmt = fmtDateTime;

  const doVerify = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await verifyQrCode(code.trim());
      setResult(res.data);
      toast.success(isRTL ? 'تم تسجيل الدخول بنجاح ✅' : 'Check-in successful ✅');
    } catch (err: any) {
      toast.error(err.displayMessage || (isRTL ? 'رمز غير صالح أو الحجز غير مؤهل' : 'Invalid QR or booking not eligible'));
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify when opened via QR scan (URL contains ?code=...)
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setQrInput(code);
      doVerify(code);
    }
  }, []);

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-xl"><QrCode size={22} className="text-green-700" /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('verifyBooking')}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{isRTL ? 'امسح رمز QR أو أدخله يدوياً' : 'Scan QR or enter code manually'}</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3">
        <ScanLine size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-green-800 space-y-1">
          <p className="font-semibold">{isRTL ? 'كيف يعمل؟' : 'How it works?'}</p>
          <p>{isRTL ? '١. اطلب من اللاعب فتح تفاصيل حجزه في التطبيق' : '1. Ask the player to open their booking details in the app'}</p>
          <p>{isRTL ? '٢. وجّه كاميرا هاتفك نحو رمز QR الخاص به' : '2. Point your phone camera at their QR code'}</p>
          <p>{isRTL ? '٣. سيفتح التطبيق تلقائياً ويؤكد الدخول' : '3. The app opens automatically and confirms check-in'}</p>
        </div>
      </div>

      {/* Manual input */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
        <p className="text-sm font-medium text-gray-700">{isRTL ? 'أو أدخل الرمز يدوياً' : 'Or enter the code manually'}</p>
        <div className="flex gap-2">
          <input
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doVerify(qrInput)}
            placeholder={t('enterQrCode')}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
          />
          <button
            onClick={() => doVerify(qrInput)}
            disabled={loading || !qrInput.trim()}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors min-w-[80px]"
          >
            {loading ? '...' : t('verifyBtn')}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl border-2 border-green-400 shadow-sm p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <CheckCircle2 size={28} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-green-700 text-lg">{t('checkedIn')} ✅</p>
              <p className="text-xs text-gray-400">{isRTL ? 'تم تسجيل دخول اللاعب بنجاح' : 'Player successfully checked in'}</p>
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
            <div className="flex items-center gap-3 text-sm ms-7">
              <span className="text-gray-500">{t('paymentStatus')}:</span>
              <StatusBadge status={result.paymentStatus} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
