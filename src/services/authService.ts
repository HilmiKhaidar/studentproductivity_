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

// Register user (email verification disabled for now)
export const registerUser = async (email: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Creating user account...');
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    console.log('User created, saving to Firestore...');
    // Save user data to Firestore
    const userData: UserData = {
      id: userCredential.user.uid,
      email: email,
      name: name,
      createdAt: new Date().toISOString(),
      verified: true, // Auto-verify for now since email verification is not working
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userData);

    console.log('Registration complete!');
    // Sign out after registration - user must login manually
    await signOut(auth);
    
    return { success: true, message: 'Registrasi berhasil! Silakan login.' };
  } catch (error: any) {
    console.error('Register error:', error);
    let message = 'Registrasi gagal';
    
    if (error.code === 'auth/email-already-in-use') {
      message = 'Email sudah terdaftar. Silakan login atau gunakan email lain.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password terlalu lemah (minimal 6 karakter)';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Format email tidak valid';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Koneksi internet bermasalah';
    }

    return { success: false, message };
  }
};

// Login user (email verification check disabled for now)
export const loginUser = async (email: string, password: string): Promise<{ success: boolean; user?: UserData; message: string }> => {
  try {
    console.log('Attempting login for:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful!');
    
    // Skip email verification check for now since Firebase email is not working
    // if (!userCredential.user.emailVerified) {
    //   await signOut(auth);
    //   return { success: false, message: 'Email belum diverifikasi.' };
    // }

    console.log('Fetching user data from Firestore...');
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      console.log('User document not found in Firestore');
      return { success: false, message: 'Data user tidak ditemukan' };
    }

    const userData = userDoc.data() as UserData;
    console.log('User data:', userData);

    console.log('Login complete!');
    return { success: true, user: userData, message: 'Login berhasil' };
  } catch (error: any) {
    console.error('Login error:', error);
    let message = 'Login gagal';
    
    if (error.code === 'auth/user-not-found') {
      message = 'Email tidak terdaftar';
    } else if (error.code === 'auth/wrong-password') {
      message = 'Password salah';
    } else if (error.code === 'auth/invalid-credential') {
      message = 'Email atau password salah';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Terlalu banyak percobaan. Coba lagi nanti.';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Koneksi internet bermasalah';
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
    let message = 'Gagal mengirim email reset';
    
    if (error.code === 'auth/user-not-found') {
      message = 'Email tidak terdaftar';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Format email tidak valid';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Koneksi internet bermasalah';
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
