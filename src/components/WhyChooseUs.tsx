import { ShieldCheck, Sparkles, PhoneCall, Plane, CreditCard } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export default function WhyChooseUs() {
  const { t } = useTranslation();

  const features = [
    { icon: Plane, title: t('whyUs.features.0.title'), description: t('whyUs.features.0.desc'), color: 'text-blue-600', bg: 'bg-blue-600/10' },
    { icon: Sparkles, title: t('whyUs.features.1.title'), description: t('whyUs.features.1.desc'), color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: CreditCard, title: t('whyUs.features.2.title'), description: t('whyUs.features.2.desc'), color: 'text-slate-900', bg: 'bg-slate-100' },
  ];

  return (
    <section id="why" className="py-20 px-6 glass border-y border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-4xl mb-12 text-center text-slate-900"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {t('whyUs.title')}
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              className="flex flex-col items-center text-center p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <div className={`${f.bg} p-4 rounded-full mb-6 relative group cursor-pointer overflow-hidden`}>
                <div className="absolute inset-0 bg-slate-50/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></div>
                <f.icon className={`w-8 h-8 ${f.color} relative z-10`} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">{f.title}</h3>
              <p className="text-slate-400">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
