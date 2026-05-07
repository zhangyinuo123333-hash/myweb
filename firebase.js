import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export async function addMessage(name, email, message) {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      name,
      email: email || "未留联系方式",
      message,
      createdAt: serverTimestamp()
    });
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
