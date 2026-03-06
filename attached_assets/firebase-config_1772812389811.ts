import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
    apiKey: "AIzaSyCxf2pZpLqWqPwd4DVNxvo5__KJ7EBKNtk",
    authDomain: "darussalam-6af2c.firebaseapp.com",
    projectId: "darussalam-6af2c",
    storageBucket: "darussalam-6af2c.appspot.com",
    messagingSenderId: "618301605634",
    appId: "1:618301605634:web:84c3d10ab166badb29a41b",
    measurementId: "G-TL2VGVNJW8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics if supported
isSupported().then(supported => {
    if (supported) {
        getAnalytics(app);
    }
});