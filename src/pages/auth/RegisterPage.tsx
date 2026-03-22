import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register } from '../../api/auth';
import toast from 'react-hot-toast';
import LanguageSwitcher from '../../components/shared/LanguageSwitcher';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', userType: 'PLAYER' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success(i18n.language === 'ar' ? 'تم إنشاء الحساب! يرجى تسجيل الدخول.' : 'Account created! Please login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.displayMessage || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center p-4">
      <div className="absolute top-4 end-4"><LanguageSwitcher /></div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t('fareeqi')} ⚽</h1>
          <p className="text-green-200">{t('tagline')}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('register')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(['username','email','password'] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t(field)}</label>
                <input type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'} required
                  value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" placeholder={t(field)} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('userType')}</label>
              <select value={form.userType} onChange={(e) => setForm({ ...form, userType: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="PLAYER">{t('player')}</option>
                <option value="FIELD_OWNER">{t('fieldOwner')}</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              <UserPlus size={18} />{loading ? t('loading') : t('register')}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            {t('haveAccount')}{' '}<Link to="/login" className="text-green-600 font-semibold hover:underline">{t('login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
