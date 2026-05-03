import React, { useState } from 'react';
import { Car, Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import logo from '../assets/Mtnlogo.png';

interface NavbarProps {
  view: 'home' | 'admin';
  setView: (view: 'home' | 'admin') => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export default function Navbar({ view, setView, isAuthenticated, onLogout }: NavbarProps) {
  const { t, i18n } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.dir = lng === 'ar' ? 'rtl' : 'ltr';
    setLangMenuOpen(false);
  };

  return (
    <motion.nav 
      className="w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between min-h-[100px] md:min-h-[140px]">
        <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105" onClick={() => setView('home')}>
          <img src={logo} alt="MTN Rent Car" className="h-28 md:h-36 w-auto object-contain" />
        </div>
        <div className="flex gap-4 md:gap-8 text-sm text-slate-400 items-center">
          <a href="#fleet" className="hidden md:block hover:text-blue-500 transition-colors uppercase font-medium tracking-wide">{t('navbar.fleet')}</a>
          <a href="#why" className="hidden md:block hover:text-blue-600 transition-colors uppercase font-medium tracking-wide">{t('navbar.whyUs')}</a>
          
          <div className="relative">
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)} 
              className="flex items-center gap-1.5 text-slate-900 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase font-medium">{i18n.language?.substring(0, 2) || 'en'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {langMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-12 right-0 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[140px]"
                >
                  <button onClick={() => changeLanguage('en')} className="block w-full text-left px-5 py-3 hover:bg-slate-50 hover:text-blue-600 font-medium text-slate-500 transition-colors">English</button>
                  <button onClick={() => changeLanguage('fr')} className="block w-full text-left px-5 py-3 hover:bg-slate-50 hover:text-blue-600 font-medium text-slate-500 transition-colors border-t border-slate-200">Français</button>
                  <button onClick={() => changeLanguage('ar')} className="block w-full text-left px-5 py-3 hover:bg-slate-50 hover:text-blue-600 font-medium text-slate-500 transition-colors border-t border-slate-200">العربية</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isAuthenticated ? (
            <>
              <button 
                onClick={() => setView(view === 'home' ? 'admin' : 'home')}
                className="text-slate-900 font-medium hover:text-blue-600 transition-colors"
             >
                {view === 'home' ? t('navbar.admin') : t('navbar.home')}
              </button>
              <button onClick={onLogout} className="text-red-500 font-medium bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition">{t('navbar.logout')}</button>
            </>
          ) : (
            <button onClick={() => setView('admin')} className="text-white font-medium bg-blue-600 px-5 py-2.5 rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">{t('navbar.login')}</button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
