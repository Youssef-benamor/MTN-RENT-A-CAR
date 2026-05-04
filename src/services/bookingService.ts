import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

const COLLECTION_NAME = "bookings";

export interface BookingData {
  carId: string;
  carName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupDate: string;
  dropoffDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  flightNumber?: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "active" | "completed";
  createdAt: string;
  licenseUrl?: string;
  identityUrl?: string;
}

export const createBooking = async (booking: BookingData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), booking);
    return { id: docRef.id, ...booking };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
  }
};

export const getAllBookings = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as BookingData),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  }
};

export const getBookingsByEmail = async (email: string) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("customerEmail", "==", email),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as BookingData),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  }
};

export const updateBookingStatus = async (
  bookingId: string,
  status: "pending" | "confirmed" | "cancelled" | "active" | "completed",
) => {
  try {
    const bookingRef = doc(db, COLLECTION_NAME, bookingId);
    await updateDoc(bookingRef, { status });
    return true;
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.WRITE,
      `${COLLECTION_NAME}/${bookingId}`,
    );
    return false;
  }
};

export const deleteBooking = async (bookingId: string) => {
  try {
    const bookingRef = doc(db, COLLECTION_NAME, bookingId);
    await deleteDoc(bookingRef);
    return true;
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.WRITE,
      `${COLLECTION_NAME}/${bookingId}`,
    );
    return false;
  }
};

export const updateBooking = async (
  bookingId: string,
  updates: Partial<BookingData>,
) => {
  try {
    const bookingRef = doc(db, COLLECTION_NAME, bookingId);
    await updateDoc(bookingRef, updates);
    return true;
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.WRITE,
      `${COLLECTION_NAME}/${bookingId}`,
    );
    return false;
  }
};
