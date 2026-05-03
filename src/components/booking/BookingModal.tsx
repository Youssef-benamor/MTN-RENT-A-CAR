import React, { useState } from 'react';
import { X, CalendarDays, Users, Settings, Fuel } from 'lucide-react';
import { Car } from '../../types';
import FastTrackForm from './FastTrackForm';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

interface BookingModalProps {
  car: Car;
  onClose: () => void;
  searchCriteria: SearchCriteria;
}

export default function BookingModal({ car, onClose, searchCriteria }: BookingModalProps) {
  const { t } = useTranslation();
  const [days, setDays] = useState(() => {
    if (!searchCriteria.pickupDate || !searchCriteria.dropoffDate) return 1;
    const diffTime = Math.abs(new Date(searchCriteria.dropoffDate).getTime() - new Date(searchCriteria.pickupDate).getTime());
    const d = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return d > 0 ? d : 1;
  });

  const [addons, setAddons] = useState({
    gps: false,
    childSeat: false,
    insurance: false
  });

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  React.useEffect(() => {
    if (searchCriteria.pickupDate && searchCriteria.dropoffDate) {
      const diffTime = Math.abs(new Date(searchCriteria.dropoffDate).getTime() - new Date(searchCriteria.pickupDate).getTime());
      const d = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDays(d > 0 ? d : 1);
    }
  }, [searchCriteria.pickupDate, searchCriteria.dropoffDate]);

  const addonTotal = (
    (addons.gps ? 15 : 0) + 
    (addons.childSeat ? 20 : 0) + 
    (addons.insurance ? 40 : 0)
  ) * days;

  const total = (days * car.pricePerDay) + addonTotal;

  // Use actual car images instead of mock ones
  const gallery = car.images?.length ? car.images : (car.image ? [car.image] : []);
  const [activeIndex, setActiveIndex] = useState(0);

  const slideLeft = () => {
    setActiveIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const slideRight = () => {
    setActiveIndex((prev) => (prev + 1) % gallery.length);
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="glass rounded-3xl w-full max-w-5xl h-[95vh] md:h-auto md:max-h-[95vh] overflow-y-auto p-6 md:p-10 relative border border-slate-200 shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 hover:rotate-90 transition-all duration-300 z-10"><X /></button>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="mb-6 relative">
              {gallery.length > 0 ? (
                <>
                  <motion.img 
                    key={activeIndex}
                    src={gallery[activeIndex]} 
                    alt={car.name} 
                    className="w-full h-64 object-cover rounded-[2rem] border border-slate-200 shadow-lg"
                    initial={{ opacity: 0.5, filter: "blur(10px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.4 }}
                  />
                  {gallery.length > 1 && (
                    <>
                      <button onClick={slideLeft} className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-500 text-slate-900 p-2 rounded-full hover:bg-white/80 transition-colors">
                        ←
                      </button>
                      <button onClick={slideRight} className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-500 text-slate-900 p-2 rounded-full hover:bg-white/80 transition-colors">
                        →
                      </button>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {gallery.map((img, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`w-12 h-8 rounded-lg overflow-hidden border-2 transition ${activeIndex === idx ? 'border-blue-500 scale-110 shadow-lg' : 'border-slate-200 opacity-70 hover:opacity-100 bg-slate-50'}`}
                          >
                            <img src={img} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-64 bg-slate-50 rounded-[2rem] border border-slate-200 flex items-center justify-center text-gray-500">
                  No Image Available
                </div>
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 mb-4 mt-8">{car.name}</h2>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-slate-400"><Settings className="w-5 h-5 text-blue-600" /> {car.transmission}</div>
              <div className="flex items-center gap-3 text-slate-400"><Fuel className="w-5 h-5 text-blue-600" /> {car.fuel}</div>
              <div className="flex items-center gap-3 text-slate-400"><Users className="w-5 h-5 text-blue-600" /> {car.passengers} {t('booking.passengers')}</div>
            </div>

            <div className="space-y-3">
              <h3 className="text-slate-900 font-medium mb-3">Optional Add-ons</h3>
              <label className="flex items-center justify-between p-3 rounded-full border border-slate-200 hover:bg-white cursor-pointer transition-all duration-300">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={addons.gps} onChange={(e) => setAddons({...addons, gps: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-white" />
                  <span className="text-slate-500">GPS Navigation</span>
                </div>
                <span className="text-blue-600 text-sm font-medium">+15 TND / day</span>
              </label>
              
              <label className="flex items-center justify-between p-3 rounded-full border border-slate-200 hover:bg-white cursor-pointer transition-all duration-300">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={addons.childSeat} onChange={(e) => setAddons({...addons, childSeat: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-white" />
                  <span className="text-slate-500">Child Seat</span>
                </div>
                <span className="text-blue-600 text-sm font-medium">+20 TND / day</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-full border border-slate-200 hover:bg-white cursor-pointer transition-all duration-300">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={addons.insurance} onChange={(e) => setAddons({...addons, insurance: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-white" />
                  <span className="text-slate-500">Premium Insurance (Zero Excess)</span>
                </div>
                <span className="text-blue-600 text-sm font-medium">+40 TND / day</span>
              </label>
            </div>
          </div>

          <div>
            <div className="glass p-6 rounded-[2rem] mb-6 border border-slate-200 bg-slate-500">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400">{t('booking.totalPriceFor')}</span>
                <input type="number" min="1" value={days} onChange={e => setDays(Number(e.target.value))} className="w-16 bg-slate-50 p-2 text-center rounded-lg border border-slate-300 text-slate-900 outline-none focus:border-blue-600 transition-colors" />
                <span className="text-slate-400">{t('booking.days')}</span>
              </div>
              <p className="text-4xl font-bold text-slate-900">{total} TND</p>
            </div>
            
            <FastTrackForm 
              carId={car.id}
              carName={`${car.brand} ${car.name}`} 
              total={total} 
              pickupDate={searchCriteria.pickupDate}
              dropoffDate={searchCriteria.dropoffDate || new Date(new Date(searchCriteria.pickupDate || new Date()).getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              pickupLocation={searchCriteria.pickupLocation || 'Tunis Carthage Airport'}
              dropoffLocation={searchCriteria.pickupLocation || 'Tunis Carthage Airport'}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
