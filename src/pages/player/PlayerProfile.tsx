import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMyFeatures, addFeature, updateFeature, deleteFeature } from '../../api/playerFeatures';
import { getProfile, uploadProfileImage, deleteProfileImage } from '../../api/profile';
import type { PlayerFeatureResponse, UserResponse } from '../../types';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ConfirmModal from '../../components/shared/ConfirmModal';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Camera, X } from 'lucide-react';

export default function PlayerProfile() {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [features, setFeatures] = useState<PlayerFeatureResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | 'create' | 'edit'>(null);
  const [editItem, setEditItem] = useState<PlayerFeatureResponse | null>(null);
  const [form, setForm] = useState({ featureName: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = () => getProfile().then((r) => setProfile(r.data));
  const fetchFeatures = () => { setLoading(true); getMyFeatures().then((r) => setFeatures(r.data)).finally(() => setLoading(false)); };

  useEffect(() => { fetchProfile(); fetchFeatures(); }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { toast.error(i18n.language === 'ar' ? 'يُسمح فقط بصور JPEG أو PNG أو WebP' : 'Only JPEG, PNG, or WebP images are allowed'); if (fileInputRef.current) fileInputRef.current.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { toast.error(i18n.language === 'ar' ? 'يجب أن يكون حجم الصورة أقل من 5 ميغابايت' : 'Image must be smaller than 5 MB'); if (fileInputRef.current) fileInputRef.current.value = ''; return; }
    setUploadingImg(true);
    try {
      const r = await uploadProfileImage(file);
      setProfile(r.data);
      toast.success(i18n.language === 'ar' ? 'تم رفع الصورة!' : 'Photo uploaded!');
    } catch (err: any) { toast.error(err.displayMessage || (i18n.language === 'ar' ? 'فشل رفع الصورة' : 'Upload failed')); }
    finally { setUploadingImg(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleDeleteImage = async () => {
    setUploadingImg(true);
    try {
      await deleteProfileImage();
      setProfile((p) => p ? { ...p, profileImageUrl: undefined } : p);
      toast.success(i18n.language === 'ar' ? 'تم حذف الصورة' : 'Photo removed');
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setUploadingImg(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') await addFeature(form);
      else if (editItem) await updateFeature(editItem.id, form);
      toast.success(i18n.language === 'ar' ? 'تم الحفظ!' : 'Saved!');
      setModal(null); fetchFeatures();
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteFeature(deleteId); toast.success(i18n.language === 'ar' ? 'تم الحذف' : 'Deleted'); setDeleteId(null); fetchFeatures(); }
    catch (err: any) { toast.error(err.displayMessage); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800">{t('profile')}</h1>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-5">
          {/* Avatar with upload */}
          <div className="relative group flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
              {profile?.profileImageUrl
                ? <img src={profile.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                : <span className="text-3xl font-bold text-green-600">{profile?.username?.[0]?.toUpperCase() || '?'}</span>
              }
            </div>
            {/* Overlay on hover */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImg}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera size={20} className="text-white" />
            </button>
            {/* Remove button */}
            {profile?.profileImageUrl && (
              <button onClick={handleDeleteImage} disabled={uploadingImg}
                className="absolute -top-1 -end-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow">
                <X size={10} />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{profile?.username}</h2>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{t('player')}</span>
            <p className="text-xs text-gray-400 mt-1">
              {uploadingImg
                ? (i18n.language === 'ar' ? 'جاري الرفع...' : 'Uploading...')
                : (i18n.language === 'ar' ? 'اضغط على الصورة لتغييرها' : 'Click photo to change')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">{t('myFeatures')}</h2>
          <button onClick={() => { setForm({ featureName: '', description: '' }); setModal('create'); }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} />{t('addFeature')}
          </button>
        </div>
        {loading ? <LoadingSkeleton rows={3} /> : features.length === 0 ? <p className="text-gray-400 text-sm">{t('noData')}</p> : (
          <div className="space-y-2">
            {features.map((f) => (
              <div key={f.id} className="flex items-start justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{f.featureName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.description}</p>
                </div>
                <div className="flex gap-1 ms-3">
                  <button onClick={() => { setEditItem(f); setForm({ featureName: f.featureName, description: f.description }); setModal('edit'); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteId(f.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-800 text-lg mb-4">{modal === 'create' ? t('addFeature') : t('edit')}</h3>
            <div className="space-y-3">
              <input value={form.featureName} onChange={(e) => setForm({ ...form, featureName: e.target.value })} placeholder={t('featureName')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('description')} rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
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
