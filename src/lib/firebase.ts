
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
// Import other Firebase services as needed:
// import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

let appInstance: FirebaseApp | undefined = undefined;
let authServiceInstance: Auth | undefined = undefined; // Renamed to avoid confusion with export name
// let dbInstance: Firestore | undefined = undefined;
// let storageInstance: FirebaseStorage | undefined = undefined;

// Helper function to check if essential Firebase config values are present
export const isFirebaseConfigured = (): boolean => {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
};

if (isFirebaseConfigured()) {
  if (!getApps().length) {
    try {
      appInstance = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Firebase: Failed to initialize app. Check your Firebase config.", e);
      // appInstance will remain undefined, subsequent service initializations will be skipped.
    }
  } else {
    appInstance = getApp();
  }

  if (appInstance) {
    try {
      authServiceInstance = getAuth(appInstance);
    } catch (e) {
      console.error("Firebase: Failed to get Auth instance. Ensure app was initialized correctly.", e);
      // authServiceInstance will remain undefined.
    }
    // Example for other services:
    // try {
    //   dbInstance = getFirestore(appInstance);
    // } catch (e) {
    //   console.error("Firebase: Failed to get Firestore instance:", e);
    // }
    // try {
    //   storageInstance = getStorage(appInstance);
    // } catch (e) {
    //   console.error("Firebase: Failed to get Storage instance:", e);
    // }
  }
} else {
  console.warn(
    "Firebase configuration is missing or incomplete (e.g., NEXT_PUBLIC_FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in .env). Firebase services will not be initialized."
  );
}

// Export potentially undefined services using their intended export names
export { appInstance as app, authServiceInstance as auth /*, dbInstance as db, storageInstance as storage */ };
