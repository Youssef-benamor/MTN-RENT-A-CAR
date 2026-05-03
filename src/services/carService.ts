import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Car } from '../types';

const COLLECTION_NAME = 'cars';

export const getCars = async (onlyAvailable: boolean = false): Promise<Car[]> => {
  try {
    let q = query(collection(db, COLLECTION_NAME));
    if (onlyAvailable) {
      q = query(collection(db, COLLECTION_NAME), where('isAvailable', '==', true));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Car));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    return []; // Should not reach here as handleFirestoreError throws
  }
};

export const addCar = async (car: Omit<Car, 'id'>): Promise<Car> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), car);
    return {
      id: docRef.id,
      ...car
    } as Car;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    throw error;
  }
};

export const updateCar = async (id: string, carUpdate: Partial<Car>): Promise<Car> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, carUpdate);
    // Fetch updated data for confirmation if needed, but normally we just return merged
    return { id, ...carUpdate } as Car; 
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
};

export const deleteCar = async (id: string): Promise<{ message: string }> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return { message: 'Deleted successfully' };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
};
