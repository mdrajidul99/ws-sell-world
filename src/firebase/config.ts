import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAnalytics, isSupported } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: "AIzaSyAiTw9nJU7J3bmUJRrdntF0Yvx2TIqYlsc",
  authDomain: "marketing-website-d35a5.firebaseapp.com",
  projectId: "marketing-website-d35a5",
  storageBucket: "marketing-website-d35a5.firebasestorage.app",
  messagingSenderId: "735907107001",
  appId: "1:735907107001:web:88980a7a4171b0bcc98b68",
  measurementId: "G-XZ1V64PD1J",
  databaseURL: "https://marketing-website-d35a5-default-rtdb.firebaseio.com"
};

// Singleton initialization
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Conditionally initialize analytics
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        getAnalytics(app);
      } catch (e) {
        console.warn('Analytics initialization skipped:', e);
      }
    }
  }).catch(() => {
    // Ignore analytics unsupported environment
  });
}

// Configured Administrator Credentials
export const ADMIN_UID = "ZMNTSLxjJWOBEK3DlnqxUXQycAO2";
export const ADMIN_EMAIL = "mrs.engineers.bd26@gmail.com";

export function isUserAdmin(uid?: string | null, email?: string | null): boolean {
  if (!uid) return false;
  return uid === ADMIN_UID || (!!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
}
