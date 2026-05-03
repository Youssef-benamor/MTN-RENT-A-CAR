import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: t('faq.q1', 'What do I need to rent a car?'),
      answer: t('faq.a1', 'You need a valid driver\'s license and a CIN card or passport. A cash or check deposit is also required upon delivery.')
    },
    {
      question: t('faq.q2', 'Do you offer airport delivery?'),
      answer: t('faq.a2', 'Yes, we offer free delivery to Tunis-Carthage Airport. We can also deliver to other locations across Tunisia for a small fee.')
    },
    {
      question: t('faq.q3', 'What is your cancellation policy?'),
      answer: t('faq.a3', 'You can cancel your booking for free up to 48 hours before the pickup time. Late cancellations may be subject to a fee.')
    },
    {
      question: t('faq.q4', 'Are there any hidden fees?'),
      answer: t('faq.a4', 'No, we believe in transparent pricing. The price you see is the price you pay. The deposit is fully refundable.')
    }
  ];

  return (
    <section className="py-20 px-6 max-w-4xl mx-auto overflow-hidden">
      <div className="text-center mb-12">
        <motion.h2 
          className="text-4xl font-bold mb-4 text-slate-900"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {t('faq.title', 'Frequently Asked Questions')}
        </motion.h2>
        <motion.p 
          className="text-slate-400"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {t('faq.subtitle', 'Got questions? We have answers.')}
        </motion.p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div 
            key={index} 
            className="glass border border-slate-200 rounded-[2rem] overflow-hidden transition-all duration-300"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <button
              className="w-full text-left px-6 py-5 flex justify-between items-center text-slate-900 font-medium hover:bg-slate-50/5 transition"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="text-lg pr-4">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
              )}
            </button>
            
            <AnimatePresence>
              {openIndex === index && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 overflow-hidden"
                >
                  <p className="text-slate-400 leading-relaxed pb-5 pt-2 border-t border-slate-100">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
