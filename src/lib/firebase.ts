import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  browserLocalPersistence, 
  browserPopupRedirectResolver, 
  initializeAuth 
} from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  getDocFromServer, 
  enableIndexedDbPersistence 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

if (typeof window !== 'undefined') {
  console.log("Firebase initialized with project:", firebaseConfig.projectId);
}

// Initialize Auth with persistence and popup resolver for iframe stability
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});

// Using initializeFirestore with long-polling to bypass WebSocket issues in proxy environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented-state') {
      console.warn('Persistence failed: Browser not supported');
    }
  });
}

// Connectivity check as per guidelines
async function testConnection() {
  try {
    // Attempting a server-side fetch on a publicly readable path to verify actual connectivity
    // Using hero_config which matches rule 'allow read: if true'
    await getDocFromServer(doc(db, 'hero_config', 'default'));
    console.log("Firestore connection verified successfully.");
  } catch (error) {
    if (error instanceof Error) {
      // Permission denied is actually a good sign - it means we REACHED the server
      if (error.message.includes('permission-denied') || error.message.includes('Permission denied')) {
        console.log("Firestore reachability stable (Auth restriction active).");
        return;
      }

      if (error.message.includes('offline') || error.message.includes('unavailable') || error.message.includes('deadline-exceeded')) {
        console.error("Firebase connection check failed: The server is unreachable.");
        console.warn("ACTION REQUIRED: Ensure these domains are added to 'Authorized Domains' in your Firebase Console:");
        console.warn("- ais-dev-beayadokieak7kcvw62khd-730180504865.europe-west2.run.app");
        console.warn("- ais-pre-beayadokieak7kcvw62khd-730180504865.europe-west2.run.app");
      } else {
        console.error("Firebase diagnostic error:", error.message);
      }
    }
  }
}
testConnection();
