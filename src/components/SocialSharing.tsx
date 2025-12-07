import React, { useState, useMemo } from 'react';
import { Share2, Twitter, Facebook, MessageCircle, Linkedin, Copy, Download, Trophy, Target, Zap, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { calculateProductivityScore } from '../utils/helpers';
import toast from 'react-hot-toast';

export const SocialSharing: React.FC = () => {
  const { tasks, pomodoroSessions, goals, habits, sleepRecords, user } = useStore();
  const [selectedCard, setSelectedCard] = useState<'productivity' | 'tasks' | 'goals' | 'streak'>('productivity');

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => t.dueDate.startsWith(today));
    const completedToday = todayTasks.filter((t) => t.completed).length;
    const totalCompleted = tasks.filter((t) => t.completed).length;
    const todayPomodoros = pomodoroSessions.filter(
      (s) => s.startTime.startsWith(today) && s.completed
    ).length;
    const totalPomodoros = pomodoroSessions.filter((s) => s.completed).length;
    
    const lastSleep = sleepRecords[sleepRecords.length - 1];
    const avgSleepQuality = lastSleep ? 
      (lastSleep.quality === 'excellent' ? 1 : lastSleep.quality === 'good' ? 0.75 : lastSleep.quality === 'fair' ? 0.5 : 0.25) : 0;
    
    const productivityScore = calculateProductivityScore(
      completedToday,
      todayTasks.length,
      todayPomodoros,
      avgSleepQuality
    );

    const completedGoals = goals.filter((g) => g.completed).length;
    const activeGoals = goals.filter((g) => !g.completed).length;

    // Calculate streak (consecutive days with completed tasks)
    let streak = 0;
    const sortedDates = [...new Set(tasks.filter(t => t.completed).map(t => t.dueDate.split('T')[0]))].sort().reverse();
    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }

    return {
      productivityScore,
      completedToday,
      totalCompleted,
      todayPomodoros,
      totalPomodoros,
      completedGoals,
      activeGoals,
      streak,
      totalTasks: tasks.length,
      activeHabits: habits.length,
    };
  }, [tasks, pomodoroSessions, goals, habits, sleepRecords]);

  const shareCards = {
    productivity: {
      title: '🎯 Skor Produktivitas Saya',
      content: `Skor produktivitas hari ini: ${stats.productivityScore}\n✅ ${stats.completedToday} tugas selesai\n🍅 ${stats.todayPomodoros} sesi Pomodoro\n\nTingkatkan produktivitasmu dengan Student Productivity Hub!`,
      gradient: 'from-purple-500 to-pink-500',
    },
    tasks: {
      title: '✅ Pencapaian Tugas',
      content: `Total tugas selesai: ${stats.totalCompleted}/${stats.totalTasks}\nHari ini: ${stats.completedToday} tugas ✨\n\nKelola tugasmu dengan Student Productivity Hub!`,
      gradient: 'from-green-500 to-emerald-500',
    },
    goals: {
      title: '🎯 Target & Pencapaian',
      content: `Target tercapai: ${stats.completedGoals} 🏆\nTarget aktif: ${stats.activeGoals}\n\nRaih targetmu dengan Student Productivity Hub!`,
      gradient: 'from-blue-500 to-cyan-500',
    },
    streak: {
      title: '🔥 Streak Produktivitas',
      content: `Streak: ${stats.streak} hari berturut-turut! 🔥\nTotal Pomodoro: ${stats.totalPomodoros} sesi\n\nBangun kebiasaan produktif dengan Student Productivity Hub!`,
      gradient: 'from-orange-500 to-red-500',
    },
  };

  const currentCard = shareCards[selectedCard];

  const shareToTwitter = () => {
    const text = encodeURIComponent(currentCard.content);
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(currentCard.content)}`;
    window.open(url, '_blank');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(currentCard.content);
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentCard.content);
    toast.success('Teks berhasil disalin!');
  };

  const downloadCard = () => {
    // Create a simple text file download
    const element = document.createElement('a');
    const file = new Blob([currentCard.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `productivity-${selectedCard}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Card berhasil diunduh!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Share2 size={32} />
          Social Sharing
        </h2>
        <p className="text-white/70 mt-1">Bagikan pencapaianmu ke social media</p>
      </div>

      {/* Card Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setSelectedCard('productivity')}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedCard === 'productivity'
              ? 'border-purple-500 bg-purple-500/20'
              : 'border-white/20 bg-white/5 hover:bg-white/10'
          }`}
        >
          <Trophy className="text-purple-400 mb-2" size={24} />
          <p className="text-white font-medium text-sm">Produktivitas</p>
        </button>
        <button
          onClick={() => setSelectedCard('tasks')}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedCard === 'tasks'
              ? 'border-green-500 bg-green-500/20'
              : 'border-white/20 bg-white/5 hover:bg-white/10'
          }`}
        >
          <CheckCircle className="text-green-400 mb-2" size={24} />
          <p className="text-white font-medium text-sm">Tugas</p>
        </button>
        <button
          onClick={() => setSelectedCard('goals')}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedCard === 'goals'
              ? 'border-blue-500 bg-blue-500/20'
              : 'border-white/20 bg-white/5 hover:bg-white/10'
          }`}
        >
          <Target className="text-blue-400 mb-2" size={24} />
          <p className="text-white font-medium text-sm">Target</p>
        </button>
        <button
          onClick={() => setSelectedCard('streak')}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedCard === 'streak'
              ? 'border-orange-500 bg-orange-500/20'
              : 'border-white/20 bg-white/5 hover:bg-white/10'
          }`}
        >
          <Zap className="text-orange-400 mb-2" size={24} />
          <p className="text-white font-medium text-sm">Streak</p>
        </button>
      </div>

      {/* Preview Card */}
      <div className={`bg-gradient-to-br ${currentCard.gradient} rounded-xl p-8 border border-white/20 shadow-2xl`}>
        <div className="text-center">
          <h3 className="text-3xl font-bold text-white mb-6">{currentCard.title}</h3>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
            <pre className="text-white text-lg whitespace-pre-wrap font-medium">
              {currentCard.content}
            </pre>
          </div>
          {user && (
            <p className="text-white/80 text-sm">
              Dibagikan oleh: {user.name || user.email}
            </p>
          )}
        </div>
      </div>

      {/* Share Buttons */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Bagikan ke:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={shareToTwitter}
            className="flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Twitter size={20} />
            Twitter
          </button>
          <button
            onClick={shareToFacebook}
            className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Facebook size={20} />
            Facebook
          </button>
          <button
            onClick={shareToWhatsApp}
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <MessageCircle size={20} />
            WhatsApp
          </button>
          <button
            onClick={shareToLinkedIn}
            className="flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#095196] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Linkedin size={20} />
            LinkedIn
          </button>
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Copy size={20} />
            Copy Text
          </button>
          <button
            onClick={downloadCard}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Download size={20} />
            Download
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <p className="text-white/70 text-sm mb-1">Skor Hari Ini</p>
          <p className="text-3xl font-bold text-white">{stats.productivityScore}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <p className="text-white/70 text-sm mb-1">Total Tugas</p>
          <p className="text-3xl font-bold text-white">{stats.totalCompleted}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <p className="text-white/70 text-sm mb-1">Pomodoro</p>
          <p className="text-3xl font-bold text-white">{stats.totalPomodoros}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <p className="text-white/70 text-sm mb-1">Streak</p>
          <p className="text-3xl font-bold text-white">{stats.streak} 🔥</p>
        </div>
      </div>

      {/* Invite Friends */}
      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-3">📨 Ajak Teman</h3>
        <p className="text-white/80 mb-4">
          Bagikan Student Productivity Hub ke teman-temanmu dan tingkatkan produktivitas bersama!
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={window.location.origin}
            readOnly
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin);
              toast.success('Link berhasil disalin!');
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};
