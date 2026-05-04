import { getFirestore, doc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import config from "../firebase-applet-config.json" assert { type: "json" };

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function addAdmin() {
  const uid = "cJZWmThAu0fw4WVddRU3lkoQHkp2"; // UID from error
  await setDoc(doc(db, "admins", uid), {
    email: "youssefbenamor@gmail.com",
    role: "admin",
    addedAt: new Date().toISOString(),
  });
  console.log("Admin role assigned successfully for UID:", uid);
}

addAdmin().catch(console.error);
