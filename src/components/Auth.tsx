import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User, CheckCircle, Sparkles, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successType, setSuccessType] = useState<'register' | 'login'>('register');
  const login = useStore((state) => state.login);
  const register = useStore((state) => state.register);
  const resetPassword = useStore((state) => state.resetPassword);
  const setCurrentView = useStore((state) => state.setCurrentView);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (isLogin) {
      setIsSubmitting(true);
      const result = await login(email, password);
      setIsSubmitting(false);
      
      if (result.success) {
        setSuccessType('login');
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setCurrentView('dashboard');
        }, 2000);
      } else {
        toast.error(result.message, { duration: 5000 });
        if (result.message.includes('belum diverifikasi')) {
          setTimeout(() => {
            toast('Check your Spam folder or use another email to register.', {
              icon: '💡',
              duration: 7000
            });
          }, 1000);
        }
      }
    } else {
      if (!name || !email || !password) {
        toast.error('All fields are required!');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters!');
        return;
      }
      
      setIsSubmitting(true);
      const result = await register(email, password, name);
      setIsSubmitting(false);
      
      if (result.success) {
        setSuccessType('register');
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setIsLogin(true);
          setPassword('');
          setName('');
        }, 2500);
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email!');
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-[#191919]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4">
              <Zap className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold notion-heading mb-2">Reset Password</h2>
            <p className="notion-text-secondary text-sm">Enter your email to reset password</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium notion-text mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="notion-input w-full"
                placeholder="email@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="notion-button-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => setShowResetPassword(false)}
              className="w-full notion-text-secondary hover:notion-text transition-colors text-sm"
            >
              Back to Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-[#191919]">
      <AnimatePresence mode="wait">
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="notion-card p-8 max-w-sm mx-4 text-center notion-shadow"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <h3 className="text-xl font-bold notion-heading mb-2">
                {successType === 'register' ? 'Registration Successful!' : 'Welcome Back!'}
              </h3>
              <p className="notion-text-secondary text-sm">
                {successType === 'register' 
                  ? 'You can now login with your credentials' 
                  : 'Redirecting to dashboard...'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4">
            <Zap className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold notion-heading mb-2">StudyHub</h1>
          <p className="notion-text-secondary">Your productivity workspace</p>
        </div>

        <div className="notion-card p-6 notion-shadow">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-[#E9E9E7] dark:border-[#373737]">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium transition-all border-b-2 ${
                isLogin
                  ? 'border-[#2383E2] notion-text'
                  : 'border-transparent notion-text-secondary hover:notion-text'
              }`}
            >
              <LogIn size={16} className="inline mr-2" />
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium transition-all border-b-2 ${
                !isLogin
                  ? 'border-[#2383E2] notion-text'
                  : 'border-transparent notion-text-secondary hover:notion-text'
              }`}
            >
              <UserPlus size={16} className="inline mr-2" />
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium notion-text mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="notion-input w-full"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium notion-text mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="notion-input w-full"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium notion-text mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="notion-input w-full"
                placeholder="••••••••"
              />
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="text-sm notion-text-secondary hover:notion-text transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="notion-button-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </button>
          </form>

          {!isLogin && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-900/30">
              <p className="notion-text-secondary text-xs">
                <Sparkles size={12} className="inline mr-1 text-blue-500" />
                After registration, you can login immediately
              </p>
            </div>
          )}
        </div>

        <p className="text-center mt-6 notion-text-secondary text-xs">
          © 2024 StudyHub. All rights reserved.
        </p>
      </div>
    </div>
  );
};
