import { initializeApp } from '@firebase/app';
import { getFirestore } from '@firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBus0iZrJ_xOcxCj8_qwuU9hkAsMOX9_i8",
    authDomain: "cruciverbalist-fb353.firebaseapp.com",
    projectId: "cruciverbalist-fb353",
    storageBucket: "cruciverbalist-fb353.firebasestorage.app",
    messagingSenderId: "994127690419",
    appId: "1:994127690419:web:886fc0c1d59568b035cec6",
    measurementId: "G-0E766H34FL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;