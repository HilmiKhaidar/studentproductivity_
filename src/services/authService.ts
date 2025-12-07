import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserData {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  verified: boolean;
}

// Register user and send verification email
export const registerUser = async (email: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Send verification email
    await sendEmailVerification(userCredential.user);

    // Save user data to Firestore
    const userData: UserData = {
      id: userCredential.user.uid,
      email: email,
      name: name,
      createdAt: new Date().toISOString(),
      verified: false,
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userData);

    // Sign out immediately after registration
    await signOut(auth);

    return { success: true, message: 'Verification email sent! Check your inbox.' };
  } catch (error: any) {
    console.error('Register error:', error);
    let message = 'Registration failed';
    
    if (error.code === 'auth/email-already-in-use') {
      message = 'Email already registered';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password too weak (min 6 characters)';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email format';
    }

    return { success: false, message };
  }
};

// Login user
export const loginUser = async (email: string, password: string): Promise<{ success: boolean; user?: UserData; message: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      return { success: false, message: 'Please verify your email first. Check your inbox.' };
    }

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      return { success: false, message: 'User data not found' };
    }

    const userData = userDoc.data() as UserData;

    // Update verified status if needed
    if (!userData.verified) {
      await setDoc(doc(db, 'users', userCredential.user.uid), { ...userData, verified: true });
      userData.verified = true;
    }

    return { success: true, user: userData, message: 'Login successful' };
  } catch (error: any) {
    console.error('Login error:', error);
    let message = 'Login failed';
    
    if (error.code === 'auth/user-not-found') {
      message = 'User not found';
    } else if (error.code === 'auth/wrong-password') {
      message = 'Wrong password';
    } else if (error.code === 'auth/invalid-credential') {
      message = 'Invalid email or password';
    }

    return { success: false, message };
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

// Request password reset
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Send password reset email via Firebase
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent! Check your inbox.' };
  } catch (error: any) {
    console.error('Request reset error:', error);
    let message = 'Failed to send reset email';
    
    if (error.code === 'auth/user-not-found') {
      message = 'Email not registered';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email format';
    }
    
    return { success: false, message };
  }
};

// Resend verification email
export const resendVerificationEmail = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, message: 'No user logged in' };
    }

    if (user.emailVerified) {
      return { success: false, message: 'Email already verified' };
    }

    await sendEmailVerification(user);
    return { success: true, message: 'Verification email sent!' };
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return { success: false, message: error.message || 'Failed to send verification email' };
  }
};

// Get current user data
export const getCurrentUserData = async (firebaseUser: FirebaseUser): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Get user data error:', error);
    return null;
  }
};
