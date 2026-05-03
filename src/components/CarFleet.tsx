import React, { useState, useEffect } from 'react';
import CarCard from './CarCard';
import { Car, SearchCriteria } from '../types';
import { getCars } from '../services/carService';
import { useTranslation } from 'react-i18next';
import { Settings, Fuel, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CarFleetProps {
  onCheck: (car: Car) => void;
  searchCriteria: SearchCriteria;
}

export default function CarFleet({ onCheck, searchCriteria }: CarFleetProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const [maxPrice, setMaxPrice] = useState(1000);
  const [transmission, setTransmission] = useState('');
  const [fuel, setFuel] = useState('');
  const [sort, setSort] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const fetchedCars = await getCars();
        setCars(fetchedCars);
        if (fetchedCars.length > 0) {
          const highestPrice = Math.max(...fetchedCars.map(c => c.pricePerDay));
          setMaxPrice(highestPrice + 50);
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const filteredCars = cars.filter(c => {
    if (searchCriteria.carType && c.category !== searchCriteria.carType) return false;
    if (c.pricePerDay > maxPrice) return false;
    if (transmission && c.transmission.toLowerCase() !== transmission.toLowerCase()) return false;
    if (fuel && c.fuel.toLowerCase() !== fuel.toLowerCase()) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'price_asc') return a.pricePerDay - b.pricePerDay;
    if (sort === 'price_desc') return b.pricePerDay - a.pricePerDay;
    return 0;
  });

  return (
    <section id="fleet" className="py-20 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-8">
        <motion.h2 
          className="text-4xl mb-4 text-slate-900"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {t('fleet.title')}
        </motion.h2>
        <motion.p 
          className="text-slate-400 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {t('fleet.subtitle')}
        </motion.p>
        
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-900 px-6 py-2 rounded-full hover:bg-slate-100 transition"
          >
            <SlidersHorizontal className="w-4 h-4" /> 
            Filters & Sorting
          </button>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 48 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="glass p-6 rounded-[2rem] border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-6 text-left overflow-hidden"
            >
              <div>
                <label className="block text-sm text-slate-400 mb-2">Max Price: {maxPrice} TND</label>
                <input 
                  type="range" 
                  min="50" max="1000" step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2"><Settings className="w-4 h-4" /> Transmission</label>
                <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 outline-none focus:border-blue-600 transition-colors">
                  <option value="">Any</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2"><Fuel className="w-4 h-4" /> Fuel Type</label>
                <select value={fuel} onChange={(e) => setFuel(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 outline-none focus:border-blue-600 transition-colors">
                  <option value="">Any</option>
                  <option value="petrol">Petrol / Essence</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Sort By</label>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 outline-none focus:border-blue-600 transition-colors">
                  <option value="">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      ) : filteredCars.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {filteredCars.map((car, index) => (
            <motion.div 
              key={car.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <CarCard car={car} onCheck={onCheck} searchCriteria={searchCriteria} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center text-slate-400 py-12 glass rounded-[2rem]">
          No cars match your search criteria or are currently available.
        </div>
      )}
    </section>
  );
}
