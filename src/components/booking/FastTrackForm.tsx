import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import emailjs from "emailjs-com";
import { useTranslation } from "react-i18next";
import { createBooking, updateBooking } from "../../services/bookingService";
import { storage, ref, uploadBytes, getDownloadURL } from "../../lib/firebase";

interface FastTrackFormProps {
  carId: string;
  carName: string;
  total: number;
  pickupDate: string;
  dropoffDate: string;
  pickupLocation: string;
  dropoffLocation: string;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  license?: FileList;
  identity?: FileList;
  terms: boolean;
  promo: string;
}

const confettiBurst = () => {
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.top = "-10px";
    confetti.style.width = "10px";
    confetti.style.height = "10px";
    confetti.style.backgroundColor = ["#f00", "#0f0", "#00f", "#ff0", "#f0f"][
      Math.floor(Math.random() * 5)
    ];
    confetti.style.pointerEvents = "none";
    confetti.style.zIndex = "10000";
    confetti.style.animation = "confetti-fall 3s linear forwards";
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
};

export default function FastTrackForm(props: FastTrackFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActiveLicense, setDragActiveLicense] = useState(false);
  const [dragActiveIdentity, setDragActiveIdentity] = useState(false);
  const { t } = useTranslation();
  const promoCode = watch("promo");

  const discountedTotal =
    promoCode === "WELCOME10" ? props.total * 0.9 : props.total;

  const compressImage = async (file: File): Promise<File> => {
    if (file.size > 5 * 1024 * 1024)
      throw new Error("File too large (max 5MB)");
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target!.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          canvas.width = 800;
          canvas.height = 800;
          ctx.drawImage(img, 0, 0, 800, 800);
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob!], file.name, { type: "image/jpeg" }));
            },
            "image/jpeg",
            0.7,
          );
        };
      };
    });
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const compressed = await compressImage(file);
    setUploadProgress(50);
    const storageRef = ref(storage, `bookings/${path}`);
    const snapshot = await uploadBytes(storageRef, compressed);
    setUploadProgress(100);
    return getDownloadURL(snapshot.ref);
  };

  const handleDrag = useCallback((isDrag: boolean, isLicense: boolean) => {
    if (isLicense) {
      setDragActiveLicense(isDrag);
    } else {
      setDragActiveIdentity(isDrag);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, isLicense: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      handleDrag(false, isLicense);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const dt = new DataTransfer();
        dt.items.add(file);
        setValue(isLicense ? "license" : ("identity" as any), dt.files);
      }
    },
    [setValue, handleDrag],
  );

  const onSubmit = async (data: FormData) => {
    setStatus("sending");
    setUploadProgress(10);

    try {
      const discount = data.promo === "WELCOME10" ? 0.1 : 0;
      const finalTotal = props.total * (1 - discount);

      const bookingData = {
        ...data,
        carId: props.carId,
        carName: props.carName,
        pickupDate: props.pickupDate,
        dropoffDate: props.dropoffDate,
        pickupLocation: props.pickupLocation,
        dropoffLocation: props.dropoffLocation,
        totalPrice: finalTotal,
        promoCode: data.promo || null,
        promoDiscount: discount,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      };

      const bookingRef = await createBooking(bookingData as any);

      const bookingId = bookingRef?.id || "";
      const licensePromise = data.license?.[0]
        ? uploadFile(data.license[0], `${bookingId}/license.jpg`).then(
            (url) => ({ licenseUrl: url }),
          )
        : Promise.resolve(null);
      const identityPromise = data.identity?.[0]
        ? uploadFile(data.identity[0], `${bookingId}/identity.jpg`).then(
            (url) => ({ identityUrl: url }),
          )
        : Promise.resolve(null);

      const [licenseResult, identityResult] = await Promise.all([
        licensePromise,
        identityPromise,
      ]);
      if (licenseResult || identityResult) {
        await updateBooking(bookingId, {
          ...((licenseResult as any) || {}),
          ...((identityResult as any) || {}),
        });
      }

      // Email
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (
        serviceId &&
        templateId &&
        publicKey &&
        templateId !== "YOUR_TEMPLATE_ID"
      ) {
        emailjs
          .send(
            serviceId,
            templateId,
            {
              to_email: data.email,
              admin_email: "mtnrentcar@gmail.com",
              user_name: data.name,
              car_model: props.carName,
              booking_date: new Date().toLocaleDateString(),
              phone: data.phone,
              total_price: finalTotal,
              promo_code: data.promo || "None",
            },
            publicKey,
          )
          .catch(console.error);
      }

      setStatus("sent");
      reset();
      setTimeout(confettiBurst, 500);
    } catch (error) {
      console.error("Booking failed:", error);
      setStatus("error");
      setUploadProgress(0);
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-emerald-100 rounded-3xl mx-auto mb-6 flex items-center justify-center animate-bounce">
          <svg
            className="w-12 h-12 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Booking Confirmed!
        </h3>
        <p className="text-slate-600 mb-8">We will contact you soon.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition"
        >
          Book Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          placeholder="Full Name *"
          className={`w-full p-4 rounded-full border-2 focus:ring-4 focus:ring-blue-100 transition-colors ${errors.name ? "border-red-500 bg-red-50 animate-shake" : "border-slate-200 hover:border-slate-300"}`}
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <input
          placeholder="+216 23 456 789 *"
          className={`w-full p-4 rounded-full border-2 focus:ring-4 focus:ring-blue-100 transition-colors ${errors.phone ? "border-red-500 bg-red-50 animate-shake" : "border-slate-200 hover:border-slate-300"}`}
          {...register("phone", {
            required: "Phone is required",
            pattern: {
              value: /^[\\+]?216[2-9]\\d{7}$/,
              message: "Tunisian phone (216xxxxxxxx)",
            },
          })}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone?.message}</p>
        )}
      </div>

      <div>
        <input
          type="email"
          placeholder="email@example.com *"
          className={`w-full p-4 rounded-full border-2 focus:ring-4 focus:ring-blue-100 transition-colors ${errors.email ? "border-red-500 bg-red-50 animate-shake" : "border-slate-200 hover:border-slate-300"}`}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
              message: "Valid email required",
            },
          })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email?.message}</p>
        )}
      </div>

      <input
        placeholder="Promo Code (WELCOME10)"
        className="w-full p-4 rounded-full border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        {...register("promo")}
      />
      {promoCode === "WELCOME10" && (
        <p className="text-emerald-600 font-semibold p-3 bg-emerald-50 rounded-xl flex items-center gap-2">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Great! 10% discount applied. Total: {discountedTotal.toFixed(0)} TND
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Driving License (optional)
        </label>
        <div
          className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all hover:border-blue-400 focus:border-blue-500 bg-slate-50/50 min-h-[100px] flex flex-col items-center justify-center group ${
            dragActiveLicense
              ? "border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-100 scale-[1.02]"
              : "border-slate-200 hover:border-slate-400"
          }`}
          onDragEnter={() => handleDrag(true, true)}
          onDragLeave={() => handleDrag(false, true)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, true)}
        >
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            {...register("license")}
          />
          <svg
            className="w-12 h-12 mb-2 text-slate-400 group-hover:text-blue-500 transition"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 5v14M5 12h14"
            />
          </svg>
          <p className="text-lg font-medium text-slate-700 group-hover:text-slate-900">
            Drop or click to upload license
          </p>
          <p className="text-sm text-slate-500">Max 5MB, JPG/PNG</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          ID Card (optional)
        </label>
        <div
          className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all hover:border-blue-400 focus:border-blue-500 bg-slate-50/50 min-h-[100px] flex flex-col items-center justify-center group ${
            dragActiveIdentity
              ? "border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-100 scale-[1.02]"
              : "border-slate-200 hover:border-slate-400"
          }`}
          onDragEnter={() => handleDrag(true, false)}
          onDragLeave={() => handleDrag(false, false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, false)}
        >
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            {...register("identity")}
          />
          <svg
            className="w-12 h-12 mb-2 text-slate-400 group-hover:text-blue-500 transition"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 5v14M5 12h14"
            />
          </svg>
          <p className="text-lg font-medium text-slate-700 group-hover:text-slate-900">
            Drop or click to upload ID
          </p>
          <p className="text-sm text-slate-500">Max 5MB, JPG/PNG</p>
        </div>
      </div>

      <label className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 focus-within:border-blue-500 transition-all group">
        <input
          type="checkbox"
          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 flex-shrink-0"
          {...register("terms", {
            required: "Please accept the terms & conditions",
          })}
        />
        <span className="text-sm text-slate-700 leading-tight">
          I accept the{" "}
          <a
            href="#"
            className="text-blue-600 font-semibold hover:underline focus:underline"
          >
            Terms & Conditions
          </a>{" "}
          *
        </span>
      </label>
      {errors.terms && (
        <p className="text-red-500 text-sm mt-1 ml-8 animate-pulse">
          {errors.terms?.message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-5 px-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 text-lg relative overflow-hidden"
      >
        {status === "sending" ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            Uploading ({uploadProgress}%)
          </>
        ) : (
          `Book Securely - ${Math.round(discountedTotal)} TND`
        )}
      </button>

      {status === "error" && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-800 text-center animate-bounce">
          Booking failed. Please try again or contact support.
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="ml-2 underline font-semibold hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}
    </form>
  );
}
