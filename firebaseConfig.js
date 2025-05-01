import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC0NCoBEthxyC0Io61--nyUJGojGmeG3YQ",
    authDomain: "saucia-6c18c.firebaseapp.com",
    projectId: "saucia-6c18c",
    storageBucket: "saucia-6c18c.firebasestorage.app",
    messagingSenderId: "374396762838",
    appId: "1:374396762838:web:56d626a30628604ca62777",
    measurementId: "G-26GTMC69QB"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };