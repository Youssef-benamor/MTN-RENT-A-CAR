const admin = require("firebase-admin");
const config = require("../firebase-applet-config.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.projectId,
      privateKey: "your-service-account-private-key",
      clientEmail: "your-service-account@project.iam.gserviceaccount.com",
    }),
  });
}

async function main() {
  const uid = "cJZWmThAu0fw4WVddRU3lkoQHkp2";
  await admin.firestore().collection("admins").doc(uid).set({
    email: "youssefbenamor@gmail.com",
    role: "admin",
    addedAt: new Date().toISOString(),
  });
  console.log("Admin assigned!");
}

main().catch(console.error);
