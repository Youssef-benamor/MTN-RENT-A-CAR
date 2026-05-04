import React, { useState, useEffect } from "react";
import { Car, Booking } from "../../types";
import {
  getCars,
  addCar,
  updateCar,
  deleteCar,
} from "../../services/carService";
import {
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} from "../../services/bookingService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Plus,
  Edit2,
  Trash2,
  Car as CarIcon,
  CheckCircle,
  XCircle,
  Users,
  Settings,
  Fuel,
  TrendingUp,
  Calendar,
  FileText,
  Clock,
  Check,
  Mail,
  Phone,
} from "lucide-react";
import { motion } from "motion/react";
import CarCalendar from "./CarCalendar";

export default function AdminDashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [selectedCalendarCar, setSelectedCalendarCar] = useState<Car | null>(
    null,
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isAvailableForm, setIsAvailableForm] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"fleet" | "bookings">("fleet");
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [deletedBooking, setDeletedBooking] = useState<Booking | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  // Derived Analytics Data
  const fleetComposition = Object.entries(
    cars.reduce(
      (acc, car) => ({ ...acc, [car.category]: (acc[car.category] || 0) + 1 }),
      {} as Record<string, number>,
    ),
  ).map(([name, count]) => ({ name, count }));

  const averagePriceByType = Object.entries(
    cars.reduce(
      (acc, car) => {
        if (!acc[car.category]) acc[car.category] = { sum: 0, count: 0 };
        acc[car.category].sum += car.pricePerDay;
        acc[car.category].count += 1;
        return acc;
      },
      {} as Record<string, { sum: number; count: number }>,
    ),
  ).map(([name, data]: [string, any]) => ({
    name,
    avgPrice: Math.round(data.sum / data.count),
  }));

  // Booking Analytics
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;
  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "active")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const totalCars = cars.length;
  const availableCars = cars.filter((c) => c.isAvailable).length;
  const activeRentals = totalCars - availableCars;
  const currentDailyRevenue = cars
    .filter((c) => !c.isAvailable)
    .reduce((sum, c) => sum + c.pricePerDay, 0);

  useEffect(() => {
    fetchCars();
    fetchBookings();
  }, []);

  const fetchCars = async () => {
    try {
      const data = await getCars();
      setCars(data || []);
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

  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const data = (await getAllBookings()) || [];
      console.log("Bookings loaded:", data);
      setBookings(data);
    } catch (error: any) {
      console.error("Bookings error:", error);
      alert("Failed to load bookings: " + (error.message || "Unknown error"));
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    const success = await updateBookingStatus(bookingId, "confirmed");
    if (success) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "confirmed" } : b,
        ),
      );
    } else {
      alert("Failed to accept booking");
    }
  };

  const handleSoftDelete = async (bookingId: string) => {
    const bookingToDelete = bookings.find((b) => b.id === bookingId);
    if (!bookingToDelete) return;

    // Optimistic update
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));

    const timeout = setTimeout(async () => {
      try {
        await deleteBooking(bookingId);
      } catch (error) {
        console.error("Failed to permanent delete:", error);
        // Restore on failure
        setBookings((prev) => [...prev, bookingToDelete]);
      }
      setDeletedBooking(null);
      setUndoTimeout(null);
    }, 5000);

    setDeletedBooking(bookingToDelete);
    setUndoTimeout(timeout);
  };

  const handleUndo = () => {
    if (deletedBooking && undoTimeout) {
      clearTimeout(undoTimeout);
      setBookings((prev) => [...prev, deletedBooking]);
      setDeletedBooking(null);
      setUndoTimeout(null);
    }
  };

  const handleDeleteBooking = (bookingId: string) => {
    handleSoftDelete(bookingId);
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
      {
        name: "Symbol",
        brand: "Renault",
        category: "Economy",
        transmission: "Manual",
        fuel: "Petrol",
        image:
          "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800",
        images: [],
        pricePerDay: 120,
        passengers: 5,
        isAvailable: true,
        features: ["AC", "Radio"],
        rentedUntil: "",
      },
      // ... other demo cars ...
    ];
    try {
      for (const car of demoCars) {
        await addCar(car);
      }
      fetchCars();
      alert("Demo cars added!");
    } catch (error) {
      alert("Failed to add demo cars");
    }
  };

  // ... rest of functions like compressImage, handleSave, getStatusColor ...

  // JSX return (main structure)
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header, tabs */}
      {/* Fleet tab */}
      {/* Bookings tab with table */}
      {/* Snackbar */}
      {deletedBooking && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-[60] max-w-md flex items-center gap-4"
        >
          <span>Booking deleted ({deletedBooking.customerName})</span>
          <button
            onClick={handleUndo}
            className="text-blue-400 font-bold px-4 py-1 rounded-lg hover:bg-blue-900/30 ml-auto"
          >
            Undo
          </button>
        </motion.div>
      )}
    </div>
  );
}
