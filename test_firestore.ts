import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "gen-lang-client-0776382252",
  "appId": "1:499445495919:web:67ac38ba91ff21e26b759a",
  "apiKey": "AIzaSyCqgjQtOV8wOEpRQG8QtQryi_tNqbL1SPE",
  "authDomain": "gen-lang-client-0776382252.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-f7fa745e-432b-457f-a478-981f18e07f62",
  "storageBucket": "gen-lang-client-0776382252.firebasestorage.app",
  "messagingSenderId": "499445495919"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      name: "Test Node.js",
      message: "Hello!"
    });
    console.log("Success: ", docRef.id);
  } catch (err) {
    console.error("Error: ", err);
  }
}
test();
