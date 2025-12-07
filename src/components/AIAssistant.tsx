import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, Loader, TrendingUp, Calendar, Target, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const { tasks, pomodoroSessions, sleepRecords, goals, user } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Halo ${user?.name || 'User'}! 👋 Saya AI Study Assistant kamu. Saya bisa membantu:\n\n• 📚 Tips belajar efektif\n• 📅 Membuat jadwal belajar\n• 🎯 Prioritas tugas\n• 📊 Analisis produktivitas\n• 💡 Saran peningkatan\n\nAda yang bisa saya bantu?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getProductivityContext = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(0) : 0;
    const totalPomodoros = pomodoroSessions.filter(s => s.completed).length;
    const avgSleep = sleepRecords.length > 0 
      ? (sleepRecords.reduce((sum, r) => sum + r.duration, 0) / sleepRecords.length / 60).toFixed(1)
      : 0;
    const activeGoals = goals.filter(g => !g.completed).length;

    return `
User Context:
- Total tugas: ${totalTasks}, Selesai: ${completedTasks} (${completionRate}%)
- Sesi Pomodoro: ${totalPomodoros}
- Rata-rata tidur: ${avgSleep} jam/malam
- Target aktif: ${activeGoals}
- Tugas mendesak: ${tasks.filter(t => !t.completed && t.priority === 'urgent').length}
`;
  };

  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    try {
      // Using Gemini API
      const API_KEY = 'AIzaSyCEVq2itJvK4-XsF2FFM5DZYT75Sw3DQMU';
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

      const context = getProductivityContext();
      const prompt = `Kamu adalah AI Study Assistant untuk aplikasi produktivitas mahasiswa. 
${context}

User bertanya: ${userMessage}

Berikan jawaban yang helpful, spesifik, dan actionable dalam Bahasa Indonesia. Jika relevan dengan data user, berikan saran berdasarkan data tersebut.`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback responses
      return getFallbackResponse(userMessage);
    }
  };

  const getFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('jadwal') || lowerMessage.includes('schedule')) {
      return `📅 **Tips Membuat Jadwal Belajar Efektif:**

1. **Identifikasi Waktu Produktif**
   - Pagi (6-9): Materi berat & konsep baru
   - Siang (13-15): Review & latihan soal
   - Malam (19-21): Membaca & persiapan esok

2. **Teknik Pomodoro**
   - 25 menit fokus + 5 menit break
   - Setelah 4 sesi, break 15-30 menit

3. **Prioritaskan Tugas**
   - Urgent & Important: Kerjakan dulu
   - Important tapi tidak urgent: Jadwalkan
   - Urgent tapi tidak important: Delegasi/skip

Mau saya buatkan jadwal spesifik berdasarkan tugas kamu?`;
    }

    if (lowerMessage.includes('prioritas') || lowerMessage.includes('priority')) {
      const urgentTasks = tasks.filter(t => !t.completed && t.priority === 'urgent');
      const highTasks = tasks.filter(t => !t.completed && t.priority === 'high');

      return `🎯 **Analisis Prioritas Tugas:**

**Tugas Mendesak (${urgentTasks.length}):**
${urgentTasks.slice(0, 3).map(t => `• ${t.title} - Deadline: ${new Date(t.dueDate).toLocaleDateString('id-ID')}`).join('\n') || '✅ Tidak ada tugas mendesak!'}

**Tugas Prioritas Tinggi (${highTasks.length}):**
${highTasks.slice(0, 3).map(t => `• ${t.title}`).join('\n') || '✅ Semua terkendali!'}

**Rekomendasi:**
1. Fokus selesaikan tugas mendesak hari ini
2. Alokasikan 2-3 jam untuk tugas prioritas tinggi
3. Gunakan teknik Pomodoro untuk fokus maksimal`;
    }

    if (lowerMessage.includes('produktif') || lowerMessage.includes('tips')) {
      const completionRate = tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length * 100).toFixed(0) : 0;

      return `📊 **Analisis Produktivitas Kamu:**

Tingkat penyelesaian tugas: ${completionRate}%

**Tips Meningkatkan Produktivitas:**

1. **Morning Routine**
   - Bangun konsisten jam 6 pagi
   - 15 menit meditasi/olahraga ringan
   - Review to-do list hari ini

2. **Deep Work Sessions**
   - 2-3 sesi fokus 90 menit/hari
   - Matikan notifikasi
   - Single-tasking, bukan multitasking

3. **Energy Management**
   - Tidur 7-8 jam/malam
   - Makan teratur & sehat
   - Break setiap 50 menit

4. **Weekly Review**
   - Setiap Minggu, review progress
   - Adjust strategi yang tidak efektif
   - Celebrate small wins!

Mau tips spesifik untuk situasi kamu?`;
    }

    if (lowerMessage.includes('tidur') || lowerMessage.includes('sleep')) {
      return `😴 **Optimasi Kualitas Tidur:**

**Sleep Hygiene:**
1. Tidur & bangun di jam yang sama setiap hari
2. Hindari screen 1 jam sebelum tidur
3. Kamar gelap, sejuk (18-22°C), dan tenang
4. Hindari kafein setelah jam 2 siang

**Power Nap:**
- 15-20 menit di siang hari
- Tidak lebih dari 30 menit
- Sebelum jam 3 sore

**Target:** 7-8 jam tidur berkualitas untuk performa optimal!`;
    }

    return `Terima kasih atas pertanyaannya! Saya bisa membantu dengan:

• 📚 **Tips Belajar** - Metode belajar efektif
• 📅 **Jadwal Belajar** - Buat jadwal optimal
• 🎯 **Prioritas Tugas** - Analisis & rekomendasi
• 📊 **Produktivitas** - Insights & saran
• 😴 **Sleep Tips** - Optimasi tidur

Coba tanya: "Buatkan jadwal belajar" atau "Analisis produktivitas saya"`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await callGeminiAPI(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Gagal mendapat respons AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setInput(action);
    // Auto send after setting input
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Bot size={32} />
          AI Study Assistant
        </h2>
        <p className="text-white/70 mt-1">Asisten AI untuk meningkatkan produktivitas belajar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 flex flex-col h-[600px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot size={16} className="text-purple-300" />
                        <span className="text-xs text-white/70">AI Assistant</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/20 rounded-2xl p-4 flex items-center gap-2">
                  <Loader className="animate-spin text-purple-300" size={16} />
                  <span className="text-white/70">AI sedang berpikir...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tanya AI tentang study tips, jadwal, atau produktivitas..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles size={20} />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleQuickAction('Buatkan jadwal belajar untuk minggu ini')}
                className="w-full bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg text-left transition-colors flex items-center gap-2"
              >
                <Calendar size={16} />
                <span className="text-sm">Buat Jadwal Belajar</span>
              </button>
              <button
                onClick={() => handleQuickAction('Analisis prioritas tugas saya')}
                className="w-full bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg text-left transition-colors flex items-center gap-2"
              >
                <Target size={16} />
                <span className="text-sm">Prioritas Tugas</span>
              </button>
              <button
                onClick={() => handleQuickAction('Analisis produktivitas saya dan berikan saran')}
                className="w-full bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg text-left transition-colors flex items-center gap-2"
              >
                <TrendingUp size={16} />
                <span className="text-sm">Analisis Produktivitas</span>
              </button>
              <button
                onClick={() => handleQuickAction('Tips belajar efektif untuk mahasiswa')}
                className="w-full bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg text-left transition-colors flex items-center gap-2"
              >
                <Lightbulb size={16} />
                <span className="text-sm">Tips Belajar</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-3">💡 Tips</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>• Tanya spesifik untuk jawaban lebih baik</li>
              <li>• AI menganalisis data produktivitas kamu</li>
              <li>• Gunakan Quick Actions untuk cepat</li>
              <li>• AI belajar dari pola aktivitas kamu</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
