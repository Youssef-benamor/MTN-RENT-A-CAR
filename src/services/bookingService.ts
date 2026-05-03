import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const COLLECTION_NAME = 'bookings';

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
  status: 'pending' | 'confirmed' | 'cancelled' | 'active' | 'completed';
  createdAt: string;
}

export const createBooking = async (booking: BookingData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), booking);
    return { id: docRef.id, ...booking };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
  }
};

export const getBookingsByEmail = async (email: string) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('customerEmail', '==', email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  }
};
