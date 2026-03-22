import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const isAr = i18n.language === 'ar';
  const toggle = () => {
    const next = isAr ? 'en' : 'ar';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };
  return (
    <button onClick={toggle} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
      <span className="text-base">{isAr ? '🇬🇧' : '🇸🇦'}</span>
      <span>{isAr ? t('en') : t('ar')}</span>
    </button>
  );
}
