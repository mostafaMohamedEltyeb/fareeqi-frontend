import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMySubscriptions, getMySubscriptionHistory, subscribePlayground, cancelSubscription } from '../../api/subscriptions';
import { fmtDate } from '../../utils/date';
import { getSettings } from '../../api/settings';
import { getMyPlaygrounds } from '../../api/playgrounds';
import type { PlaygroundSubscriptionResponse, AppSettingsResponse, PlaygroundResponse } from '../../types';
import toast from 'react-hot-toast';
import { Sparkles, X, CreditCard, Lock, CheckCircle, History } from 'lucide-react';

type Step = 'list' | 'review' | 'pay' | 'success';

export default function OwnerSubscription() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [subscriptions, setSubscriptions] = useState<PlaygroundSubscriptionResponse[]>([]);
  const [history, setHistory] = useState<PlaygroundSubscriptionResponse[]>([]);
  const [playgrounds, setPlaygrounds] = useState<PlaygroundResponse[]>([]);
  const [settings, setSettings] = useState<AppSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('list');
  const [selectedPlaygroundId, setSelectedPlaygroundId] = useState<number | ''>('');
  const [months, setMonths] = useState(1);
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [saving, setSaving] = useState(false);
  const [lastSub, setLastSub] = useState<PlaygroundSubscriptionResponse | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([getMySubscriptions(), getMySubscriptionHistory(), getMyPlaygrounds(), getSettings()])
      .then(([subsR, histR, pgR, settR]) => {
        setSubscriptions(subsR.data);
        setHistory(histR.data);
        setPlaygrounds(pgR.data);
        setSettings(settR.data);
      })
      .catch(() => toast.error(isRTL ? 'فشل تحميل البيانات' : 'Failed to load data'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const subscribablePlaygrounds = playgrounds.filter(pg => !subscriptions.some(s => s.playgroundId === pg.id));
  const totalCost = settings ? settings.featuredSubscriptionPrice * months : 0;
  const selectedPg = playgrounds.find(pg => pg.id === selectedPlaygroundId);

  const handleConfirmPay = async () => {
    if (!selectedPlaygroundId) return;
    setSaving(true);
    try {
      const r = await subscribePlayground(Number(selectedPlaygroundId), months);
      setLastSub(r.data);
      setStep('success');
      load();
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setSaving(false); }
  };

  const handleCancel = async (playgroundId: number) => {
    try {
      await cancelSubscription(playgroundId);
      toast.success(t('subscriptionCancelled'));
      load();
    } catch (err: any) { toast.error(err.displayMessage); }
  };

  const resetForm = () => {
    setStep('list');
    setSelectedPlaygroundId('');
    setMonths(1);
    setCard({ number: '', expiry: '', cvv: '' });
  };

  const fmt = fmtDate;

  if (loading) return <p className="text-center py-10 text-gray-400">{t('loading')}</p>;

  // ── Step 3: Success ─────────────────────────────────────────────────────────
  if (step === 'success' && lastSub) return (
    <div className="max-w-md mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={44} className="text-yellow-500" />
        </div>
        <Sparkles size={24} className="text-yellow-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">
          {isRTL ? 'تم تفعيل الاشتراك!' : 'Subscription Activated!'}
        </h2>
        <p className="text-gray-500 text-sm">
          {isRTL
            ? `ملعب "${lastSub.playgroundName}" أصبح مميزاً حتى ${fmt(lastSub.endDate)}`
            : `"${lastSub.playgroundName}" is now featured until ${fmt(lastSub.endDate)}`}
        </p>
        <div className="bg-yellow-50 rounded-xl p-4 text-sm space-y-1">
          <div className="flex justify-between text-gray-600">
            <span>{isRTL ? 'المبلغ المدفوع' : 'Amount Paid'}</span>
            <span className="font-bold text-yellow-700">EGP {lastSub.amountPaid}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-xs">
            <span>{isRTL ? 'صالح حتى' : 'Valid until'}</span>
            <span>{fmt(lastSub.endDate)}</span>
          </div>
        </div>
        <button onClick={resetForm} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-xl transition-colors">
          {isRTL ? 'العودة إلى اشتراكاتي' : 'Back to My Subscriptions'}
        </button>
      </div>
    </div>
  );

  // ── Step 2: Payment ─────────────────────────────────────────────────────────
  if (step === 'pay') return (
    <div className="max-w-md mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <CreditCard size={20} className="text-yellow-500" />
          {isRTL ? 'تأكيد الدفع' : 'Confirm Payment'}
        </h2>

        {/* Order summary */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>{isRTL ? 'الملعب' : 'Playground'}</span>
            <span className="font-semibold">{selectedPg?.name}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>{t('months')}</span>
            <span>{months}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>{isRTL ? 'السعر / شهر' : 'Price / month'}</span>
            <span>EGP {settings?.featuredSubscriptionPrice}</span>
          </div>
          <div className="border-t border-yellow-200 pt-2 flex justify-between font-bold text-gray-800">
            <span>{t('totalAmount')}</span>
            <span className="text-yellow-600 text-lg">EGP {totalCost}</span>
          </div>
        </div>

        {/* Card inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('cardNumber')}</label>
            <input value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} maxLength={19}
              placeholder="•••• •••• •••• ••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('expiry')}</label>
              <input value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} maxLength={5}
                placeholder="MM/YY"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('cvv')}</label>
              <input value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value })} maxLength={3}
                placeholder="•••" type="password"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400"><Lock size={12} />{isRTL ? 'محاكاة دفع — بيانات وهمية فقط' : 'Simulated payment — dummy data only'}</div>

        <div className="flex gap-3">
          <button onClick={() => setStep('review')} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">{t('back')}</button>
          <button onClick={handleConfirmPay} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-600 disabled:opacity-50 flex items-center justify-center gap-2">
            <Sparkles size={16} />
            {saving ? t('loading') : (isRTL ? 'ادفع وفعّل الاشتراك' : 'Pay & Activate')}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step 1: Review ──────────────────────────────────────────────────────────
  if (step === 'review') return (
    <div className="max-w-md mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles size={20} className="text-yellow-500" />
          {t('subscribePlayground')}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('playground')}</label>
            <select value={selectedPlaygroundId} onChange={e => setSelectedPlaygroundId(e.target.value ? Number(e.target.value) : '')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white">
              <option value="">{isRTL ? 'اختر ملعباً' : 'Select playground'}</option>
              {subscribablePlaygrounds.map(pg => <option key={pg.id} value={pg.id}>{pg.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('months')}</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setMonths(m => Math.max(1, m - 1))} className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-lg">−</button>
              <span className="text-lg font-bold text-gray-800 w-8 text-center">{months}</span>
              <button onClick={() => setMonths(m => Math.min(12, m + 1))} className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-lg">+</button>
              <span className="text-sm text-gray-500">{isRTL ? 'أشهر' : 'month(s)'}</span>
            </div>
          </div>
        </div>

        {settings && selectedPlaygroundId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{isRTL ? 'السعر / شهر' : 'Price / month'}</span>
              <span>EGP {settings.featuredSubscriptionPrice}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('months')}</span>
              <span>× {months}</span>
            </div>
            <div className="border-t border-yellow-200 pt-2 flex justify-between font-bold text-gray-800">
              <span>{t('totalAmount')}</span>
              <span className="text-yellow-600 text-lg">EGP {totalCost}</span>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
          {isRTL
            ? 'ملعبك سيظهر في المقدمة مع شارة "مميز" ✨ لكل اللاعبين الباحثين عن ملاعب.'
            : 'Your playground will appear first with a "Featured" badge ✨ for all players browsing playgrounds.'}
        </div>

        <div className="flex gap-3">
          <button onClick={resetForm} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">{t('cancel')}</button>
          <button onClick={() => setStep('pay')} disabled={!selectedPlaygroundId}
            className="flex-1 py-2.5 rounded-xl bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-600 disabled:opacity-50 flex items-center justify-center gap-2">
            <CreditCard size={16} />
            {isRTL ? 'المتابعة للدفع' : 'Proceed to Pay'}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step 0: Main list ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={24} className="text-yellow-500" />
          <h1 className="text-2xl font-bold text-gray-800">{t('mySubscription')}</h1>
        </div>
        {subscribablePlaygrounds.length > 0 && (
          <button onClick={() => setStep('review')}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Sparkles size={16} />{t('subscribeFeatured')}
          </button>
        )}
      </div>

      {settings && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          {isRTL
            ? `الإبراز المميز: ${settings.featuredSubscriptionPrice} جنيه/شهر — يجعل ملعبك يظهر في المقدمة مع شارة "مميز" ✨`
            : `Featured promotion: EGP ${settings.featuredSubscriptionPrice}/month — your playground appears first with a "Featured" badge ✨`}
        </div>
      )}

      {/* Active subscriptions */}
      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
          <Sparkles size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">{t('noSubscription')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.map(sub => (
            <div key={sub.id} className="bg-white rounded-xl border border-yellow-200 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={16} className="text-yellow-500" />
                    <h3 className="font-bold text-gray-800">{sub.playgroundName}</h3>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">{t('featuredBadge')}</span>
                </div>
                <button onClick={() => handleCancel(sub.playgroundId)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title={t('cancel')}>
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{t('subscriptionActive')}: <span className="font-medium text-gray-800">{fmt(sub.endDate)}</span></p>
                <p>{isRTL ? 'المبلغ المدفوع:' : 'Paid:'} <span className="font-bold text-yellow-600">EGP {sub.amountPaid}</span></p>
                <p className="text-xs text-gray-400">{fmt(sub.startDate)} → {fmt(sub.endDate)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment history */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <History size={18} />
            <h2>{isRTL ? 'سجل المدفوعات' : 'Payment History'}</h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    isRTL ? 'الملعب' : 'Playground',
                    isRTL ? 'المبلغ' : 'Amount',
                    isRTL ? 'من' : 'From',
                    isRTL ? 'إلى' : 'To',
                    isRTL ? 'الحالة' : 'Status',
                  ].map(h => (
                    <th key={h} className="px-4 py-3 text-start font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{sub.playgroundName}</td>
                    <td className="px-4 py-3 font-bold text-yellow-600">EGP {sub.amountPaid}</td>
                    <td className="px-4 py-3 text-gray-500">{fmt(sub.startDate)}</td>
                    <td className="px-4 py-3 text-gray-500">{fmt(sub.endDate)}</td>
                    <td className="px-4 py-3">
                      {sub.active
                        ? <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{t('active')}</span>
                        : <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium">{t('inactive')}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
