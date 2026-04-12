import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
} from '../../api/announcements';
import type { AnnouncementResponse, AnnouncementTarget, BadgeColor } from '../../types';
import { fmtDate } from '../../utils/date';
import toast from 'react-hot-toast';
import {
  Plus, X, Pencil, Trash2, Megaphone, Tag, ToggleLeft, ToggleRight, Eye, EyeOff,
} from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';

const BADGE_COLORS: { value: BadgeColor; labelAr: string; label: string; cls: string }[] = [
  { value: 'green',  label: 'Green',  labelAr: 'أخضر',  cls: 'bg-green-500' },
  { value: 'blue',   label: 'Blue',   labelAr: 'أزرق',   cls: 'bg-blue-500' },
  { value: 'orange', label: 'Orange', labelAr: 'برتقالي', cls: 'bg-orange-500' },
  { value: 'red',    label: 'Red',    labelAr: 'أحمر',   cls: 'bg-red-500' },
];

const TARGET_OPTIONS: { value: AnnouncementTarget; label: string; labelAr: string }[] = [
  { value: 'ALL',     label: 'Everyone',          labelAr: 'الجميع' },
  { value: 'PLAYERS', label: 'Players only',      labelAr: 'اللاعبون فقط' },
  { value: 'OWNERS',  label: 'Field owners only', labelAr: 'الملاك فقط' },
];

const COLOR_MAP: Record<BadgeColor, { banner: string; badge: string; code: string }> = {
  green:  { banner: 'bg-green-50 border-green-200',   badge: 'bg-green-600 text-white',  code: 'bg-green-100 text-green-800 border-green-300' },
  blue:   { banner: 'bg-blue-50 border-blue-200',     badge: 'bg-blue-600 text-white',   code: 'bg-blue-100 text-blue-800 border-blue-300' },
  orange: { banner: 'bg-orange-50 border-orange-200', badge: 'bg-orange-500 text-white', code: 'bg-orange-100 text-orange-800 border-orange-300' },
  red:    { banner: 'bg-red-50 border-red-200',       badge: 'bg-red-600 text-white',    code: 'bg-red-100 text-red-800 border-red-300' },
};

const emptyForm = {
  title: '', message: '', voucherCode: '',
  badgeColor: 'green' as BadgeColor,
  targetAudience: 'ALL' as AnnouncementTarget,
  startDate: '', endDate: '',
};

