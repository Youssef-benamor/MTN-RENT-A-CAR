import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export default function Testimonials() {
  const { t } = useTranslation();

  const testimonials = [
    {
      name: "Ahmed S.",
      role: t('testimonials.tourist', 'Tourist'),
      text: t('testimonials.1', 'Great service! They delivered the car right to Tunis airport. The process was fast and the car was very clean.'),
      rating: 5
    },
    {
      name: "Marie L.",
      role: t('testimonials.businessTraveler', 'Business Traveler'),
      text: t('testimonials.2', 'Reliable and affordable. I rented a sedan for a week and had zero issues. Highly recommend MTN Rent Car!'),
      rating: 5
    },
    {
      name: "Youssef B.",
      role: t('testimonials.local', 'Local Resident'),
      text: t('testimonials.3', 'Transparent pricing with no hidden fees. The customer support was very helpful when I needed to extend my rental.'),
      rating: 4
    }
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200 overflow-hidden">
      <div className="text-center mb-12">
        <motion.h2 
          className="text-4xl font-bold mb-4 text-slate-900"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {t('testimonials.title', 'What Our Clients Say')}
        </motion.h2>
        <motion.p 
          className="text-slate-400"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {t('testimonials.subtitle', 'Don\'t just take our word for it.')}
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, i) => (
          <motion.div 
            key={i} 
            className="glass p-8 rounded-3xl relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <Quote className="absolute top-6 right-6 w-10 h-10 text-slate-900/5" />
            <div className="flex gap-1 mb-6">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              ))}
              {[...Array(5 - testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-gray-700" />
              ))}
            </div>
            <p className="text-slate-500 mb-8 relative z-10">"{testimonial.text}"</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 text-white font-bold text-lg rounded-full flex items-center justify-center">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
