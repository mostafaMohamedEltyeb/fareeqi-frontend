import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllMatches, createMatch, updateMatch, deleteMatch } from '../../api/matches';
import { fmtDateTime } from '../../utils/date';
import { getAllTeams } from '../../api/teams';
import { getPlaygrounds } from '../../api/playgrounds';
import type { MatchResponse, TeamResponse, PlaygroundResponse } from '../../types';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ConfirmModal from '../../components/shared/ConfirmModal';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Swords } from 'lucide-react';

export default function AdminMatches() {
  const { t, i18n } = useTranslation();
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [playgrounds, setPlaygrounds] = useState<PlaygroundResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | 'create' | 'edit'>(null);
  const [editItem, setEditItem] = useState<MatchResponse | null>(null);
  const [form, setForm] = useState({ team1Id: '', team2Id: '', playgroundId: '', matchDate: '', status: 'SCHEDULED' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetch = () => { setLoading(true); getAllMatches().then((r) => setMatches(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); getAllTeams().then((r) => setTeams(r.data)); getPlaygrounds().then((r) => setPlaygrounds(r.data)); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { team1Id: Number(form.team1Id), team2Id: Number(form.team2Id), playgroundId: Number(form.playgroundId), matchDate: form.matchDate, status: form.status };
      if (modal === 'create') await createMatch(payload);
      else if (editItem) await updateMatch(editItem.id, payload);
      toast.success(i18n.language === 'ar' ? 'تم الحفظ!' : 'Saved!');
      setModal(null); fetch();
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteMatch(deleteId); toast.success(i18n.language === 'ar' ? 'تم الحذف' : 'Deleted'); setDeleteId(null); fetch(); }
    catch (err: any) { toast.error(err.displayMessage); }
  };

  const fmt = fmtDateTime;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t('matches')}</h1>
        <button onClick={() => { setForm({ team1Id:'', team2Id:'', playgroundId:'', matchDate:'', status:'SCHEDULED' }); setModal('create'); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={18}/>{t('scheduleMatch')}
        </button>
      </div>
      {loading ? <LoadingSkeleton rows={4} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={m.status}/>
                <div className="flex gap-2">
                  <button onClick={() => { setEditItem(m); setForm({ team1Id: String(m.team1Id), team2Id: String(m.team2Id), playgroundId: String(m.playgroundId), matchDate: m.matchDate, status: m.status }); setModal('edit'); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Pencil size={14}/></button>
                  <button onClick={() => setDeleteId(m.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 size={14}/></button>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 my-3">
                <p className="font-bold text-gray-800">{m.team1Name}</p>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center"><Swords size={16} className="text-orange-600"/></div>
                <p className="font-bold text-gray-800">{m.team2Name}</p>
              </div>
              <p className="text-xs text-gray-500 text-center">{m.playgroundName} · {fmt(m.matchDate)}</p>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-800 text-lg mb-4">{modal === 'create' ? t('scheduleMatch') : t('edit')}</h3>
            <div className="space-y-3">
              {[['team1Id', t('team1'), teams], ['team2Id', t('team2'), teams], ['playgroundId', t('playground'), playgrounds]].map(([key, label, opts]: any) => (
                <select key={key} value={form[key as keyof typeof form]} onChange={(e) => setForm({...form, [key]: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  <option value="">{label}</option>
                  {opts.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              ))}
              <input type="datetime-local" value={form.matchDate} onChange={(e) => setForm({...form, matchDate:e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
              {modal === 'edit' && (
                <select value={form.status} onChange={(e) => setForm({...form, status:e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  <option value="SCHEDULED">{t('scheduled')}</option>
                  <option value="COMPLETED">{t('completed')}</option>
                  <option value="CANCELLED">{t('cancelled')}</option>
                </select>
              )}
            </div>
            <div className="flex gap-3 mt-5">
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
