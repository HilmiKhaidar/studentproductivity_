import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

export const Feedback: React.FC = () => {
  const { user } = useStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState('bug');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast.error('Semua field harus diisi!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://formspree.io/f/meoylqrq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          category,
          message,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });

      if (response.ok) {
        setShowSuccessModal(true);
        // Reset form
        setMessage('');
        setCategory('bug');
        
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);
      } else {
        toast.error('Gagal mengirim feedback. Coba lagi.');
      }
    } catch (error) {
      console.error('Feedback error:', error);
      toast.error('Terjadi kesalahan. Periksa koneksi internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-4"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="text-green-500" size={48} />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-[40px] font-bold notion-heading leading-tight mb-2">
                  🎉 Terima Kasih!
                </h2>
                <p className="notion-text/90 text-lg">
                  Feedback kamu sangat berharga untuk kami. Kami akan segera meresponnya!
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div>
          <h2 className="text-[40px] font-bold notion-heading leading-tight">Feedback & Saran</h2>
          <p className="notion-text-secondary text-sm mt-2">Bantu kami meningkatkan StudyHub</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="notion-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gray-800 rounded-lg p-3">
                <MessageSquare className="notion-text" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold notion-heading">Kirim Feedback</h3>
                <p className="notion-text-secondary text-sm">Laporkan bug atau berikan saran</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block notion-text/90 text-sm font-medium mb-2">Nama</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Nama kamu"
                />
              </div>

              <div>
                <label className="block notion-text/90 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block notion-text/90 text-sm font-medium mb-2">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="bug">🐛 Bug / Error</option>
                  <option value="feature">💡 Saran Fitur</option>
                  <option value="improvement">⚡ Peningkatan</option>
                  <option value="ui">🎨 UI/UX</option>
                  <option value="other">📝 Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block notion-text/90 text-sm font-medium mb-2">Pesan</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                  placeholder="Jelaskan feedback kamu secara detail..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white notion-text py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  'Mengirim...'
                ) : (
                  <>
                    <Send size={20} />
                    Kirim Feedback
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold notion-heading mb-3">📋 Panduan Feedback</h3>
              <ul className="space-y-2 notion-text/80">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Jelaskan masalah atau saran dengan detail</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Sertakan langkah-langkah jika melaporkan bug</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Screenshot sangat membantu (kirim via email)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Kami akan merespon dalam 1-2 hari kerja</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold notion-heading mb-3">💬 Kategori Feedback</h3>
              <div className="space-y-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="notion-text font-medium">🐛 Bug / Error</p>
                  <p className="notion-text-secondary text-sm">Laporkan masalah teknis atau error</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="notion-text font-medium">💡 Saran Fitur</p>
                  <p className="notion-text-secondary text-sm">Usulkan fitur baru yang kamu inginkan</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="notion-text font-medium">⚡ Peningkatan</p>
                  <p className="notion-text-secondary text-sm">Saran untuk fitur yang sudah ada</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="notion-text font-medium">🎨 UI/UX</p>
                  <p className="notion-text-secondary text-sm">Feedback tentang tampilan dan pengalaman</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold notion-heading mb-3">📧 Kontak Langsung</h3>
              <p className="notion-text/80 mb-3">
                Untuk pertanyaan mendesak atau diskusi lebih lanjut:
              </p>
              <a
                href="mailto:hilmikhairn@gmail.com"
                className="notion-text font-medium hover:notion-text/80 transition-colors"
              >
                hilmikhairn@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
