import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';

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

export async function addMessage(name, email, message) {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      name,
      email: email || "未留联系方式",
      message,
      createdAt: serverTimestamp()
    });
    console.log("Message saved with ID: ", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
}

export async function getMessages() {
  try {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return messages;
  } catch (error) {
    console.error("Error getting documents: ", error);
    throw error;
  }
}