export default function AnnouncementsManagement() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AnnouncementResponse | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const fetch = () => {
    setLoading(true);
    getAllAnnouncements()
      .then((r) => setAnnouncements(r.data))
      .catch((err) => toast.error(err.displayMessage))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setPreview(false);
  };

  const openEdit = (a: AnnouncementResponse) => {
    setEditing(a);
    setForm({
      title: a.title,
      message: a.message,
      voucherCode: a.voucherCode ?? '',
      badgeColor: a.badgeColor as BadgeColor,
      targetAudience: a.targetAudience,
      startDate: a.startDate ? a.startDate.slice(0, 16) : '',
      endDate: a.endDate ? a.endDate.slice(0, 16) : '',
    });
    setShowForm(true);
    setPreview(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      return toast.error(isRTL ? 'يرجى ملء العنوان والرسالة' : 'Title and message are required');
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        message: form.message,
        voucherCode: form.voucherCode || undefined,
        badgeColor: form.badgeColor,
        targetAudience: form.targetAudience,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      };
      if (editing) {
        await updateAnnouncement(editing.id, payload);
        toast.success(isRTL ? 'تم تحديث الإعلان' : 'Announcement updated');
      } else {
        await createAnnouncement(payload);
        toast.success(isRTL ? 'تم نشر الإعلان' : 'Announcement published');
      }
      setShowForm(false);
      setEditing(null);
      fetch();
    } catch (err: any) {
      toast.error(err.displayMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (a: AnnouncementResponse) => {
    try {
      await updateAnnouncement(a.id, { active: !a.active });
      fetch();
    } catch (err: any) {
      toast.error(err.displayMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(isRTL ? 'هل أنت متأكد من حذف الإعلان؟' : 'Delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      toast.success(isRTL ? 'تم الحذف' : 'Deleted');
      fetch();
    } catch (err: any) {
      toast.error(err.displayMessage);
    }
  };

  const fmt = (dt?: string) =>
    dt ? fmtDate(dt) : '—';

  if (loading) return <LoadingSkeleton rows={6} />;

  const previewColor = COLOR_MAP[form.badgeColor] ?? COLOR_MAP.green;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('announcementsManagement')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('announcementsSubtitle')}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          {t('newAnnouncement')}
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          {/* Form header */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Megaphone size={18} className="text-green-600" />
              {editing ? t('editAnnouncement') : t('newAnnouncement')}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreview(!preview)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                {preview ? <EyeOff size={13} /> : <Eye size={13} />}
                {preview ? (isRTL ? 'إخفاء المعاينة' : 'Hide preview') : (isRTL ? 'معاينة' : 'Preview')}
              </button>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Live preview */}
          {preview && (
            <div className={`flex items-start gap-3 border rounded-xl px-4 py-3 ${previewColor.banner}`}>
              <span className={`flex-shrink-0 p-1.5 rounded-lg ${previewColor.badge}`}>
                <Megaphone size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{form.title || (isRTL ? 'عنوان الإعلان' : 'Announcement title')}</p>
                <p className="text-sm text-gray-600 mt-0.5">{form.message || (isRTL ? 'نص الرسالة…' : 'Message body…')}</p>
                {form.voucherCode && (
                  <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg border text-sm font-mono font-bold ${previewColor.code}`}>
                    <Tag size={13} />
                    <span>{form.voucherCode}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('announcementTitle')} *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={isRTL ? 'عنوان الإعلان' : 'Announcement title'}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('announcementMessage')} *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                placeholder={isRTL ? 'نص الإعلان للمستخدمين...' : 'Announcement body for users...'}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('discountCode')} <span className="text-gray-400 font-normal">({t('optional')})</span>
              </label>
              <input
                value={form.voucherCode}
                onChange={(e) => setForm({ ...form, voucherCode: e.target.value.toUpperCase() })}
                placeholder="SAVE20"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('targetAudience')}</label>
              <select
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value as AnnouncementTarget })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {TARGET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{isRTL ? o.labelAr : o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">{t('badgeColor')}</label>
              <div className="flex gap-2">
                {BADGE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm({ ...form, badgeColor: c.value })}
                    title={isRTL ? c.labelAr : c.label}
                    className={`w-7 h-7 rounded-full ${c.cls} transition-all ${form.badgeColor === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-60 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('startDate')} <span className="text-gray-400 font-normal">({t('optional')})</span>
              </label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('endDate')} <span className="text-gray-400 font-normal">({t('optional')})</span>
              </label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {saving ? t('loading') : editing ? t('save') : t('publish')}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditing(null); }}
              className="border border-gray-200 hover:bg-gray-50 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Announcements list */}
      {announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Megaphone size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{isRTL ? 'لا توجد إعلانات بعد' : 'No announcements yet'}</p>
          <p className="text-gray-400 text-sm mt-1">{isRTL ? 'أنشئ إعلانك الأول' : 'Create your first announcement'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const color = COLOR_MAP[a.badgeColor as BadgeColor] ?? COLOR_MAP.green;
            const target = TARGET_OPTIONS.find((o) => o.value === a.targetAudience);
            return (
              <div key={a.id} className={`border rounded-xl p-4 transition-opacity ${!a.active ? 'opacity-50' : ''} ${color.banner}`}>
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 p-1.5 rounded-lg ${color.badge}`}>
                    <Megaphone size={15} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-800">{a.title}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {isRTL ? target?.labelAr : target?.label}
                      </span>
                      {!a.active && (
                        <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                          {isRTL ? 'معطّل' : 'Inactive'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{a.message}</p>
                    {a.voucherCode && (
                      <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${color.code}`}>
                        <Tag size={11} />
                        {a.voucherCode}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      {a.startDate && <span>{isRTL ? 'من: ' : 'From: '}{fmt(a.startDate)}</span>}
                      {a.endDate   && <span>{isRTL ? 'حتى: ' : 'Until: '}{fmt(a.endDate)}</span>}
                      {!a.startDate && !a.endDate && <span>{isRTL ? 'بدون انتهاء' : 'No expiry'}</span>}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggle(a)}
                      title={a.active ? (isRTL ? 'إيقاف' : 'Deactivate') : (isRTL ? 'تفعيل' : 'Activate')}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-white/60 transition-colors"
                    >
                      {a.active ? <ToggleRight size={18} className="text-green-600" /> : <ToggleLeft size={18} />}
                    </button>
                    <button
                      onClick={() => openEdit(a)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-white/60 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white/60 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
