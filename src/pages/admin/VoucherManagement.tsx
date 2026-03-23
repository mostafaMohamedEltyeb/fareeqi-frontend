import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getVouchers, createVoucher, deleteVoucher, toggleVoucher } from '../../api/vouchers';
import type { VoucherResponse, DiscountType } from '../../types';
import toast from 'react-hot-toast';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const emptyForm = { code: '', discountType: 'PERCENTAGE' as DiscountType, discountValue: '', minBookingAmount: '', maxUses: '0', expiresAt: '' };

export default function VoucherManagement() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = () => { setLoading(true); getVouchers().then(r => setVouchers(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!form.code || !form.discountValue) return toast.error(isRTL ? 'تأكد من ملء الحقول المطلوبة' : 'Fill required fields');
    setSaving(true);
    try {
      await createVoucher({
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minBookingAmount: form.minBookingAmount ? Number(form.minBookingAmount) : null,
        maxUses: Number(form.maxUses),
        expiresAt: form.expiresAt || null,
      });
      toast.success(isRTL ? 'تم إنشاء الكوبون' : 'Voucher created');
      setForm(emptyForm);
      setShowForm(false);
      fetch();
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await deleteVoucher(id); toast.success(isRTL ? 'تم الحذف' : 'Deleted'); fetch(); }
    catch (err: any) { toast.error(err.displayMessage); }
  };

  const handleToggle = async (id: number) => {
    try { await toggleVoucher(id); fetch(); }
    catch (err: any) { toast.error(err.displayMessage); }
  };

  const fmt = (dt: string) => new Date(dt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US');

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t('voucherManagement')}</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} />{t('createVoucher')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">{t('createVoucher')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('voucherCode')} *</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SAVE20" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 uppercase" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('discountType')}</label>
              <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as DiscountType })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="PERCENTAGE">{t('percentage')}</option>
                <option value="FIXED">{t('fixed')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('discountValue')} * {form.discountType === 'PERCENTAGE' ? '(%)' : '(EGP)'}</label>
              <input type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })}
                min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('minBookingAmount')} (EGP)</label>
              <input type="number" value={form.minBookingAmount} onChange={e => setForm({ ...form, minBookingAmount: e.target.value })}
                min="0" placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('maxUses')} (0 = {isRTL ? 'غير محدود' : 'unlimited'})</label>
              <input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })}
                min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('expiresAt')}</label>
              <input type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">{t('cancel')}</button>
            <button onClick={handleCreate} disabled={saving} className="px-6 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {saving ? t('loading') : t('save')}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <p className="text-center py-10 text-gray-400">{t('loading')}</p> : vouchers.length === 0 ? (
          <p className="text-center py-10 text-gray-400">{t('noData')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{[t('voucherCode'), t('discountType'), t('discountValue'), t('minBookingAmount'), t('maxUses'), t('usedCount'), t('expiresAt'), t('status'), t('actions')].map(h => (
                  <th key={h} className="px-4 py-3 text-start font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vouchers.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-gray-800">{v.code}</td>
                    <td className="px-4 py-3 text-gray-500">{v.discountType === 'PERCENTAGE' ? t('percentage') : t('fixed')}</td>
                    <td className="px-4 py-3 text-gray-700">{v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : `EGP ${v.discountValue}`}</td>
                    <td className="px-4 py-3 text-gray-500">{v.minBookingAmount ? `EGP ${v.minBookingAmount}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{v.maxUses === 0 ? '∞' : v.maxUses}</td>
                    <td className="px-4 py-3 text-gray-500">{v.usedCount}</td>
                    <td className="px-4 py-3 text-gray-500">{v.expiresAt ? fmt(v.expiresAt) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {v.active ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggle(v.id)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title={t('toggleVoucher')}>
                          {v.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button onClick={() => handleDelete(v.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
