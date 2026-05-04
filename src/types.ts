export interface Car {
  id: string;
  name: string;
  brand: string;
  category: "Economy" | "Compact" | "Sedan" | "SUV" | "Luxury" | "Van";
  pricePerDay: number;
  transmission: "Manual" | "Automatic";
  fuel: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  image: string;
  images?: string[];
  passengers: number;
  isAvailable: boolean;
  features: string[];
  location?: string;
  minDays?: number;
  rentedUntil?: string;
}

export interface Booking {
  id: string;
  carId: string;
  carName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  dropoffDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  flightNumber?: string;
  licenseUrl?: string;
  identityUrl?: string;
  totalPrice: number;
  promoCode?: string;
  promoDiscount?: number;
  status: "pending" | "confirmed" | "cancelled" | "active" | "completed";
  createdAt: string;
}

export interface SearchCriteria {
  pickupDate: string;
  dropoffDate: string;
  carType: string;
  pickupLocation?: string;
}
