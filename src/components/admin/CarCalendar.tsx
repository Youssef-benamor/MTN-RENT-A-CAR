import React from 'react';
import { Car } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarCalendarProps {
  car: Car;
}

export default function CarCalendar({ car }: CarCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const isBooked = (day: number) => {
    if (!car.rentedUntil) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const rentedUntil = new Date(car.rentedUntil);
    const today = new Date();
    
    return date >= today && date <= rentedUntil;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="text-slate-400 hover:text-slate-900"><ChevronLeft className="w-5 h-5"/></button>
        <span className="text-slate-900 font-medium">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="text-slate-400 hover:text-slate-900"><ChevronRight className="w-5 h-5"/></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={i}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {blanks.map((_, i) => <div key={i}></div>)}
        {days.map(day => (
          <div 
            key={day} 
            className={`p-1 rounded ${isBooked(day) ? 'bg-red-500/20 text-red-400' : 'bg-slate-100 text-slate-500'}`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
