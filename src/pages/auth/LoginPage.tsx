import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import LanguageSwitcher from '../../components/shared/LanguageSwitcher';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      const user = res.data;
      localStorage.setItem('token', user.token);
      setUser(user);
      if (user.userType === 'PLAYER') navigate('/player/dashboard');
      else if (user.userType === 'FIELD_OWNER') navigate('/owner/dashboard');
      else navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.displayMessage || 'Login failed');
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('welcomeBack')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('username')}</label>
              <input type="text" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition" placeholder={t('username')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('password')}</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition" placeholder={t('password')} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 end-3 flex items-center text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              <LogIn size={18} />{loading ? t('loading') : t('login')}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            {t('noAccount')}{' '}<Link to="/register" className="text-green-600 font-semibold hover:underline">{t('register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
