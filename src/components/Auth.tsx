import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useStore((state) => state.login);
  const register = useStore((state) => state.register);
  const resetPassword = useStore((state) => state.resetPassword);
  const setCurrentView = useStore((state) => state.setCurrentView);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (isLogin) {
      // Login
      setIsSubmitting(true);
      const result = await login(email, password);
      setIsSubmitting(false);
      
      if (result.success) {
        setCurrentView('dashboard');
        toast.success('Login berhasil! Selamat datang!');
      } else {
        toast.error(result.message);
      }
    } else {
      // Register
      if (!name || !email || !password) {
        toast.error('Semua field harus diisi!');
        return;
      }
      if (password.length < 6) {
        toast.error('Password minimal 6 karakter!');
        return;
      }
      
      setIsSubmitting(true);
      const result = await register(email, password, name);
      setIsSubmitting(false);
      
      if (result.success) {
        toast.success('Registrasi berhasil! Cek email untuk verifikasi.');
        setIsLogin(true);
        setEmail('');
        setPassword('');
        setName('');
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Masukkan email terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(email);
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success(result.message);
      setShowResetPassword(false);
      setIsLogin(true);
    } else {
      toast.error(result.message);
    }
  };

  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-white/70">Masukkan email untuk reset password</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-purple-600 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>

            <button
              type="button"
              onClick={() => setShowResetPassword(false)}
              className="w-full text-white/70 hover:text-white transition-colors"
            >
              Kembali ke Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">StudyHub</h1>
          <p className="text-white/70">Produktivitas Mahasiswa</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              isLogin
                ? 'bg-white text-purple-600'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              !isLogin
                ? 'bg-white text-purple-600'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Daftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Nama lengkap"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Lupa password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-purple-600 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              'Loading...'
            ) : isLogin ? (
              <>
                <LogIn size={20} />
                Masuk
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Daftar
              </>
            )}
          </button>
        </form>

        {!isLogin && (
          <p className="text-white/60 text-xs text-center mt-4">
            Setelah daftar, cek email untuk verifikasi akun
          </p>
        )}
      </motion.div>
    </div>
  );
};
