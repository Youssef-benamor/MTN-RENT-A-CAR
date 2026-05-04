/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CarFleet from "./components/CarFleet";
import WhyChooseUs from "./components/WhyChooseUs";
import FAQ from "./components/FAQ";
import Testimonials from "./components/Testimonials";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import LocationMap from "./components/LocationMap";
import BookingModal from "./components/booking/BookingModal";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminLogin from "./components/admin/AdminLogin";
import Footer from "./components/Footer";
import { Car, SearchCriteria } from "./types";
import { AnimatePresence } from "motion/react";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function App() {
  const [view, setView] = useState<"home" | "admin">("home");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    pickupDate: "",
    dropoffDate: "",
    carType: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Check if the user is the admin (hardcoded check for simplicity or via doc lookup)
      // In a real app, you'd check a Firestore doc, e.g., /admins/{userId}
      if (
        user &&
        (user.email === "youssefbenamor1234@gmail.com" ||
          user.email === "youssefbenamor@gmail.com" ||
          user.email === "ayoubbouazizi619@gmail.com")
      ) {
        setIsAdminAuthenticated(true);
      } else {
        setIsAdminAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAdminAuthenticated(false);
      setView("home");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Navbar
        view={view}
        setView={setView}
        isAuthenticated={isAdminAuthenticated}
        onLogout={handleLogout}
      />
      <main className="flex-grow pt-24">
        {view === "admin" ? (
          isAdminAuthenticated ? (
            <AdminDashboard />
          ) : (
            <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />
          )
        ) : (
          <>
            <Hero
              searchCriteria={searchCriteria}
              setSearchCriteria={setSearchCriteria}
            />
            <CarFleet
              onCheck={setSelectedCar}
              searchCriteria={searchCriteria}
            />
            <WhyChooseUs />
            <Testimonials />
            <FAQ />
            <LocationMap />
            <FloatingWhatsApp />
          </>
        )}
      </main>
      <Footer />
      <AnimatePresence>
        {selectedCar && (
          <BookingModal
            car={selectedCar}
            onClose={() => setSelectedCar(null)}
            searchCriteria={searchCriteria}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
