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

  const handleDeleteBooking = async (bookingId: string) => {
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
      {
        name: "Rio",
        brand: "Kia",
        category: "Economy",
        transmission: "Manual",
        fuel: "Petrol",
        image:
          "https://images.unsplash.com/photo-1633647306228-4ce6e1eff3ec?auto=format&fit=crop&q=80&w=800",
        images: [],
        pricePerDay: 130,
        passengers: 5,
        isAvailable: true,
        features: ["AC", "Bluetooth"],
        rentedUntil: "",
      },
      {
        name: "Leon",
        brand: "Seat",
        category: "Compact",
        transmission: "Manual",
        fuel: "Petrol",
        image:
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800",
        images: [],
        pricePerDay: 180,
        passengers: 5,
        isAvailable: true,
        features: ["AC", "LED Lights"],
        rentedUntil: "",
      },
      {
        name: "Logan",
        brand: "Dacia",
        category: "Economy",
        transmission: "Manual",
        fuel: "Petrol",
        image:
          "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800",
        images: [],
        pricePerDay: 110,
        passengers: 5,
        isAvailable: true,
        features: ["AC"],
        rentedUntil: "",
      },
      {
        name: "Tarraco",
        brand: "Seat",
        category: "SUV",
        transmission: "Automatic",
        fuel: "Diesel",
        image:
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800",
        images: [],
        pricePerDay: 280,
        passengers: 7,
        isAvailable: true,
        features: ["AC", "Sunroof", "Vans"],
        rentedUntil: "",
      },
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
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.6));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const formData = new FormData(e.target as HTMLFormElement);

      let imageUrl = editingCar?.image || "";
      let imagesUrls = editingCar?.images || (imageUrl ? [imageUrl] : []);

      if (imageFiles.length > 0) {
        imagesUrls = [];
        for (const file of imageFiles) {
          const compressedBase64 = await compressImage(file);
          imagesUrls.push(compressedBase64);
        }
        imageUrl = imagesUrls[0];
      }

      const isAvailable = formData.get("isAvailable") === "on";
      const rentedUntil = !isAvailable
        ? (formData.get("rentedUntil") as string) || ""
        : "";

      const carData: Partial<Car> = {
        name: formData.get("name") as string,
        brand: formData.get("brand") as string,
        category: formData.get("category") as any,
        transmission: formData.get("transmission") as any,
        fuel: formData.get("fuel") as any,
        image: imageUrl,
        images: imagesUrls,
        pricePerDay: Number(formData.get("pricePerDay")),
        passengers: Number(formData.get("passengers")),
        isAvailable,
        rentedUntil,
        features:
          (formData.get("features") as string)
            ?.split(",")
            .map((s) => s.trim())
            .filter((s) => s) || [],
      };

      if (editingCar && editingCar.id) {
        await updateCar(editingCar.id, carData);
        setCars((prev) =>
          prev.map((c) => (c.id === editingCar.id ? { ...c, ...carData } : c)),
        );
      } else {
        const docRef = await addCar(carData as any);
        if (docRef) {
          setCars((prev) => [...prev, { ...carData, id: docRef.id } as Car]);
        }

        setEditingCar(null);
        setImageFiles([]);
        setIsSaving(false);
        alert("Car saved successfully!");

        setTimeout(() => {
          fetchCars().catch((err) =>
            console.warn("Background sync failed:", err),
          );
        }, 2000);
        return;
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
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      case "confirmed":
        return "bg-emerald-500/20 text-emerald-600 border-emerald-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-600 border-red-500/30";
      case "active":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "completed":
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">
            {activeTab === "fleet" ? "Fleet Management" : "Booking Management"}
          </h1>
          <p className="text-slate-400">
            {activeTab === "fleet"
              ? "Manage your vehicles, track availability, and update listings."
              : "Review and manage customer bookings."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === "fleet" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-900 hover:bg-slate-100"}`}
          >
            Fleet
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === "bookings" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-900 hover:bg-slate-100"}`}
          >
            Bookings
          </button>
        </div>
      </div>

      {activeTab === "fleet" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-[2rem] flex items-center gap-4">
              <div className="p-4 bg-slate-100 rounded-full">
                <CarIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Total Fleet Size
                </p>
                <p className="text-3xl font-bold text-slate-900">{totalCars}</p>
              </div>
            </div>
            <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-[2rem] flex items-center gap-4">
              <div className="p-4 bg-emerald-500/10 rounded-full">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Available</p>
                <p className="text-3xl font-bold text-slate-900">
                  {availableCars}
                </p>
              </div>
            </div>
            <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-[2rem] flex items-center gap-4">
              <div className="p-4 bg-orange-500/10 rounded-full">
                <CarIcon className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Active Rentals
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {activeRentals}
                </p>
              </div>
            </div>
            <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-[2rem] flex items-center gap-4">
              <div className="p-4 bg-slate-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Daily Revenue
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {currentDailyRevenue} TND
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-[2rem]">
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                Fleet Composition
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fleetComposition}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#9CA3AF"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #374151",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-[2rem]">
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                Avg Price by Type (TND)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={averagePriceByType}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="#9CA3AF"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#9CA3AF"
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #374151",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Bar
                      dataKey="avgPrice"
                      fill="#10B981"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {!editingCar && (
            <button
              onClick={() => {
                setEditingCar({
                  id: "",
                  name: "",
                  brand: "",
                  category: "Economy" as const,
                  transmission: "Manual" as const,
                  fuel: "Petrol" as const,
                  image: "",
                  pricePerDay: 0,
                  passengers: 0,
                  isAvailable: true,
                  features: [],
                });
                setIsAvailableForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-lg mb-10"
            >
              <Plus className="w-5 h-5" />
              Add New Car
            </button>
          )}

          {editingCar && (
            <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 mb-10 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCar.id ? "Edit Vehicle" : "Add New Vehicle"}
                </h2>
                <button
                  onClick={() => setEditingCar(null)}
                  className="text-slate-400 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Brand
                    </label>
                    <input
                      name="brand"
                      defaultValue={editingCar.brand}
                      placeholder="Renault"
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Model
                    </label>
                    <input
                      name="name"
                      defaultValue={editingCar.name}
                      placeholder="Symbol"
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      defaultValue={editingCar.category}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 transition"
                    >
                      <option value="Economy">Economy</option>
                      <option value="Compact">Compact</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Van">Van</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Price/Day (TND)
                    </label>
                    <input
                      name="pricePerDay"
                      type="number"
                      defaultValue={editingCar.pricePerDay}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Transmission
                    </label>
                    <select
                      name="transmission"
                      defaultValue={editingCar.transmission}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 transition"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Fuel
                    </label>
                    <select
                      name="fuel"
                      defaultValue={editingCar.fuel}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 transition"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Passengers
                    </label>
                    <input
                      name="passengers"
                      type="number"
                      defaultValue={editingCar.passengers}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 transition"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Features (comma separated)
                    </label>
                    <input
                      name="features"
                      defaultValue={editingCar.features?.join(", ")}
                      placeholder="AC, Bluetooth"
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 transition"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Images
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        setImageFiles(Array.from(e.target.files || []))
                      }
                      className="w-full p-3 border border-slate-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 hover:file:bg-blue-50"
                    />
                    {imageFiles.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {imageFiles.map((file, idx) => (
                          <img
                            key={idx}
                            src={URL.createObjectURL(file)}
                            alt="preview"
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={isAvailableForm}
                        onChange={(e) => setIsAvailableForm(e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                      <span className="font-medium text-slate-900">
                        Available for Rent
                      </span>
                    </label>
                  </div>
                  {!isAvailableForm && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Rented Until
                      </label>
                      <input
                        type="date"
                        name="rentedUntil"
                        defaultValue={editingCar.rentedUntil || ""}
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 transition"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditingCar(null)}
                    className="px-6 py-2.5 rounded-lg font-medium text-slate-500 hover:text-slate-900 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition shadow-lg"
                  >
                    {isSaving
                      ? "Saving..."
                      : editingCar.id
                        ? "Update Car"
                        : "Add Car"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div
                key={car.id}
                className="bg-slate-50 border border-slate-200 rounded-[1.5rem] overflow-hidden hover:shadow-xl transition-all group"
              >
                <div className="relative h-48 bg-gradient-to-br from-slate-900 to-slate-800">
                  {car.image ? (
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CarIcon className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 space-y-1">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${car.isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
                    >
                      {car.isAvailable ? "Available" : "Rented"}
                    </span>
                    <span className="px-2 py-1 text-xs font-bold bg-white text-slate-900 rounded-full shadow-sm">
                      {car.pricePerDay} TND/day
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-slate-900 mb-1">
                    {car.brand} {car.name}
                  </h3>
                  <p className="text-blue-600 font-semibold mb-4">
                    {car.category}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-500 mb-6">
                    <div className="flex items-center gap-1">
                      <Settings className="w-4 h-4" />
                      {car.transmission}
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="w-4 h-4" />
                      {car.fuel}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {car.passengers} seats
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => setSelectedCalendarCar(car)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Calendar className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCar(car);
                        setIsAvailableForm(car.isAvailable);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition flex-1"
                    >
                      <Edit2 className="w-5 h-5 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleDelete(car.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedCalendarCar && (
            <div
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setSelectedCalendarCar(null)}
            >
              <div
                className="bg-white rounded-[1.5rem] w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedCalendarCar.name} Availability
                  </h3>
                  <button
                    onClick={() => setSelectedCalendarCar(null)}
                    className="text-slate-400 hover:text-slate-900 p-1 rounded-lg"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <CarCalendar car={selectedCalendarCar} />
              </div>
            </div>
          )}

          {cars.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50">
              <CarIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                No vehicles
              </h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                Your fleet is empty. Add demo cars or create your first vehicle.
              </p>
              <button
                onClick={handleSeedData}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
              >
                Load Demo Cars
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === "bookings" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-[2rem] flex items-center gap-4">
              <div className="p-4 bg-slate-100 rounded-full">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Total Bookings
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {totalBookings}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-[2rem] flex items-center gap-4">
              <div className="p-4 bg-yellow-100 rounded-full">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Pending Approval
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {pendingBookings}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-[2rem] flex items-center gap-4">
              <div className="p-4 bg-emerald-100 rounded-full">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Confirmed</p>
                <p className="text-3xl font-bold text-slate-900">
                  {confirmedBookings}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-[2rem] flex items-center gap-4">
              <div className="p-4 bg-slate-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalRevenue} TND
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">
                  Customer Bookings
                </h3>
                <button
                  onClick={fetchBookings}
                  disabled={isLoadingBookings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition"
                >
                  {isLoadingBookings ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    "Refresh"
                  )}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-900">
                      Customer
                    </th>
                    <th className="text-left p-4 font-semibold text-slate-900">
                      Vehicle
                    </th>
                    <th className="text-left p-4 font-semibold text-slate-900">
                      Period
                    </th>
                    <th className="text-left p-4 font-semibold text-slate-900">
                      Amount
                    </th>
                    <th className="text-left p-4 font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="text-left p-4 font-semibold text-slate-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-t border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">
                          {booking.customerName}
                        </div>
                        <div className="text-sm text-slate-600">
                          {booking.customerEmail}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {booking.customerPhone}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">
                          {booking.carName}
                        </div>
                        <div className="text-sm text-slate-600">
                          ID: {booking.carId}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          {booking.pickupDate} → {booking.dropoffDate}
                        </div>
                        <div className="text-sm text-slate-600">
                          {booking.pickupLocation}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-emerald-600 text-lg">
                        {booking.totalPrice} TND
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(booking.status).replace("text-", "bg-").replace("border-", "text-")}`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">
                          {booking.status === "pending" && (
                            <button
                              onClick={() => handleAcceptBooking(booking.id)}
                              className="px-4 py-1.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm"
                            >
                              ✓ Accept
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1"
                            title="Delete booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-lg font-semibold text-slate-500">
                          No bookings yet
                        </p>
                        <p className="text-slate-400 mt-1">
                          Bookings will appear here when customers complete
                          forms.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    {deletedBooking && (
      <motion.div 
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 max-w-md z-[60] flex items-center justify-between gap-4"
        onClick={handleUndo}
      >
        <span>Booking deleted ({deletedBooking.customerName}) - Undo? (5s)</span>
        <button 
          className="text-blue-400 hover:text-blue-300 font-semibold px-3 py-1 rounded-lg bg-blue-900/30 hover:bg-blue-800/50 transition ml-auto"
        >
          Undo
        </button>
      </motion.div>
    )}
  );
}
