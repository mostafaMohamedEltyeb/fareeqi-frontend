import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createComplaint, getMyComplaints } from '../../api/complaints';
import type { ComplaintResponse } from '../../types';
import { fmtDate, fmtDateTime } from '../../utils/date';
import toast from 'react-hot-toast';
import { Plus, X, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';

const emptyForm = { subject: '', description: '', targetUserId: '' };

const statusConfig: Record<string, { label: string; labelAr: string; color: string; icon: React.ElementType }> = {
  PENDING:   { label: 'Pending',     labelAr: 'معلقة',       color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  IN_REVIEW: { label: 'In Review',   labelAr: 'قيد المراجعة', color: 'bg-blue-100 text-blue-700',   icon: AlertCircle },
  RESOLVED:  { label: 'Resolved',    labelAr: 'تم الحل',      color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CLOSED:    { label: 'Closed',      labelAr: 'مغلقة',        color: 'bg-gray-100 text-gray-600',   icon: XCircle },
};

export default function OwnerComplaints() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<ComplaintResponse | null>(null);

  const fetch = () => {
    setLoading(true);
    getMyComplaints()
      .then((r) => setComplaints(r.data))
      .catch((err) => toast.error(err.displayMessage))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.description.trim()) {
      return toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
    }
    setSaving(true);
    try {
      await createComplaint({
        subject: form.subject,
        description: form.description,
        targetUserId: form.targetUserId ? Number(form.targetUserId) : undefined,
      });
      toast.success(isRTL ? 'تم إرسال شكواك بنجاح' : 'Complaint submitted successfully');
      setForm(emptyForm);
      setShowForm(false);
      fetch();
    } catch (err: any) {
      toast.error(err.displayMessage);
    } finally {
      setSaving(false);
    }
  };

  const fmt = fmtDate;

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('myComplaints')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('ownerComplaintsSubtitle')}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? t('cancel') : t('newComplaint')}
        </button>
      </div>

      {/* New Complaint Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <MessageSquare size={18} className="text-green-600" />
            {t('newComplaint')}
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
            {isRTL
              ? 'يمكنك تقديم شكوى ضد أحد اللاعبين الذين أساءوا التصرف في ملعبك.'
              : 'You can submit a complaint against a player who misbehaved at your playground.'}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('complaintSubject')} *</label>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder={isRTL ? 'موضوع الشكوى باختصار' : 'Brief subject of your complaint'}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('complaintDescription')} *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder={isRTL ? 'اشرح الحادثة بالتفصيل...' : 'Describe the incident in detail...'}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {isRTL ? 'رقم اللاعب' : 'Player ID'} ({t('optional')})
              </label>
              <input
                type="number"
                value={form.targetUserId}
                onChange={(e) => setForm({ ...form, targetUserId: e.target.value })}
                placeholder={isRTL ? 'رقم اللاعب (إن وجد)' : 'Player ID (if known)'}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? t('loading') : t('submitComplaint')}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(emptyForm); }}
              className="border border-gray-200 hover:bg-gray-50 text-gray-600 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t('noComplaints')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('noComplaintsHint')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => {
            const cfg = statusConfig[c.status];
            const Icon = cfg.icon;
            return (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-green-200 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">{c.subject}</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                        <Icon size={12} />
                        {isRTL ? cfg.labelAr : cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{c.description}</p>
                    {c.targetUsername && (
                      <p className="text-xs text-orange-600 mt-1">
                        {isRTL ? 'اللاعب: ' : 'Player: '}{c.targetUsername}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{fmt(c.createdAt)}</div>
                </div>
                {c.adminComment && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-green-700 mb-1">
                      {isRTL ? 'رد الإدارة:' : 'Admin Response:'}
                    </p>
                    <p className="text-sm text-gray-600">{c.adminComment}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-bold text-gray-800">{selected.subject}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
            </div>

            {(() => {
              const cfg = statusConfig[selected.status];
              const Icon = cfg.icon;
              return (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${cfg.color}`}>
                  <Icon size={14} />
                  {isRTL ? cfg.labelAr : cfg.label}
                </span>
              );
            })()}

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{t('complaintDescription')}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{selected.description}</p>
            </div>

            {selected.targetUsername && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">{isRTL ? 'اللاعب المعني' : 'Concerned Player'}</p>
                <p className="text-sm text-orange-600">{selected.targetUsername}</p>
              </div>
            )}

            {selected.adminComment && (
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-xs font-medium text-green-700 mb-1">
                  {isRTL ? 'رد الإدارة:' : 'Admin Response:'}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">{selected.adminComment}</p>
              </div>
            )}

            <div className="text-xs text-gray-400">
              {isRTL ? 'تاريخ الإرسال: ' : 'Submitted: '}
              {fmtDateTime(selected.createdAt)}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
