import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { sendOtpEmail } from '../utils/emailService';

export interface UserData {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  verified: boolean;
}

// Register user with OTP
export const registerUser = async (email: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send OTP via email
    await sendOtpEmail({
      to_email: email,
      user_name: name,
      otp_code: otp,
    });

    // Store pending registration in localStorage temporarily
    const pendingData = {
      email,
      password,
      name,
      otp,
      expiresAt: Date.now() + 300000, // 5 minutes
    };
    localStorage.setItem('pending_registration', JSON.stringify(pendingData));

    return { success: true, message: 'OTP sent successfully' };
  } catch (error: any) {
    console.error('Register error:', error);
    return { success: false, message: error.message || 'Registration failed' };
  }
};

// Verify OTP and create Firebase user
export const verifyOtpAndCreateUser = async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Get pending registration data
    const pendingDataStr = localStorage.getItem('pending_registration');
    if (!pendingDataStr) {
      return { success: false, message: 'No pending registration found' };
    }

    const pendingData = JSON.parse(pendingDataStr);

    // Verify OTP
    if (pendingData.email !== email || pendingData.otp !== otp) {
      return { success: false, message: 'Invalid OTP' };
    }

    // Check expiry
    if (Date.now() > pendingData.expiresAt) {
      localStorage.removeItem('pending_registration');
      return { success: false, message: 'OTP expired' };
    }

    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      pendingData.email,
      pendingData.password
    );

    // Save user data to Firestore
    const userData: UserData = {
      id: userCredential.user.uid,
      email: pendingData.email,
      name: pendingData.name,
      createdAt: new Date().toISOString(),
      verified: true,
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userData);

    // Clear pending registration
    localStorage.removeItem('pending_registration');

    return { success: true, message: 'Registration successful' };
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return { success: false, message: error.message || 'Verification failed' };
  }
};

// Login user
export const loginUser = async (email: string, password: string): Promise<{ success: boolean; user?: UserData; message: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      return { success: false, message: 'User data not found' };
    }

    const userData = userDoc.data() as UserData;

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

// Request password reset OTP
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if user exists
    const users = await getDocs(collection(db, 'users'));
    const userExists = users.docs.some(doc => doc.data().email === email);
    
    if (!userExists) {
      return { success: false, message: 'Email tidak terdaftar' };
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send OTP via email
    await sendOtpEmail({
      to_email: email,
      user_name: 'User',
      otp_code: otp,
    });

    // Store OTP temporarily
    const resetData = {
      email,
      otp,
      expiresAt: Date.now() + 300000, // 5 minutes
    };
    localStorage.setItem('password_reset', JSON.stringify(resetData));

    return { success: true, message: 'OTP sent successfully' };
  } catch (error: any) {
    console.error('Request reset error:', error);
    return { success: false, message: error.message || 'Failed to send OTP' };
  }
};

// Verify OTP and reset password
export const verifyOtpAndResetPassword = async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Get reset data
    const resetDataStr = localStorage.getItem('password_reset');
    if (!resetDataStr) {
      return { success: false, message: 'No reset request found' };
    }

    const resetData = JSON.parse(resetDataStr);

    // Verify OTP
    if (resetData.email !== email || resetData.otp !== otp) {
      return { success: false, message: 'Invalid OTP' };
    }

    // Check expiry
    if (Date.now() > resetData.expiresAt) {
      localStorage.removeItem('password_reset');
      return { success: false, message: 'OTP expired' };
    }

    // Firebase doesn't allow direct password update without re-authentication
    // So we need to use Firebase Admin SDK or send password reset email
    // For now, we'll use Firebase's built-in password reset
    const { sendPasswordResetEmail } = await import('firebase/auth');
    await sendPasswordResetEmail(auth, email);

    // Clear reset data
    localStorage.removeItem('password_reset');

    return { success: true, message: 'Password reset email sent. Check your inbox.' };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return { success: false, message: error.message || 'Failed to reset password' };
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
