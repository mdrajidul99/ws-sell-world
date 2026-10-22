import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  runTransaction
} from 'firebase/firestore';
import { auth, db, googleProvider, isUserAdmin } from './config';
import { UserProfile } from './types';
import { handleFirestoreError, OperationType } from './errorHandling';

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function isValidUsernameFormat(username: string): boolean {
  return USERNAME_REGEX.test(username.trim());
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

/**
 * Register a new user with Email, Password, and unique Username
 */
export async function registerWithEmailAndPassword(
  username: string,
  email: string,
  password: string,
  preferredLanguage: 'en' | 'bn' = 'en'
): Promise<User> {
  const cleanUsername = username.trim();
  const normalized = normalizeUsername(cleanUsername);

  if (!isValidUsernameFormat(cleanUsername)) {
    throw new Error('INVALID_USERNAME_FORMAT');
  }

  // Check username uniqueness
  const usernameRef = doc(db, 'usernames', normalized);
  try {
    const existingSnap = await getDoc(usernameRef);
    if (existingSnap.exists()) {
      throw new Error('USERNAME_TAKEN');
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'USERNAME_TAKEN') {
      throw error;
    }
    // Continue or log
  }

  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  try {
    await updateProfile(user, { displayName: cleanUsername });
  } catch {
    // Non-fatal
  }

  const role = isUserAdmin(user.uid, user.email) ? 'admin' : 'user';

  const userProfile: UserProfile = {
    uid: user.uid,
    username: cleanUsername,
    normalizedUsername: normalized,
    email: user.email || email.trim(),
    displayName: cleanUsername,
    createdAt: new Date().toISOString(),
    emailVerified: false,
    role,
    languagePreference: preferredLanguage,
    themePreference: 'system',
    finances: {
      balanceBDT: 0,
      pendingBDT: 0,
      balanceUSDT: 0,
      pendingUSDT: 0,
    },
    status: 'active',
  };

  try {
    // Atomically reserve username and create profile
    await runTransaction(db, async (transaction) => {
      const uSnap = await transaction.get(usernameRef);
      if (uSnap.exists()) {
        throw new Error('USERNAME_TAKEN');
      }
      transaction.set(usernameRef, {
        uid: user.uid,
        email: user.email || email.trim(),
        username: cleanUsername,
        createdAt: new Date().toISOString(),
      });
      transaction.set(doc(db, 'users', user.uid), userProfile);
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'USERNAME_TAKEN') {
      throw err;
    }
    // Fallback direct set
    try {
      await setDoc(usernameRef, {
        uid: user.uid,
        email: user.email || email.trim(),
        username: cleanUsername,
        createdAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'users', user.uid), userProfile);
    } catch (fallbackErr) {
      handleFirestoreError(fallbackErr, OperationType.WRITE, `users/${user.uid}`);
    }
  }

  // Send verification email
  try {
    await sendEmailVerification(user);
  } catch (verifErr) {
    console.warn('Failed to send verification email automatically:', verifErr);
  }

  return user;
}

/**
 * Sign In with Username OR Email
 */
export async function loginWithUsernameOrEmail(
  identifier: string,
  password: string
): Promise<User> {
  const cleanId = identifier.trim();

  let targetEmail = cleanId;

  // If does not contain @, resolve username to email
  if (!cleanId.includes('@')) {
    const normalized = normalizeUsername(cleanId);
    const usernameDocRef = doc(db, 'usernames', normalized);
    try {
      const usernameSnap = await getDoc(usernameDocRef);
      if (!usernameSnap.exists()) {
        throw new Error('USER_NOT_FOUND');
      }
      const data = usernameSnap.data();
      if (!data?.email) {
        throw new Error('USER_NOT_FOUND');
      }
      targetEmail = data.email;
    } catch (err) {
      if (err instanceof Error && err.message === 'USER_NOT_FOUND') {
        throw err;
      }
      handleFirestoreError(err, OperationType.GET, `usernames/${normalized}`);
    }
  }

  const credential = await signInWithEmailAndPassword(auth, targetEmail, password);
  return credential.user;
}

/**
 * Sign In with Google
 */
export async function loginWithGoogle(preferredLanguage: 'en' | 'bn' = 'en'): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  const user = credential.user;

  // Check if profile exists, if not initialize with zero balances
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      const baseName = user.displayName?.replace(/[^a-zA-Z0-9_]/g, '') ||
                       user.email?.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') ||
                       'user';
      const cleanUsername = baseName.substring(0, 15) + '_' + user.uid.substring(0, 4);
      const normalized = normalizeUsername(cleanUsername);

      const role = isUserAdmin(user.uid, user.email) ? 'admin' : 'user';

      const initialProfile: UserProfile = {
        uid: user.uid,
        username: cleanUsername,
        normalizedUsername: normalized,
        email: user.email || '',
        displayName: user.displayName || cleanUsername,
        photoURL: user.photoURL || undefined,
        createdAt: new Date().toISOString(),
        emailVerified: true, // Google sign-ins are verified
        role,
        languagePreference: preferredLanguage,
        themePreference: 'system',
        finances: {
          balanceBDT: 0,
          pendingBDT: 0,
          balanceUSDT: 0,
          pendingUSDT: 0,
        },
        status: 'active',
      };

      await setDoc(userDocRef, initialProfile);

      // Save username lookup
      try {
        await setDoc(doc(db, 'usernames', normalized), {
          uid: user.uid,
          email: user.email || '',
          username: cleanUsername,
          createdAt: new Date().toISOString(),
        });
      } catch {
        // non-blocking
      }
    } else {
      // Profile already exists: ensure role is synced if user is admin
      const existingData = userSnap.data() as UserProfile;
      if (isUserAdmin(user.uid, user.email) && existingData.role !== 'admin') {
        await setDoc(userDocRef, { role: 'admin' }, { merge: true });
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
  }

  return user;
}

/**
 * Resend verification email to current user
 */
export async function resendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('NO_AUTHENTICATED_USER');
  await sendEmailVerification(user);
}

/**
 * Reloads user and checks email verification
 */
export async function checkEmailVerifiedStatus(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  await user.reload();
  const refreshedUser = auth.currentUser;
  const isVerified = refreshedUser?.emailVerified || false;

  if (isVerified) {
    // Sync verification status to user profile
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { emailVerified: true }, { merge: true });
    } catch {
      // non-fatal
    }
  }

  return isVerified;
}

/**
 * Send password reset email
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Log Out
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
