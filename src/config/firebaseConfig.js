import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAvNFg0PY28a2-bG-IYVWrIs18VVEZdFMM",
  authDomain: "mobilestart-416a9.firebaseapp.com",
  projectId: "mobilestart-416a9",
  storageBucket: "mobilestart-416a9.appspot.com",
  messagingSenderId: "268632717803",
  appId: "1:268632717803:web:1bd3b29cfb5667401501ae",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();


export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
