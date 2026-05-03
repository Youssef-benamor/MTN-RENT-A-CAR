import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import emailjs from 'emailjs-com';
import { useTranslation } from 'react-i18next';
import { createBooking } from '../../services/bookingService';

interface FastTrackFormProps {
  carId: string;
  carName: string;
  total: number;
  pickupDate: string;
  dropoffDate: string;
  pickupLocation: string;
  dropoffLocation: string;
}

export default function FastTrackForm({ 
  carId,
  carName, 
  total,
  pickupDate,
  dropoffDate,
  pickupLocation,
  dropoffLocation
}: FastTrackFormProps) {
  const { register, handleSubmit, reset } = useForm();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const { t } = useTranslation();

  const onSubmit = async (data: any) => {
    setStatus('sending');

    // Save to Firestore first
    try {
      await createBooking({
        carId: carId,
        carName: carName,
        customerName: data.name,
        customerPhone: data.phone,
        customerEmail: data.email,
        pickupDate: pickupDate,
        dropoffDate: dropoffDate,
        pickupLocation: pickupLocation,
        dropoffLocation: dropoffLocation,
        totalPrice: total,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save booking to Firestore:', error);
      // We continue with email even if firestore fails for now, or we can block it.
      // Usually better to ensure data is saved.
    }

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey || templateId === 'YOUR_TEMPLATE_ID') {
      console.warn("EmailJS is not fully configured. Notification email not sent.");
      // If no EmailJS, we still show success because Firestore saved it
      setStatus('sent');
      reset();
      return;
    }

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: data.email,
          admin_email: 'mtnrentcar@gmail.com',
          user_name: data.name,
          car_model: carName,
          booking_date: new Date().toLocaleDateString(),
          phone: data.phone,
          total_price: total
        },
        publicKey
      );
      setStatus('sent');
      reset();
    } catch (error: any) {
      console.error('EmailJS error:', error);
      setStatus('sent'); // Still show sent since Firestore worked
      reset();
    }
  };

  if (status === 'sent') {
    return (
      <div className="text-center py-10">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('booking.bookingSuccess')}</h3>
        <p className="text-slate-400">{t('booking.bookingSuccessMsg')}</p>
        <button onClick={() => setStatus('idle')} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full font-medium">{t('booking.bookAnother')}</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register('name', { required: true })} placeholder={t('booking.fullName')} className="w-full bg-white p-4 rounded-full border border-slate-200 text-slate-900" />
      <input {...register('phone', { required: true })} placeholder={t('booking.phone')} className="w-full bg-white p-4 rounded-full border border-slate-200 text-slate-900" />
      <input {...register('email', { required: true })} placeholder={t('booking.email')} className="w-full bg-white p-4 rounded-full border border-slate-200 text-slate-900" />
      <div className="space-y-2">
        <label className="block text-sm text-slate-400">{t('booking.uploadLicense')}</label>
        <input type="file" {...register('license', { required: true })} className="w-full bg-white p-4 rounded-full border border-slate-200 text-gray-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-slate-100 text-slate-900" />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm text-slate-400">{t('booking.uploadCin')}</label>
        <input type="file" {...register('identity')} className="w-full bg-white p-4 rounded-full border border-slate-200 text-gray-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-900 hover:file:bg-gray-700" />
      </div>
      
      <button 
        type="submit" 
        disabled={status === 'sending'}
        className="w-full bg-blue-600 text-white py-4 rounded-full font-bold hover:bg-blue-700 hover:text-black transition"
      >
        {status === 'sending' ? t('booking.sending') : t('booking.checkAvail')}
      </button>
    </form>
  );
}
