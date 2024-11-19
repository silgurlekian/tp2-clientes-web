import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDvjDAWQqdh6qj1eJUhrc7LYFgGxkzmO6c",
    authDomain: "chat-global-89b26.firebaseapp.com",
    projectId: "chat-global-89b26",
    storageBucket: "chat-global-89b26.appspot.com",
    messagingSenderId: "481751143101",
    appId: "1:481751143101:web:4911e49f2ebaf4eda39dd4",
    measurementId: "G-YFH12HQRWT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };