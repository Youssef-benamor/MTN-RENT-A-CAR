import { Car as CarIcon, Gauge, Fuel, Users, Settings } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Car, SearchCriteria } from '../types';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

interface CarCardProps {
  key?: React.Key;
  car: Car;
  onCheck: (car: Car) => void;
  searchCriteria?: SearchCriteria;
}

export default function CarCard({ car, onCheck, searchCriteria }: CarCardProps) {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = car.images?.length ? car.images : (car.image ? [car.image] : []);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  const isBookable = React.useMemo(() => {
    if (car.isAvailable) return true;
    if (!car.rentedUntil) return false;
    
    // If we have a pickup date in search, check if it's after the rentedUntil date
    if (searchCriteria?.pickupDate) {
      const pickupTime = new Date(searchCriteria.pickupDate).getTime();
      const rentedUntilTime = new Date(car.rentedUntil).getTime();
      
      // Need 24h buffer or just strictly after
      return pickupTime > rentedUntilTime;
    }
    return false;
  }, [car.isAvailable, car.rentedUntil, searchCriteria?.pickupDate]);

  return (
    <div className="glass rounded-3xl p-6 hover:border-blue-500/50 transition-all group">
      <div className="relative w-full h-48 mb-6 overflow-hidden rounded-[2rem] group-hover:scale-105 transition-transform duration-500">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImageIndex}
            src={images[currentImageIndex]} 
            alt={car.name} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-cover" 
          />
        </AnimatePresence>
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
             {images.map((_, i) => (
               <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'w-4 bg-slate-50' : 'w-1.5 bg-slate-50/50'}`} />
             ))}
          </div>
        )}
      </div>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-slate-900">{car.brand} {car.name}</h3>
        {car.isAvailable ? (
          <span className="bg-slate-100 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">{t('fleet.available')}</span>
        ) : (
          <span className="bg-red-500/10 text-red-500 text-xs px-3 py-1 rounded-full font-medium">
            {car.rentedUntil ? (() => {
              const daysLeft = Math.ceil((new Date(car.rentedUntil).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return daysLeft > 0 ? t('fleet.availableInDays', { days: daysLeft }) : t('fleet.availableSoon');
            })() : t('fleet.rented')}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Settings className="w-4 h-4" /> {car.transmission}
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Fuel className="w-4 h-4" /> {car.fuel}
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Users className="w-4 h-4" /> {car.passengers}
        </div>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
        <p className="text-2xl font-bold text-slate-900">{car.pricePerDay} TND<span className="text-sm text-gray-500 font-normal"> / {t('booking.dropoff') ? 'day' : 'jour'}</span></p>
        <button 
          onClick={() => onCheck(car)} 
          disabled={!isBookable}
          className={`px-5 py-2 rounded-full text-sm font-bold transition ${isBookable ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-gray-500 cursor-not-allowed'}`}
        >
          {t('fleet.bookNow')}
        </button>
      </div>
    </div>
  );
}

