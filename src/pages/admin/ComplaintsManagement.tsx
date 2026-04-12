import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllComplaints, updateComplaint } from '../../api/complaints';
import type { ComplaintResponse, ComplaintStatus } from '../../types';
import toast from 'react-hot-toast';
import { X, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Filter, Send } from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';

const statusConfig: Record<string, { label: string; labelAr: string; color: string; icon: React.ElementType }> = {
  PENDING:   { label: 'Pending',     labelAr: 'معلقة',       color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  IN_REVIEW: { label: 'In Review',   labelAr: 'قيد المراجعة', color: 'bg-blue-100 text-blue-700',   icon: AlertCircle },
  RESOLVED:  { label: 'Resolved',    labelAr: 'تم الحل',      color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CLOSED:    { label: 'Closed',      labelAr: 'مغلقة',        color: 'bg-gray-100 text-gray-600',   icon: XCircle },
};

const typeConfig: Record<string, { label: string; labelAr: string; color: string }> = {
  PLAYER_COMPLAINT: { label: 'Player',  labelAr: 'لاعب',  color: 'bg-blue-50 text-blue-600' },
  OWNER_COMPLAINT:  { label: 'Owner',   labelAr: 'مالك',  color: 'bg-orange-50 text-orange-600' },
};

export default function ComplaintsManagement() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [filtered, setFiltered] = useState<ComplaintResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selected, setSelected] = useState<ComplaintResponse | null>(null);
  const [editStatus, setEditStatus] = useState<ComplaintStatus>('PENDING');
  const [adminComment, setAdminComment] = useState('');
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    getAllComplaints()
      .then((r) => {
        setComplaints(r.data);
        setFiltered(r.data);
      })
      .catch((err) => toast.error(err.displayMessage))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    if (filterStatus === 'ALL') {
      setFiltered(complaints);
    } else {
      setFiltered(complaints.filter((c) => c.status === filterStatus));
    }
  }, [filterStatus, complaints]);

  const openModal = (c: ComplaintResponse) => {
    setSelected(c);
    setEditStatus(c.status);
    setAdminComment(c.adminComment ?? '');
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateComplaint(selected.id, { status: editStatus, adminComment: adminComment || undefined });
      toast.success(isRTL ? 'تم تحديث الشكوى' : 'Complaint updated');
      setSelected(null);
      fetch();
    } catch (err: any) {
      toast.error(err.displayMessage);
    } finally {
      setSaving(false);
    }
  };

  const fmt = (dt: string) => new Date(dt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const counts = {
    ALL: complaints.length,
    PENDING: complaints.filter((c) => c.status === 'PENDING').length,
    IN_REVIEW: complaints.filter((c) => c.status === 'IN_REVIEW').length,
    RESOLVED: complaints.filter((c) => c.status === 'RESOLVED').length,
    CLOSED: complaints.filter((c) => c.status === 'CLOSED').length,
  };

  if (loading) return <LoadingSkeleton rows={8} />;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{t('complaintsManagement')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t('complaintsManagementSubtitle')}</p>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(['ALL', 'PENDING', 'IN_REVIEW', 'RESOLVED', 'CLOSED'] as const).map((s) => {
          const cfg = s === 'ALL' ? null : statusConfig[s];
          const Icon = cfg ? cfg.icon : Filter;
          const isActive = filterStatus === s;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                isActive ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-600 border-gray-100 hover:border-green-300 hover:shadow-sm'
              }`}
            >
              <Icon size={18} />
              <span>{s === 'ALL' ? (isRTL ? 'الكل' : 'All') : (isRTL ? (cfg?.labelAr ?? s) : (cfg?.label ?? s))}</span>
              <span className={`text-xl font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>{counts[s]}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t('noComplaints')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['#', isRTL ? 'المُقدِّم' : 'Complainant', isRTL ? 'النوع' : 'Type', isRTL ? 'الموضوع' : 'Subject', isRTL ? 'الحالة' : 'Status', isRTL ? 'التاريخ' : 'Date', isRTL ? 'الإجراء' : 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => {
                  const sCfg = statusConfig[c.status];
                  const SIcon = sCfg.icon;
                  const tCfg = typeConfig[c.complaintType];
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-400">#{c.id}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-800">{c.complainantUsername}</div>
                        {c.targetUsername && <div className="text-xs text-gray-400">{isRTL ? '← ' : '→ '}{c.targetUsername}</div>}
                        {c.targetPlaygroundName && <div className="text-xs text-blue-500">{c.targetPlaygroundName}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${tCfg.color}`}>
                          {isRTL ? tCfg.labelAr : tCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-800 max-w-[200px] truncate">{c.subject}</div>
                        <div className="text-xs text-gray-400 max-w-[200px] truncate">{c.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${sCfg.color}`}>
                          <SIcon size={11} />
                          {isRTL ? sCfg.labelAr : sCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{fmt(c.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openModal(c)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          {c.status === 'CLOSED' ? (isRTL ? 'عرض' : 'View') : (isRTL ? 'مراجعة' : 'Review')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{isRTL ? 'مراجعة الشكوى' : 'Review Complaint'}</h2>
                <p className="text-xs text-gray-400 mt-0.5">#{selected.id} · {fmt(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
              <div>
                <p className="text-xs text-gray-500">{isRTL ? 'مقدِّم الشكوى' : 'Complainant'}</p>
                <p className="text-sm font-semibold text-gray-800">{selected.complainantUsername}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{isRTL ? 'النوع' : 'Type'}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${typeConfig[selected.complaintType].color}`}>
                  {isRTL ? typeConfig[selected.complaintType].labelAr : typeConfig[selected.complaintType].label}
                </span>
              </div>
              {selected.targetUsername && (
                <div>
                  <p className="text-xs text-gray-500">{isRTL ? 'المستهدف' : 'Target User'}</p>
                  <p className="text-sm text-orange-600">{selected.targetUsername}</p>
                </div>
              )}
              {selected.targetPlaygroundName && (
                <div>
                  <p className="text-xs text-gray-500">{isRTL ? 'الملعب' : 'Playground'}</p>
                  <p className="text-sm text-blue-600">{selected.targetPlaygroundName}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{isRTL ? 'الموضوع' : 'Subject'}</p>
              <p className="text-sm font-semibold text-gray-800">{selected.subject}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{isRTL ? 'التفاصيل' : 'Details'}</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{selected.description}</p>
            </div>

            {/* Admin Actions */}
            {selected.status !== 'CLOSED' ? (
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Send size={14} className="text-green-600" />
                  {isRTL ? 'رد الإدارة' : 'Admin Response'}
                </h3>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{isRTL ? 'تحديث الحالة' : 'Update Status'}</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ComplaintStatus)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="PENDING">{isRTL ? 'معلقة' : 'Pending'}</option>
                    <option value="IN_REVIEW">{isRTL ? 'قيد المراجعة' : 'In Review'}</option>
                    <option value="RESOLVED">{isRTL ? 'تم الحل' : 'Resolved'}</option>
                    <option value="CLOSED">{isRTL ? 'مغلقة' : 'Closed'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {isRTL ? 'تعليق الإدارة' : 'Admin Comment'}
                    <span className="text-gray-400 font-normal"> ({t('optional')})</span>
                  </label>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    rows={3}
                    placeholder={isRTL ? 'اكتب ردك على الشكوى...' : 'Write your response to the complaint...'}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                  >
                    {saving ? t('loading') : (isRTL ? 'حفظ التحديث' : 'Save Update')}
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <XCircle size={16} className="text-gray-400" />
                  <span className="text-sm">{isRTL ? 'هذه الشكوى مغلقة' : 'This complaint is closed'}</span>
                </div>
                {selected.adminComment && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-green-700 mb-1">{isRTL ? 'رد الإدارة:' : 'Admin Response:'}</p>
                    <p className="text-sm text-gray-700">{selected.adminComment}</p>
                  </div>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  {t('close')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
