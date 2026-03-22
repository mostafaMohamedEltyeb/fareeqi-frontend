import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getPlaygrounds, createPlayground, updatePlayground, deletePlayground, uploadPlaygroundImage, removePlaygroundImage } from '../../api/playgrounds';
import type { PlaygroundResponse } from '../../types';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ConfirmModal from '../../components/shared/ConfirmModal';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, List, Images, X, Upload } from 'lucide-react';

const emptyForm = { name: '', location: '', sportType: 'FOOTBALL', availability: true, address: '', pricePerHour: '' };

export default function MyPlaygrounds() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [playgrounds, setPlaygrounds] = useState<PlaygroundResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | 'create' | 'edit'>(null);
  const [editItem, setEditItem] = useState<PlaygroundResponse | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [imagesModal, setImagesModal] = useState<PlaygroundResponse | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetch = () => { setLoading(true); getPlaygrounds().then((r) => setPlaygrounds(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, pricePerHour: Number(form.pricePerHour) };
      if (modal === 'create') await createPlayground(payload);
      else if (editItem) await updatePlayground(editItem.id, payload);
      toast.success(i18n.language === 'ar' ? 'تم الحفظ!' : 'Saved!');
      setModal(null); fetch();
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deletePlayground(deleteId); toast.success(i18n.language === 'ar' ? 'تم الحذف' : 'Deleted'); setDeleteId(null); fetch(); }
    catch (err: any) { toast.error(err.displayMessage); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !imagesModal) return;
    if ((imagesModal.imageUrls?.length || 0) >= 10) {
      toast.error(i18n.language === 'ar' ? 'الحد الأقصى 10 صور' : 'Max 10 images allowed');
      return;
    }
    setUploadingImg(true);
    try {
      const r = await uploadPlaygroundImage(imagesModal.id, file);
      const updated = r.data as PlaygroundResponse;
      setImagesModal(updated);
      setPlaygrounds((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      toast.success(i18n.language === 'ar' ? 'تم رفع الصورة!' : 'Image uploaded!');
    } catch (err: any) { toast.error(err.displayMessage || (i18n.language === 'ar' ? 'فشل الرفع' : 'Upload failed')); }
    finally { setUploadingImg(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleRemoveImage = async (url: string) => {
    if (!imagesModal) return;
    setRemovingUrl(url);
    try {
      const r = await removePlaygroundImage(imagesModal.id, url);
      const updated = r.data as PlaygroundResponse;
      setImagesModal(updated);
      setPlaygrounds((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      toast.success(i18n.language === 'ar' ? 'تم الحذف' : 'Removed');
    } catch (err: any) { toast.error(err.displayMessage); }
    finally { setRemovingUrl(null); }
  };

  const fields = [
    { key: 'name', label: t('name'), type: 'text' }, { key: 'location', label: t('location'), type: 'text' },
    { key: 'address', label: t('address'), type: 'text' }, { key: 'pricePerHour', label: t('pricePerHour'), type: 'number' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t('myPlaygrounds')}</h1>
        <button onClick={() => { setForm(emptyForm); setModal('create'); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={18} />{t('addPlayground')}
        </button>
      </div>
      {loading ? <LoadingSkeleton rows={4} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {playgrounds.length === 0 ? <div className="col-span-3 text-center text-gray-400 py-16">{t('noData')}</div> :
            playgrounds.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-32 relative overflow-hidden">
                  {p.imageUrls?.length > 0
                    ? <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-5xl">
                        {p.sportType === 'FOOTBALL' ? '⚽' : '🎾'}
                      </div>
                  }
                  {p.imageUrls?.length > 1 && (
                    <span className="absolute bottom-2 end-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                      +{p.imageUrls.length - 1}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{p.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.availability ? t('available') : t('notAvailable')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{p.location}</p>
                  <p className="font-bold text-green-700 text-sm mb-3">{p.pricePerHour} SAR/hr</p>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/owner/playgrounds/${p.id}/slots`)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium">
                      <List size={14}/>{t('manageSlots')}
                    </button>
                    <button onClick={() => setImagesModal(p)} title={i18n.language === 'ar' ? 'إدارة الصور' : 'Manage images'}
                      className="p-1.5 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"><Images size={14}/></button>
                    <button onClick={() => { setEditItem(p); setForm({ name: p.name, location: p.location, sportType: p.sportType, availability: p.availability, address: p.address, pricePerHour: String(p.pricePerHour) }); setModal('edit'); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Pencil size={14}/></button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-800 text-lg mb-4">{modal === 'create' ? t('addPlayground') : t('editPlayground')}</h3>
            <div className="space-y-3">
              {fields.map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={label}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('sportType')}</label>
                <select value={form.sportType} onChange={(e) => setForm({ ...form, sportType: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  <option value="FOOTBALL">{t('football')}</option>
                  <option value="PADEL">{t('padel')}</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="avail" checked={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.checked })} className="w-4 h-4 accent-green-600" />
                <label htmlFor="avail" className="text-sm text-gray-700">{t('availability')}</label>
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

      {/* Images management modal */}
      {imagesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">
                {i18n.language === 'ar' ? `صور: ${imagesModal.name}` : `Images: ${imagesModal.name}`}
              </h3>
              <button onClick={() => setImagesModal(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>

            {/* Image grid */}
            {imagesModal.imageUrls?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {imagesModal.imageUrls.map((url) => (
                  <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveImage(url)}
                      disabled={removingUrl === url}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      {removingUrl === url
                        ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Trash2 size={20} className="text-white" />
                      }
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-6 mb-4">
                {i18n.language === 'ar' ? 'لا توجد صور بعد' : 'No images yet'}
              </p>
            )}

            {/* Upload button */}
            {(imagesModal.imageUrls?.length || 0) < 10 ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImg}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-green-300 text-green-700 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                {uploadingImg
                  ? <><div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />{i18n.language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</>
                  : <><Upload size={18} />{i18n.language === 'ar' ? `رفع صورة (${imagesModal.imageUrls?.length || 0}/10)` : `Upload image (${imagesModal.imageUrls?.length || 0}/10)`}</>
                }
              </button>
            ) : (
              <p className="text-center text-sm text-gray-400">{i18n.language === 'ar' ? 'وصلت للحد الأقصى (10 صور)' : 'Maximum reached (10 images)'}</p>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
        </div>
      )}

      <ConfirmModal open={!!deleteId} message={t('confirmDelete')} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
