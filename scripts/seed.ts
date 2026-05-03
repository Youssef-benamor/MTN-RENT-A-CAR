import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import fs from "fs";

// Read Firebase config from the same directory where it is mapped
const rawData = fs.readFileSync("firebase-applet-config.json", "utf8");
const firebaseConfig = JSON.parse(rawData);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const carsCol = collection(db, "cars");

const cars = [
  {
    name: "Kia Picanto",
    type: "Economic",
    transmission: "Manual",
    fuel: "Essence",
    passengers: 5,
    image: "/assets/cars/kia-picanto.png",
    pricePerDay: 70,
    isAvailable: true,
  },
  {
    name: "Hyundai Grand i10",
    type: "Economic",
    transmission: "Manual/Automatic",
    fuel: "Essence",
    passengers: 5,
    image: "/assets/cars/hyundai-i10.png",
    pricePerDay: 75,
    isAvailable: true,
  },
  {
    name: "Renault Symbol",
    type: "Economic",
    transmission: "Manual",
    fuel: "Essence",
    passengers: 5,
    image: "/assets/cars/renault-symbol.png",
    pricePerDay: 80,
    isAvailable: true,
  },
  {
    name: "Dacia Sandero Stepway",
    type: "Compact",
    transmission: "Manual",
    fuel: "Essence/Diesel",
    passengers: 5,
    image: "/assets/cars/dacia-sandero.png",
    pricePerDay: 90,
    isAvailable: true,
  },
  {
    name: "Peugeot 208",
    type: "Compact",
    transmission: "Manual",
    fuel: "Essence",
    passengers: 5,
    image: "/assets/cars/peugeot-208.png",
    pricePerDay: 95,
    isAvailable: true,
  },
  {
    name: "Volkswagen Golf 8",
    type: "Premium",
    transmission: "Automatic",
    fuel: "Essence/Diesel",
    passengers: 5,
    image: "/assets/cars/golf-8.png",
    pricePerDay: 150,
    isAvailable: true,
  },
  {
    name: "Kia Sportage",
    type: "SUV",
    transmission: "Automatic",
    fuel: "Diesel",
    passengers: 5,
    image: "/assets/cars/kia-sportage.png",
    pricePerDay: 180,
    isAvailable: true,
  },
  {
    name: "Wallys Iris",
    type: "Adventure",
    transmission: "Manual",
    fuel: "Essence",
    passengers: 2,
    image: "/assets/cars/wallys-iris.png",
    pricePerDay: 100,
    isAvailable: true,
  },
  {
    name: "Suzuki Celerio",
    type: "Economic",
    transmission: "Manual",
    fuel: "Essence",
    passengers: 5,
    image: "/assets/cars/suzuki-celerio.png",
    pricePerDay: 70,
    isAvailable: true,
  },
  {
    name: "Fiat Tipo",
    type: "Compact",
    transmission: "Manual/Automatic",
    fuel: "Essence/Diesel",
    passengers: 5,
    image: "/assets/cars/fiat-tipo.png",
    pricePerDay: 90,
    isAvailable: true,
  },
];

async function seed() {
  console.log("Seeding data into Firestore...");
  for (const car of cars) {
    try {
      await addDoc(carsCol, car);
      console.log(`Added: ${car.name}`);
    } catch (e) {
      console.error(`Error adding ${car.name}:`, e);
    }
  }
  console.log("Seeding complete!");
  process.exit(0);
}

seed();
