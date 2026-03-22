import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllMatches, createMatch } from '../../api/matches';
import { getAllTeams } from '../../api/teams';
import { getPlaygrounds } from '../../api/playgrounds';
import type { MatchResponse, TeamResponse, PlaygroundResponse } from '../../types';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import StatusBadge from '../../components/shared/StatusBadge';
import toast from 'react-hot-toast';
import { Plus, Swords } from 'lucide-react';

export default function MatchesPage() {
  const { t, i18n } = useTranslation();
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [playgrounds, setPlaygrounds] = useState<PlaygroundResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ team1Id: '', team2Id: '', playgroundId: '', matchDate: '' });
  const [saving, setSaving] = useState(false);

  const fetch = () => { setLoading(true); getAllMatches().then((r) => setMatches(r.data)).finally(() => setLoading(false)); };
  useEffect(() => {
    fetch();
    getAllTeams().then((r) => setTeams(r.data));
    getPlaygrounds().then((r) => setPlaygrounds(r.data));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createMatch({ team1Id: Number(form.team1Id), team2Id: Number(form.team2Id), playgroundId: Number(form.playgroundId), matchDate: form.matchDate });
      toast.success(i18n.language === 'ar' ? 'تم جدولة المباراة!' : 'Match scheduled!');
      setModal(false); fetch();
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setSaving(false); }
  };

  const fmt = (dt: string) => { try { return new Date(dt).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }); } catch { return dt; } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t('matches')}</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={18} />{t('scheduleMatch')}
        </button>
      </div>
      {loading ? <LoadingSkeleton rows={4} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.length === 0 ? <div className="col-span-2 text-center text-gray-400 py-16">{t('noData')}</div> :
            matches.map((m) => (
              <div key={m.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge status={m.status} />
                  <span className="text-xs text-gray-400">{fmt(m.matchDate)}</span>
                </div>
                <div className="flex items-center justify-center gap-4 my-3">
                  <div className="text-center"><p className="font-bold text-gray-800">{m.team1Name}</p></div>
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center"><Swords size={18} className="text-orange-600" /></div>
                  <div className="text-center"><p className="font-bold text-gray-800">{m.team2Name}</p></div>
                </div>
                <p className="text-xs text-gray-500 text-center">{m.playgroundName}</p>
              </div>
            ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-800 text-lg mb-4">{t('scheduleMatch')}</h3>
            <div className="space-y-3">
              <select value={form.team1Id} onChange={(e) => setForm({ ...form, team1Id: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="">{t('team1')}</option>
                {teams.map((t2) => <option key={t2.id} value={t2.id}>{t2.name}</option>)}
              </select>
              <select value={form.team2Id} onChange={(e) => setForm({ ...form, team2Id: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="">{t('team2')}</option>
                {teams.map((t2) => <option key={t2.id} value={t2.id}>{t2.name}</option>)}
              </select>
              <select value={form.playgroundId} onChange={(e) => setForm({ ...form, playgroundId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="">{t('selectPlayground')}</option>
                {playgrounds.map((pg) => <option key={pg.id} value={pg.id}>{pg.name}</option>)}
              </select>
              <input type="datetime-local" value={form.matchDate} onChange={(e) => setForm({ ...form, matchDate: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">{t('cancel')}</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {saving ? t('loading') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
