import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      name: "Test",
      email: "test@test.com",
      message: "This is a test",
      createdAt: serverTimestamp()
    });
    console.log("Success! ID:", docRef.id);
  } catch(e) {
    console.error("Firebase Error:");
    console.error(e);
  }
}
test();
