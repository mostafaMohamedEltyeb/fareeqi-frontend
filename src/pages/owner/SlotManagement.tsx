import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSlots, createSlot, updateSlot, deleteSlot, getPlaygroundById } from '../../api/playgrounds';
import { fmtDateTime } from '../../utils/date';
import type { SlotResponse } from '../../types';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ConfirmModal from '../../components/shared/ConfirmModal';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ArrowLeft, ArrowRight, Users } from 'lucide-react';

const emptyForm = { startTime: '', endTime: '', pricePerHour: '', capacity: '1', status: 'AVAILABLE' };

const PRESETS_BY_SPORT: Record<string, { key: string; value: number }[]> = {
  PADEL: [
    { key: 'padel', value: 4 },
  ],
  FOOTBALL: [
    { key: 'football5', value: 10 },
    { key: 'football7', value: 14 },
    { key: 'football11', value: 22 },
  ],
};

export default function SlotManagement() {
  const { t, i18n } = useTranslation();
  const { playgroundId } = useParams<{ playgroundId: string }>();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<SlotResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | 'create' | 'edit'>(null);
  const [editItem, setEditItem] = useState<SlotResponse | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sportType, setSportType] = useState<string>('');
  const isRTL = i18n.language === 'ar';
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const fetch = () => { if (playgroundId) { setLoading(true); getSlots(Number(playgroundId)).then((r) => setSlots(r.data)).finally(() => setLoading(false)); } };
  useEffect(() => {
    fetch();
    if (playgroundId) getPlaygroundById(Number(playgroundId)).then((r) => setSportType(r.data.sportType));
  }, [playgroundId]);

  const presets = PRESETS_BY_SPORT[sportType] ?? [];

  const handleSave = async () => {
    if (!playgroundId) return;
    setSaving(true);
    try {
      const payload = { ...form, pricePerHour: Number(form.pricePerHour), capacity: Number(form.capacity) };
      if (modal === 'create') await createSlot(Number(playgroundId), payload);
      else if (editItem) await updateSlot(Number(playgroundId), editItem.id, payload);
      toast.success(i18n.language === 'ar' ? 'تم الحفظ!' : 'Saved!');
      setModal(null); fetch();
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId || !playgroundId) return;
    try { await deleteSlot(Number(playgroundId), deleteId); toast.success(i18n.language === 'ar' ? 'تم الحذف' : 'Deleted'); setDeleteId(null); fetch(); }
    catch (err: any) { toast.error(err.displayMessage); }
  };

  const fmt = fmtDateTime;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"><BackIcon size={16}/>{t('back')}</button>
        <h1 className="text-2xl font-bold text-gray-800">{t('manageSlots')}</h1>
      </div>
      <div className="flex justify-end">
        <button onClick={() => { setForm(emptyForm); setModal('create'); }} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={18}/>{t('addSlot')}
        </button>
      </div>
      {loading ? <LoadingSkeleton /> : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {slots.length === 0 ? <p className="text-center text-gray-400 py-16">{t('noData')}</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{[t('startTime'), t('endTime'), t('slotCapacity'), t('status'), t('pricePerHour'), t('actions')].map((h) => (
                    <th key={h} className="px-4 py-3 text-start font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {slots.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-700">{fmt(s.startTime)}</td>
                      <td className="px-4 py-3 text-gray-700">{fmt(s.endTime)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Users size={13} className="text-gray-400" />
                          <span className="text-gray-700">{s.currentParticipants}/{s.capacity}</span>
                          {s.capacity > 1 && (
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${(s.currentParticipants/s.capacity)*100}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={s.status}/></td>
                      <td className="px-4 py-3 font-semibold text-green-700">{s.pricePerHour} EGP</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditItem(s); setForm({ startTime: s.startTime, endTime: s.endTime, pricePerHour: String(s.pricePerHour), capacity: String(s.capacity), status: s.status }); setModal('edit'); }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Pencil size={14}/></button>
                          <button onClick={() => setDeleteId(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">{modal === 'create' ? t('addSlot') : t('editSlot')}</h3>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">{t('startTime')}</label>
                <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">{t('endTime')}</label>
                <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">{t('pricePerHour')}</label>
                <input type="number" value={form.pricePerHour} onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/></div>

              {/* Capacity with presets */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('slotCapacity')}</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {presets.map(p => (
                    <button key={p.key} type="button"
                      onClick={() => setForm({ ...form, capacity: String(p.value) })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${String(form.capacity) === String(p.value) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}>
                      {t(p.key)}
                    </button>
                  ))}
                </div>
                <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  min="1" max="50"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
              </div>

              {modal === 'edit' && (
                <div><label className="block text-xs font-medium text-gray-600 mb-1">{t('slotStatus')}</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                    <option value="AVAILABLE">{t('available')}</option>
                    <option value="RESERVED">{t('reserved')}</option>
                    <option value="DISABLED">{t('disabled')}</option>
                  </select></div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">{t('cancel')}</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {saving ? t('loading') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal open={!!deleteId} message={t('confirmDelete')} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
