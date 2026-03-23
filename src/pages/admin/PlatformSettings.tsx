import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSettings, updateSettings } from '../../api/settings';
import type { AppSettingsResponse } from '../../types';
import toast from 'react-hot-toast';
import { Settings2 } from 'lucide-react';

export default function PlatformSettings() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [settings, setSettings] = useState<AppSettingsResponse | null>(null);
  const [form, setForm] = useState({ platformFeePercent: '', cancellationFeePercent: '', featuredSubscriptionPrice: '', featuredSubscriptionDays: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then(r => {
      setSettings(r.data);
      setForm({
        platformFeePercent: String(r.data.platformFeePercent),
        cancellationFeePercent: String(r.data.cancellationFeePercent),
        featuredSubscriptionPrice: String(r.data.featuredSubscriptionPrice),
        featuredSubscriptionDays: String(r.data.featuredSubscriptionDays),
      });
    }).catch(() => toast.error(isRTL ? 'فشل تحميل الإعدادات' : 'Failed to load settings'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await updateSettings({
        platformFeePercent: Number(form.platformFeePercent),
        cancellationFeePercent: Number(form.cancellationFeePercent),
        featuredSubscriptionPrice: Number(form.featuredSubscriptionPrice),
        featuredSubscriptionDays: Number(form.featuredSubscriptionDays),
      });
      setSettings(r.data);
      toast.success(t('settingsSaved'));
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setSaving(false); }
  };

  if (!settings) return <div className="text-center py-20 text-gray-400">{t('loading')}</div>;

  return (
    <div className="max-w-lg space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3">
        <Settings2 size={24} className="text-green-600" />
        <h1 className="text-2xl font-bold text-gray-800">{t('platformSettings')}</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('platformFeePercent')}</label>
          <div className="relative">
            <input type="number" value={form.platformFeePercent} onChange={e => setForm({ ...form, platformFeePercent: e.target.value })}
              min="0" max="100" step="0.1"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pe-8" />
            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{isRTL ? 'تضاف على سعر الفتحة الزمنية في كل معاملة' : 'Added on top of slot price per transaction'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('cancellationFeePercent')}</label>
          <div className="relative">
            <input type="number" value={form.cancellationFeePercent} onChange={e => setForm({ ...form, cancellationFeePercent: e.target.value })}
              min="0" max="100" step="0.1"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pe-8" />
            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{isRTL ? 'تُخصم عند إلغاء حجز مقبول ومدفوع' : 'Charged when an approved + paid booking is cancelled'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('featuredPrice')}</label>
          <div className="relative">
            <input type="number" value={form.featuredSubscriptionPrice} onChange={e => setForm({ ...form, featuredSubscriptionPrice: e.target.value })}
              min="0" step="0.5"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pe-12" />
            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">EGP</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('featuredDays')}</label>
          <input type="number" value={form.featuredSubscriptionDays} onChange={e => setForm({ ...form, featuredSubscriptionDays: e.target.value })}
            min="1"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
          {saving ? t('loading') : t('save')}
        </button>
      </div>
    </div>
  );
}
