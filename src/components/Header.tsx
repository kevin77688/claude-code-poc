import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = ['rankings', 'tierList', 'strategy'] as const;

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh-TW' : 'en');
  };

  return (
    <header className="bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 border-b border-purple-800/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-300 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
            {t('appTitle')}
          </h1>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-800/40 hover:bg-purple-700/50 border border-purple-600/30 text-purple-200 text-sm transition-colors cursor-pointer"
          >
            <Globe size={16} />
            <span>{t('lang.toggle')}</span>
          </button>
        </div>
        <nav className="flex gap-1 mt-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-[var(--bg-secondary)] text-purple-300 border-t border-x border-purple-600/40'
                  : 'text-purple-400/70 hover:text-purple-300 hover:bg-purple-900/30'
              }`}
            >
              {t(`nav.${tab}`)}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
