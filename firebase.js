// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
//import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqBlPHHaNkYEb1S5WNMqanv3k9IAqmTyk",
  authDomain: "kitchenmaster-5a440.firebaseapp.com",
  projectId: "kitchenmaster-5a440",
  storageBucket: "kitchenmaster-5a440.firebasestorage.app",
  messagingSenderId: "1067021520845",
  appId: "1:1067021520845:web:78412af3baec31cc367e84",
  measurementId: "G-DD45QZVMX7"
};


// const firebaseConfig = {
//   apiKey: "AIzaSyBHaiRVMug-oIs9uaKmaJYyRP9Yus1jFeg",
//   authDomain: "kitchenmaster-73e91.firebaseapp.com",
//   projectId: "kitchenmaster-73e91",
//   storageBucket: "kitchenmaster-73e91.firebasestorage.app",
//   messagingSenderId: "454405501374",
//   appId: "1:454405501374:web:3d74e9ac7e3fffb3b009ef"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
//export const auth = getAuth(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);