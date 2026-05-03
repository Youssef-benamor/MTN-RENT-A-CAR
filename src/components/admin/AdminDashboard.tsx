
import React, { useState, useEffect } from 'react';
import { Car } from '../../types';
import { getCars, addCar, updateCar, deleteCar } from '../../services/carService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Edit2, Trash2, Car as CarIcon, CheckCircle, XCircle, Users, Settings, Fuel, TrendingUp, Calendar } from 'lucide-react';
import CarCalendar from './CarCalendar';

export default function AdminDashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [selectedCalendarCar, setSelectedCalendarCar] = useState<Car | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isAvailableForm, setIsAvailableForm] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Derived Analytics Data
  const fleetComposition = Object.entries(
    cars.reduce((acc, car) => ({ ...acc, [car.category]: (acc[car.category] || 0) + 1 }), {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count }));

  const averagePriceByType = Object.entries(
    cars.reduce((acc, car) => {
      if (!acc[car.category]) acc[car.category] = { sum: 0, count: 0 };
      acc[car.category].sum += car.pricePerDay;
      acc[car.category].count += 1;
      return acc;
    }, {} as Record<string, { sum: number, count: number }>)
  ).map(([name, data]: [string, any]) => ({ name, avgPrice: Math.round(data.sum / data.count) }));

  const totalCars = cars.length;
  const availableCars = cars.filter(c => c.isAvailable).length;
  const activeRentals = totalCars - availableCars;
  const currentDailyRevenue = cars.filter(c => !c.isAvailable).reduce((sum, c) => sum + c.pricePerDay, 0);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const data = await getCars();
      setCars(data);
    } catch (error: any) {
      let errorMessage = "Error fetching cars";
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.error || error.message;
      } catch {
        errorMessage = error.message;
      }
      alert("Failed to load cars: " + errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCar(id);
      fetchCars();
    } catch (error: any) {
      let errorMessage = "Failed to delete car";
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.error || error.message;
      } catch {
        errorMessage = error.message;
      }
      alert("Failed to delete: " + errorMessage);
    }
  };

  const handleSeedData = async () => {
    const demoCars = [
      { name: "Symbol", brand: "Renault", category: "Economy", transmission: "Manual", fuel: "Petrol", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800", images: [], pricePerDay: 120, passengers: 5, isAvailable: true, features: ["AC", "Radio"], rentedUntil: "" },
      { name: "Rio", brand: "Kia", category: "Economy", transmission: "Manual", fuel: "Petrol", image: "https://images.unsplash.com/photo-1633647306228-4ce6e1eff3ec?auto=format&fit=crop&q=80&w=800", images: [], pricePerDay: 130, passengers: 5, isAvailable: true, features: ["AC", "Bluetooth"], rentedUntil: "" },
      { name: "Leon", brand: "Seat", category: "Compact", transmission: "Manual", fuel: "Petrol", image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800", images: [], pricePerDay: 180, passengers: 5, isAvailable: true, features: ["AC", "LED Lights"], rentedUntil: "" },
      { name: "Logan", brand: "Dacia", category: "Economy", transmission: "Manual", fuel: "Petrol", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800", images: [], pricePerDay: 110, passengers: 5, isAvailable: true, features: ["AC"], rentedUntil: "" },
      { name: "Tarraco", brand: "Seat", category: "SUV", transmission: "Automatic", fuel: "Diesel", image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800", images: [], pricePerDay: 280, passengers: 7, isAvailable: true, features: ["AC", "Sunroof", "Vans"], rentedUntil: "" }
    ];
    try {
      for (const car of demoCars) {
        await addCar(car as any);
      }
      fetchCars();
    } catch (error: any) {
      let errorMessage = "Failed to add demo car";
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.error || error.message;
      } catch {
        errorMessage = error.message;
      }
      alert("Failed to add demo cars: " + errorMessage);
    }
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6)); 
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Longer wait for render
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      let imageUrl = editingCar?.image || '';
      let imagesUrls = editingCar?.images || (imageUrl ? [imageUrl] : []);

      if (imageFiles.length > 0) {
          imagesUrls = []; // Replace old images if new ones are selected
          for (const file of imageFiles) {
              const compressedBase64 = await compressImage(file);
              imagesUrls.push(compressedBase64);
          }
          imageUrl = imagesUrls[0]; // Set primary image
      }

      const isAvailable = formData.get('isAvailable') === 'on';
      const rentedUntil = !isAvailable ? (formData.get('rentedUntil') as string || '') : '';

      const carData: Partial<Car> = {
        name: formData.get('name') as string,
        brand: formData.get('brand') as string,
        category: formData.get('category') as any,
        transmission: formData.get('transmission') as any,
        fuel: formData.get('fuel') as any,
        image: imageUrl,
        images: imagesUrls,
        pricePerDay: Number(formData.get('pricePerDay')),
        passengers: Number(formData.get('passengers')),
        isAvailable,
        rentedUntil,
        features: (formData.get('features') as string)?.split(',').map(s => s.trim()).filter(s => s) || [],
      };

      if (editingCar && editingCar.id) {
        await updateCar(editingCar.id, carData);
        setCars(prev => prev.map(c => c.id === editingCar.id ? { ...c, ...carData } : c));
      } else {
        const docRef = await addCar(carData as any);
        // Optimistically add to local state if we have the data
        if (docRef) {
          setCars(prev => [...prev, { ...carData, id: docRef.id } as Car]);
        }
        
        // Finalize UI state
        setEditingCar(null);
        setImageFiles([]);
        setIsSaving(false);
        alert("Car saved successfully!");

        // Sync with server in background after a short delay
        setTimeout(() => {
          fetchCars().catch(err => console.warn("Background sync failed:", err));
        }, 2000);
        return; // Success handled
      }
      
      setEditingCar(null);
      setImageFiles([]);
      setIsSaving(false);
      alert("Car saved successfully!");
    } catch (error: any) {
      console.error(error);
      let errorMessage = "An unknown error occurred.";
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.error || error.message;
      } catch {
        errorMessage = error.message;
      }
      setIsSaving(false);
      alert("Failed to save: " + errorMessage);
    } finally {
      // State is handled before alerts
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Fleet Management</h1>
          <p className="text-slate-400">Manage your vehicles, track availability, and update listings.</p>
        </div>
        {!editingCar && (
          <button 
            onClick={() => {
              setEditingCar({ id: '', name: '', brand: '', category: 'Economy', transmission: 'Manual', fuel: 'Petrol', image: '', pricePerDay: 0, passengers: 0, isAvailable: true, features: [] } as Car);
              setIsAvailableForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-lg shadow-none"
          >
            <Plus className="w-5 h-5" />
            Add New Car
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-[2rem] flex items-center gap-4">
          <div className="p-4 bg-slate-100 text-slate-900/10 text-blue-600 rounded-full">
            <CarIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Fleet Size</p>
            <p className="text-3xl font-bold text-slate-900">{totalCars}</p>
          </div>
        </div>
        <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-[2rem] flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Available for Rent</p>
            <p className="text-3xl font-bold text-slate-900">{availableCars}</p>
          </div>
        </div>
        <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-[2rem] flex items-center gap-4">
          <div className="p-4 bg-slate-100 text-blue-600 rounded-full">
            <CarIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Active Rentals</p>
            <p className="text-3xl font-bold text-slate-900">{activeRentals}</p>
          </div>
        </div>
        <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-[2rem] flex items-center gap-4">
          <div className="p-4 bg-slate-100 text-blue-600 rounded-full">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Active Daily Revenue</p>
            <p className="text-2xl font-bold text-slate-900">{currentDailyRevenue} TND</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-[2rem]">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Fleet Composition</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetComposition}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" axisLine={false} tickLine={false} />
                <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }} cursor={{fill: '#374151', opacity: 0.4}} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-[2rem]">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Average Price per Type (TND)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={averagePriceByType} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9CA3AF" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }} cursor={{fill: '#374151', opacity: 0.4}} />
                <Bar dataKey="avgPrice" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {editingCar && (
        <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 mb-10 shadow-xl">
          <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900">{editingCar.id ? 'Edit Vehicle Details' : 'Add New Vehicle'}</h2>
            <button onClick={() => setEditingCar(null)} className="text-slate-400 hover:text-slate-900 transition">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Vehicle Brand</label>
                <input name="brand" defaultValue={editingCar.brand} placeholder="e.g. Renault, Kia" className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Vehicle Model</label>
                <input name="name" defaultValue={editingCar.name} placeholder="e.g. Symbol, Rio" className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Vehicle Category</label>
                <select name="category" defaultValue={editingCar.category} className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 transition">
                  <option value="Economy">Economy</option>
                  <option value="Compact">Compact</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Van">Van</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Price Per Day (TND)</label>
                <input name="pricePerDay" type="number" defaultValue={editingCar.pricePerDay} placeholder="0" className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Transmission</label>
                <select name="transmission" defaultValue={editingCar.transmission} className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 transition">
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Fuel Type</label>
                <select name="fuel" defaultValue={editingCar.fuel} className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 transition">
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Passengers</label>
                <input name="passengers" type="number" defaultValue={editingCar.passengers} placeholder="4" className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Features (comma separated)</label>
                <input name="features" defaultValue={editingCar.features?.join(', ')} placeholder="AC, Bluetooth, Radio" className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 transition" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-1">Vehicle Images</label>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    {imageFiles.length > 0 ? (
                      imageFiles.map((file, idx) => (
                        <div key={idx} className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 overflow-hidden">
                           <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview"/>
                        </div>
                      ))
                    ) : editingCar?.images?.map((img, idx) => (
                      <img key={idx} src={img} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                    )) || (editingCar?.image && (
                      <img src={editingCar.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                    ))}
                  </div>
                  <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(Array.from(e.target.files || []))} className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-blue-600 text-white" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg bg-slate-500 cursor-pointer hover:bg-gray-800/50 transition">
                  <input type="checkbox" name="isAvailable" checked={isAvailableForm} onChange={(e) => setIsAvailableForm(e.target.checked)} className="w-5 h-5 rounded text-blue-600 bg-slate-50 border-gray-700 focus:ring-blue-600 focus:ring-offset-gray-900" /> 
                  <div>
                    <p className="font-medium text-slate-900">Available for Rent</p>
                    <p className="text-sm text-slate-400">Is this vehicle currently available to be booked by customers?</p>
                  </div>
                </label>
              </div>
              {!isAvailableForm && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Rented Until</label>
                  <input type="date" name="rentedUntil" defaultValue={editingCar.rentedUntil || ''} className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 transition" />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
              <button type="button" onClick={() => setEditingCar(null)} className="px-5 py-2.5 rounded-lg font-medium text-slate-500 hover:text-slate-900 hover:bg-gray-800 transition">
                Cancel
              </button>
              <button disabled={isSaving} type="submit" className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 hover:text-black disabled:opacity-50 text-slate-900 rounded-lg font-medium transition shadow-lg shadow-none">
                {isSaving ? 'Saving...' : (editingCar.id ? 'Save Changes' : 'Add Vehicle')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {cars.map(car => (
          <div key={car.id} className="bg-slate-50/40 border border-slate-200 rounded-[2rem] overflow-hidden hover:border-gray-700 transition group flex flex-col">
            <div className="relative h-48 w-full bg-gray-800 flex-shrink-0">
              {car.image ? (
                <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              ) : (
                <div className="w-full h-full flex justify-center items-center text-gray-600">
                  <CarIcon className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md ${car.isAvailable ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {car.isAvailable ? 'Available' : 'Rented'}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md bg-white/60 text-slate-900 border border-slate-200">
                  {car.pricePerDay} TND/day
                </span>
              </div>
            </div>
            
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-slate-900 line-clamp-1">{car.brand} {car.name}</h3>
                </div>
                <p className="text-blue-500 text-sm font-medium mb-4">{car.category}</p>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-slate-400 mb-6 font-medium">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span>{car.transmission}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-gray-500" />
                    <span>{car.fuel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{car.passengers} Seats</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button 
                  onClick={() => setSelectedCalendarCar(car)} 
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                  title="View Calendar"
                >
                  <Calendar className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    setEditingCar(car);
                    setIsAvailableForm(car.isAvailable);
                  }} 
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-gray-800 rounded-lg transition tooltip-trigger"
                  title="Edit Vehicle"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(car.id)} 
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition tooltip-trigger"
                  title="Delete Vehicle"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCalendarCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="bg-slate-50 border border-slate-200 rounded-[2rem] w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">{selectedCalendarCar.name} - Availability</h3>
              <button onClick={() => setSelectedCalendarCar(null)} className="text-slate-400 hover:text-slate-900"><XCircle className="w-6 h-6" /></button>
            </div>
            <CarCalendar car={selectedCalendarCar} />
          </div>
        </div>
      )}
      
      {cars.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/30 w-full max-w-2xl mx-auto mt-10">
          <CarIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No vehicles found</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">Your fleet is currently empty. You can add them manually or click below to populate the database with some example data.</p>
          <button 
            onClick={handleSeedData}
            className="bg-emerald-600 hover:bg-emerald-700 text-slate-900 px-6 py-3 rounded-lg font-bold transition shadow-lg shadow-emerald-500/20"
          >
            Seed Demo Cars
          </button>
        </div>
      )}
    </div>
  );
}
