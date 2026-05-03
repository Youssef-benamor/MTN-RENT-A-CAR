import React from "react";
import { Phone, MessageCircle, Car, MapPin, Facebook } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import logo from "../assets/Mtnlogo.png";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-transparent border-t border-slate-200 py-12 px-6 mt-auto overflow-hidden">
      <motion.div
        className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="MTN Rent Car"
            className="h-24 md:h-32 w-auto object-contain"
          />
        </div>

        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} MTN Rent Car. {t("footer.rights")}
        </div>
      </motion.div>
    </footer>
  );
}
