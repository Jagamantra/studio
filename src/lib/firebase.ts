
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
// Import other Firebase services as needed:
// import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseEnvConfig = {
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

// Helper function to check if essential Firebase config values are present and not placeholders
export const isFirebaseConfigured = (): boolean => {
  const apiKey = firebaseEnvConfig.apiKey;
  const projectId = firebaseEnvConfig.projectId;

  if (!apiKey || !projectId) {
    return false;
  }

  // Check for common placeholder patterns
  const placeholderPatterns = ["REPLACE_WITH_YOUR", "YOUR_FIREBASE_API_KEY", "YOUR_FIREBASE_PROJECT_ID"];
  
  const isApiKeyPlaceholder = placeholderPatterns.some(pattern => apiKey.includes(pattern));
  const isProjectIdPlaceholder = placeholderPatterns.some(pattern => projectId.includes(pattern));

  if (isApiKeyPlaceholder || isProjectIdPlaceholder) {
    return false;
  }

  return true;
};

if (isFirebaseConfigured()) {
  if (!getApps().length) {
    try {
      appInstance = initializeApp(firebaseEnvConfig);
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
  // This message will now correctly appear if actual keys are missing OR if placeholders are used.
  console.warn(
    "Firebase configuration is missing, incomplete, or uses placeholder values. Firebase services will not be initialized, and dummy authentication will be used if available."
  );
}

// Export potentially undefined services using their intended export names
export { appInstance as app, authServiceInstance as auth /*, dbInstance as db, storageInstance as storage */ };
