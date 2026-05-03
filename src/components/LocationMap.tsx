import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export default function LocationMap() {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-12">
        <motion.h2 
          className="text-4xl font-bold mb-4 text-slate-900"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Visit Our Agency
        </motion.h2>
        <motion.p 
          className="text-slate-400"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Conveniently located for easy pickup and drop-off.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <motion.div 
            className="glass p-6 rounded-[2rem] flex items-start gap-4 border border-slate-200 hover:border-blue-500/50 transition"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-slate-100 p-3 rounded-full text-blue-600">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Location</h3>
              <p className="text-slate-400 text-sm mb-4">MTN Rent Car<br/>Immeuble Tabnina (près d'Attijari Bank)<br/>Av. Mongi Bali, Nabeul 8000</p>
              <a 
                href="https://maps.app.goo.gl/2qXgfUVinBytmUfU8" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Get Directions &rarr;
              </a>
            </div>
          </motion.div>

          <motion.div 
            className="glass p-6 rounded-[2rem] flex items-start gap-4 border border-slate-200 hover:border-blue-600/50 transition"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="bg-slate-100 p-3 rounded-full text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Working Hours</h3>
              <p className="text-slate-400 text-sm">Monday - Sunday<br/>24/7 Available</p>
            </div>
          </motion.div>

          <motion.div 
            className="glass p-6 rounded-[2rem] flex items-start gap-4 border border-slate-200 hover:border-blue-600/50 transition"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-slate-100 p-3 rounded-full text-blue-600">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Contact Us</h3>
              <div className="space-y-3 mt-2">
                <a href="tel:+21620512000" className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors">
                  <Phone className="w-5 h-5 text-blue-600" />
                  +216 20 512 000
                </a>
                <a href="mailto:mtnrentcar@gmail.com" className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors">
                  <Mail className="w-5 h-5 text-blue-600" />
                  mtnrentcar@gmail.com
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="md:col-span-2 glass rounded-3xl overflow-hidden h-[500px] border border-slate-200 relative group"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3204.6062324912953!2d10.731454153093247!3d36.45266850022718!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd3546766468bb%3A0xc36761019685764d!2sMTS%20Rent%20Car!5e0!3m2!1sen!2stn!4v1715000000000!5m2!1sen!2stn" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Location Map"
            className="w-full h-full"
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
}
