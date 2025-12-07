import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User, KeyRound } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetOtpInput, setShowResetOtpInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, verifyOtp, resetPassword, verifyResetOtp, setCurrentView } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submitted!', { isLogin, email, password, name });
    
    if (isSubmitting) {
      console.log('Already submitting, skipping...');
      return;
    }
    
    if (isLogin) {
      console.log('Attempting login...');
      setIsSubmitting(true);
      const success = await login(email, password);
      setIsSubmitting(false);
      
      if (success) {
        setCurrentView('dashboard'); // Set to dashboard after login
        toast.success('Login berhasil! Selamat datang!');
      } else {
        toast.error('Email atau password salah!');
      }
    } else {
      console.log('Attempting register...');
      
      if (!name || !email || !password) {
        toast.error('Semua field harus diisi!');
        return;
      }
      if (password.length < 6) {
        toast.error('Password minimal 6 karakter!');
        return;
      }
      
      setIsSubmitting(true);
      toast.loading('Mengirim OTP ke email...', { id: 'register-loading' });
      
      try {
        console.log('Calling register function...');
        const success = await register(email, password, name);
        console.log('Register result:', success);
        
        toast.dismiss('register-loading');
        
        if (success) {
          setShowOtpInput(true);
          toast.success(`✅ OTP telah dikirim ke ${email}!\n\nCek inbox email atau console (F12)`, { duration: 5000 });
        } else {
          toast.error('Email sudah terdaftar!');
        }
      } catch (error) {
        console.error('Register error:', error);
        toast.dismiss('register-loading');
        toast.error('Terjadi kesalahan saat registrasi!');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Verifying OTP:', otp);
    
    setIsSubmitting(true);
    const success = await verifyOtp(email, otp);
    setIsSubmitting(false);
    
    if (success) {
      toast.success('Registrasi berhasil! Silakan login.');
      setShowOtpInput(false);
      setIsLogin(true);
      setEmail('');
      setPassword('');
      setName('');
      setOtp('');
    } else {
      toast.error('OTP salah atau sudah kadaluarsa!');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Masukkan email kamu!');
      return;
    }

    setIsSubmitting(true);
    toast.loading('Mengirim OTP ke email...', { id: 'reset-loading' });
    
    const success = await resetPassword(email);
    toast.dismiss('reset-loading');
    setIsSubmitting(false);
    
    if (success) {
      setShowResetPassword(false);
      setShowResetOtpInput(true);
      toast.success(`OTP telah dikirim ke ${email}!`, { duration: 5000 });
    } else {
      toast.error('Email tidak terdaftar!');
    }
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    const success = await verifyResetOtp(email, otp);
    setIsSubmitting(false);
    
    if (success) {
      toast.success('Cek email untuk link reset password!');
      setShowResetOtpInput(false);
      setIsLogin(true);
      setEmail('');
      setOtp('');
      setNewPassword('');
    } else {
      toast.error('OTP salah atau sudah kadaluarsa!');
    }
  };

  // Reset Password - Request OTP
  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-purple-200">Masukkan email untuk reset password</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600'
                }`}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim OTP'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowResetPassword(false);
                  setEmail('');
                }}
                className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Kembali ke Login
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Reset Password - Verify OTP
  if (showResetOtpInput) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Verifikasi OTP</h1>
              <p className="text-purple-200 mb-2">OTP telah dikirim ke:</p>
              <p className="text-white font-semibold mb-3">{email}</p>
            </div>

            <form onSubmit={handleVerifyResetOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kode OTP (6 digit)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600'
                }`}
              >
                {isSubmitting ? 'Memverifikasi...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowResetOtpInput(false);
                  setOtp('');
                  setNewPassword('');
                }}
                className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Kembali
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showOtpInput) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Verifikasi OTP</h1>
              <p className="text-gray-400 mb-2">Kode OTP telah dikirim ke:</p>
              <p className="text-white font-semibold mb-3">{email}</p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <p className="text-yellow-300 text-sm">📧 Cek inbox email kamu</p>
                <p className="text-yellow-400/70 text-xs mt-1">💡 Atau cek console (F12)</p>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kode OTP (6 digit)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    Verifikasi
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp('');
                }}
                className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Kembali
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🎓 Student Hub</h1>
            <p className="text-gray-400">{isLogin ? 'Masuk ke akun kamu' : 'Buat akun baru'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="Masukkan nama"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Masuk
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Daftar
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-purple-300 hover:text-white transition-colors text-sm underline"
              >
                Lupa password?
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isLogin ? (
                <>
                  Belum punya akun? <span className="font-semibold text-white">Daftar di sini</span>
                </>
              ) : (
                <>
                  Sudah punya akun? <span className="font-semibold text-white">Masuk di sini</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
