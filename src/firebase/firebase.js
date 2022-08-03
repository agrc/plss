import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

let firebaseApp;
const usingEmulator = () => import.meta.env.DEV;

export const setupFirebase = () => {
  try {
    firebaseApp = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APPID,
    });
  } catch (error) {
    console.error({ error });
  }
};

let auth;
let firestore;
let storage;
let functions;

export const addAuth = () => {
  auth = getAuth(firebaseApp);
  try {
    if (usingEmulator()) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
  } catch (error) {
    console.error({ error });
    return auth;
  }

  return auth;
};

export const addFirestore = () => {
  if (!firestore) {
    firestore = getFirestore();
    if (usingEmulator()) {
      connectFirestoreEmulator(firestore, 'localhost', 8080);
    }
  }

  return firestore;
};

export const addStorage = () => {
  if (!storage) {
    storage = getStorage();
    if (usingEmulator()) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
  }

  return storage;
};

export const addFunctions = () => {
  if (!functions) {
    functions = getFunctions();
    if (usingEmulator()) {
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }
  }

  return functions;
};
