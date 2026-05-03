import { CalendarDays, Car, Search } from 'lucide-react';
import React from 'react';
import { SearchCriteria } from '../types';
import { useTranslation, Trans } from 'react-i18next';
import { motion } from 'motion/react';
import heroBg from '../assets/hero-bg.jpg';

interface HeroProps {
  searchCriteria: SearchCriteria;
  setSearchCriteria: (criteria: SearchCriteria) => void;
}

export default function Hero({ searchCriteria, setSearchCriteria }: HeroProps) {
  const { t } = useTranslation();

  return (
    <section className="relative pt-32 pb-20 px-6 min-h-[80vh] flex items-center justify-center overflow-hidden bg-slate-50">
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <img 
          src={heroBg} 
          alt="Hero background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[2px]"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100 rounded-full blur-[100px] opacity-60 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-70 -translate-x-1/4 translate-y-1/4"></div>
      </motion.div>

      <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 rtl:leading-tight">
          <Trans i18nKey="hero.title">
            Rent Your <span className="text-blue-600">Premium Car</span><br /> in Tunisia.
          </Trans>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10">{t('hero.subtitle')}</p>

        <div className="glass p-2 rounded-2xl md:rounded-full flex flex-col md:flex-row gap-2 max-w-5xl mx-auto backdrop-blur-md bg-white/80 border border-slate-200 shadow-2xl">
          <div className="flex-1 flex items-center px-4 py-3 gap-2 border-b md:border-b-0 md:border-r border-slate-200">
            <Search className="text-blue-600 w-5 h-5" />
            <select 
              value={searchCriteria.pickupLocation}
              onChange={(e) => setSearchCriteria({...searchCriteria, pickupLocation: e.target.value})}
              className="bg-transparent text-sm text-slate-900 w-full focus:outline-none [&>option]:bg-slate-50"
            >
              <option value="">{t('hero.pickup')}</option>
              <option value="Tunis Carthage Airport">{t('hero.locations.tunis')}</option>
              <option value="Hammamet">{t('hero.locations.sousse')}</option>
              <option value="Sfax Airport">{t('hero.locations.sfax')}</option>
              <option value="Djerba">{t('hero.locations.djerba')}</option>
            </select>
          </div>
          <div className="flex-1 flex items-center px-4 py-3 gap-2 border-b md:border-b-0 md:border-r border-slate-200">
            <CalendarDays className="text-blue-600 w-5 h-5" />
            <input 
              type="date"
              value={searchCriteria.pickupDate}
              onChange={(e) => setSearchCriteria({...searchCriteria, pickupDate: e.target.value})}
              className="bg-transparent text-sm text-slate-900 w-full focus:outline-none"
            />
          </div>
          <div className="flex-1 flex items-center px-4 py-3 gap-2 border-b md:border-b-0 md:border-r border-slate-200">
            <Car className="text-blue-600 w-5 h-5" />
            <select 
              value={searchCriteria.carType}
              onChange={(e) => setSearchCriteria({...searchCriteria, carType: e.target.value})}
              className="bg-transparent text-sm text-slate-900 w-full focus:outline-none [&>option]:bg-slate-50"
            >
              <option value="">{t('hero.anyCar')}</option>
              <option value="Economy">{t('hero.economy')}</option>
              <option value="Compact">{t('hero.compact')}</option>
              <option value="Sedan">{t('hero.sedan')}</option>
              <option value="SUV">{t('hero.suv')}</option>
              <option value="Luxury">{t('hero.luxury')}</option>
            </select>
          </div>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-xl md:rounded-full font-medium hover:bg-blue-700 transition">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
