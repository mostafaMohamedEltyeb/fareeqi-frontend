import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllUsers, createUser, updateUser, deleteUser } from '../../api/admin';
import type { UserResponse } from '../../types';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ConfirmModal from '../../components/shared/ConfirmModal';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function UserManagement() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | 'create' | 'edit'>(null);
  const [editItem, setEditItem] = useState<UserResponse | null>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', userType: 'PLAYER', enabled: true, roles: ['ROLE_PLAYER'] });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetch = () => { setLoading(true); getAllUsers().then((r) => setUsers(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') await createUser(form);
      else if (editItem) await updateUser(editItem.id, { email: form.email, password: form.password || undefined, enabled: form.enabled, userType: form.userType, roles: form.roles });
      toast.success(i18n.language === 'ar' ? 'تم الحفظ!' : 'Saved!');
      setModal(null); fetch();
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteUser(deleteId); toast.success(i18n.language === 'ar' ? 'تم الحذف' : 'Deleted'); setDeleteId(null); fetch(); }
    catch (err: any) { toast.error(err.displayMessage); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t('users')}</h1>
        <button onClick={() => { setForm({ username:'', email:'', password:'', userType:'PLAYER', enabled:true, roles:['ROLE_PLAYER'] }); setModal('create'); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={18}/>{t('createUser')}
        </button>
      </div>
      {loading ? <LoadingSkeleton /> : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{[t('username'), t('email'), t('userType'), t('roles'), t('enabled'), t('actions')].map((h) => (
                  <th key={h} className="px-4 py-3 text-start font-semibold text-gray-600">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.username}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{u.userType}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{u.roles?.join(', ')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block w-2 h-2 rounded-full ${u.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditItem(u); setForm({ username: u.username, email: u.email, password: '', userType: u.userType, enabled: u.enabled, roles: u.roles }); setModal('edit'); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Pencil size={14}/></button>
                        <button onClick={() => setDeleteId(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-800 text-lg mb-4">{modal === 'create' ? t('createUser') : t('editUser')}</h3>
            <div className="space-y-3">
              {modal === 'create' && <input value={form.username} onChange={(e) => setForm({...form, username:e.target.value})} placeholder={t('username')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>}
              <input value={form.email} onChange={(e) => setForm({...form, email:e.target.value})} placeholder={t('email')} type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
              <input value={form.password} onChange={(e) => setForm({...form, password:e.target.value})} placeholder={t('password')} type="password"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
              <select value={form.userType} onChange={(e) => {
                const ut = e.target.value;
                const roleMap: Record<string, string> = { PLAYER: 'ROLE_PLAYER', FIELD_OWNER: 'ROLE_FIELD_OWNER', ADMIN: 'ROLE_ADMIN' };
                setForm({...form, userType: ut, roles: [roleMap[ut]]});
              }} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="PLAYER">{t('player')}</option>
                <option value="FIELD_OWNER">{t('fieldOwner')}</option>
                <option value="ADMIN">{t('admin')}</option>
              </select>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="enabled" checked={form.enabled} onChange={(e) => setForm({...form, enabled:e.target.checked})} className="w-4 h-4 accent-green-600"/>
                <label htmlFor="enabled" className="text-sm text-gray-700">{t('enabled')}</label>
              </div>
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
