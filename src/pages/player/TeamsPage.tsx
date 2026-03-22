import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllTeams, createTeam, updateTeam, deleteTeam } from '../../api/teams';
import type { TeamResponse } from '../../types';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Trophy } from 'lucide-react';

export default function TeamsPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | 'create' | 'edit'>(null);
  const [editTeam, setEditTeam] = useState<TeamResponse | null>(null);
  const [form, setForm] = useState({ name: '', sportType: 'FOOTBALL', score: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = () => { setLoading(true); getAllTeams().then((r) => setTeams(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setForm({ name: '', sportType: 'FOOTBALL', score: 0 }); setModal('create'); };
  const openEdit = (team: TeamResponse) => { setEditTeam(team); setForm({ name: team.name, sportType: team.sportType, score: team.score }); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') await createTeam(form);
      else if (editTeam) await updateTeam(editTeam.id, form);
      toast.success(i18n.language === 'ar' ? 'تم الحفظ!' : 'Saved!');
      setModal(null); fetch();
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteTeam(deleteId); toast.success(i18n.language === 'ar' ? 'تم الحذف' : 'Deleted'); setDeleteId(null); fetch(); }
    catch (err: any) { toast.error(err.displayMessage); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t('teams')}</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={18} />{t('createTeam')}
        </button>
      </div>
      {loading ? <LoadingSkeleton rows={4} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.length === 0 ? <div className="col-span-3 text-center text-gray-400 py-16">{t('noData')}</div> :
            teams.map((team) => (
              <div key={team.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><Trophy size={24} className="text-green-600" /></div>
                  {team.captainUsername === user?.username && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(team)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(team.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800">{team.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('captain')}: {team.captainUsername}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{team.sportType}</span>
                  <span className="text-sm font-bold text-green-700">{t('score')}: {team.score}</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-800 text-lg mb-4">{modal === 'create' ? t('createTeam') : t('editTeam')}</h3>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('name')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <select value={form.sportType} onChange={(e) => setForm({ ...form, sportType: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="FOOTBALL">{t('football')}</option>
                <option value="PADEL">{t('padel')}</option>
              </select>
              <input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} placeholder={t('score')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
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
      <ConfirmModal open={!!deleteId} message={t('confirmDelete')} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}
