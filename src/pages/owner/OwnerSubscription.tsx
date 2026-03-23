import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMySubscriptions, subscribePlayground, cancelSubscription } from '../../api/subscriptions';
import { getSettings } from '../../api/settings';
import { getMyPlaygrounds } from '../../api/playgrounds';
import type { PlaygroundSubscriptionResponse, AppSettingsResponse, PlaygroundResponse } from '../../types';
import toast from 'react-hot-toast';
import { Sparkles, X } from 'lucide-react';

export default function OwnerSubscription() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [subscriptions, setSubscriptions] = useState<PlaygroundSubscriptionResponse[]>([]);
  const [playgrounds, setPlaygrounds] = useState<PlaygroundResponse[]>([]);
  const [settings, setSettings] = useState<AppSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlaygroundId, setSelectedPlaygroundId] = useState<number | ''>('');
  const [months, setMonths] = useState(1);
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    Promise.all([getMySubscriptions(), getMyPlaygrounds(), getSettings()])
      .then(([subsR, pgR, settR]) => {
        setSubscriptions(subsR.data);
        setPlaygrounds(pgR.data);
        setSettings(settR.data);
      })
      .catch(() => toast.error(isRTL ? 'فشل تحميل البيانات' : 'Failed to load data'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSubscribe = async () => {
    if (!selectedPlaygroundId) return toast.error(isRTL ? 'اختر ملعباً' : 'Select a playground');
    setSaving(true);
    try {
      await subscribePlayground(Number(selectedPlaygroundId), months);
      toast.success(t('subscriptionCreated'));
      setShowForm(false);
      setSelectedPlaygroundId('');
      setMonths(1);
      fetch();
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setSaving(false); }
  };

  const handleCancel = async (playgroundId: number) => {
    try {
      await cancelSubscription(playgroundId);
      toast.success(t('subscriptionCancelled'));
      fetch();
    } catch (err: any) { toast.error(err.displayMessage); }
  };

  const fmt = (dt: string) => new Date(dt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US');
  const totalCost = settings ? (settings.featuredSubscriptionPrice * months) : 0;

  // Playgrounds that don't already have an active subscription
  const subscribablePlaygrounds = playgrounds.filter(pg => !subscriptions.some(s => s.playgroundId === pg.id));

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={24} className="text-yellow-500" />
          <h1 className="text-2xl font-bold text-gray-800">{t('mySubscription')}</h1>
        </div>
        {subscribablePlaygrounds.length > 0 && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
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

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">{t('subscribePlayground')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('playground')}</label>
              <select value={selectedPlaygroundId} onChange={e => setSelectedPlaygroundId(e.target.value ? Number(e.target.value) : '')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white">
                <option value="">{isRTL ? 'اختر ملعباً' : 'Select playground'}</option>
                {subscribablePlaygrounds.map(pg => <option key={pg.id} value={pg.id}>{pg.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('months')}</label>
              <input type="number" value={months} onChange={e => setMonths(Math.max(1, Number(e.target.value)))}
                min="1" max="12"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
          </div>
          {settings && (
            <div className="bg-yellow-50 rounded-lg p-3 text-sm">
              <span className="font-medium text-yellow-800">
                {isRTL ? `الإجمالي: ${totalCost} جنيه (${months} شهر × ${settings.featuredSubscriptionPrice} جنيه)` :
                  `Total: EGP ${totalCost} (${months} month${months > 1 ? 's' : ''} × EGP ${settings.featuredSubscriptionPrice})`}
              </span>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">{t('cancel')}</button>
            <button onClick={handleSubscribe} disabled={saving || !selectedPlaygroundId} className="px-6 py-2 rounded-lg bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-600 disabled:opacity-50">
              {saving ? t('loading') : t('confirm')}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center py-10 text-gray-400">{t('loading')}</p>
      ) : subscriptions.length === 0 ? (
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
                <button onClick={() => handleCancel(sub.playgroundId)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{t('subscriptionActive')}: <span className="font-medium text-gray-800">{fmt(sub.endDate)}</span></p>
                <p>{isRTL ? 'المبلغ المدفوع:' : 'Paid:'} <span className="font-medium text-gray-800">EGP {sub.amountPaid}</span></p>
                <p className="text-xs text-gray-400">{fmt(sub.startDate)} → {fmt(sub.endDate)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
