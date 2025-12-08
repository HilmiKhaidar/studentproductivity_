import React, { useMemo } from 'react';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const Analytics: React.FC = () => {
  const { tasks, sleepRecords, pomodoroSessions, goals, habits } = useStore();

  const weeklyProductivity = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map((date) => {
      const dayTasks = tasks.filter((t) => t.dueDate.startsWith(date));
      const completed = dayTasks.filter((t) => t.completed).length;
      const pomodoros = pomodoroSessions.filter((s) => s.startTime.startsWith(date) && s.completed).length;
      const sleep = sleepRecords.find((r) => r.date === date);
      const sleepHours = sleep ? sleep.duration / 60 : 0;

      return {
        date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        tugas: completed,
        pomodoro: pomodoros,
        tidur: sleepHours.toFixed(1),
      };
    });
  }, [tasks, pomodoroSessions, sleepRecords]);

  const categoryPerformance = useMemo(() => {
    const categories = ['study', 'assignment', 'exam', 'project', 'personal'];
    return categories.map((cat) => {
      const catTasks = tasks.filter((t) => t.category === cat);
      const completed = catTasks.filter((t) => t.completed).length;
      const completionRate = catTasks.length > 0 ? (completed / catTasks.length) * 100 : 0;

      return {
        category: cat,
        value: Math.round(completionRate),
      };
    });
  }, [tasks]);

  const monthlyStats = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const totalTasks = tasks.filter((t) => last30Days.includes(t.dueDate.split('T')[0])).length;
    const completedTasks = tasks.filter((t) => last30Days.includes(t.dueDate.split('T')[0]) && t.completed).length;
    const totalPomodoros = pomodoroSessions.filter((s) => last30Days.includes(s.startTime.split('T')[0]) && s.completed).length;
    const avgSleep = sleepRecords.filter((r) => last30Days.includes(r.date)).reduce((sum, r) => sum + r.duration, 0) / sleepRecords.filter((r) => last30Days.includes(r.date)).length / 60;

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalPomodoros,
      avgSleep: avgSleep || 0,
      activeGoals: goals.filter((g) => !g.completed).length,
      habitStreak: habits.reduce((sum, h) => sum + h.streak, 0),
    };
  }, [tasks, pomodoroSessions, sleepRecords, goals, habits]);

  const insights = useMemo(() => {
    const insights: string[] = [];

    if (monthlyStats.completionRate >= 80) {
      insights.push('🎉 Luar biasa! Tingkat penyelesaian tugas kamu sangat tinggi!');
    } else if (monthlyStats.completionRate < 50) {
      insights.push('💪 Tingkatkan fokus untuk menyelesaikan lebih banyak tugas');
    }

    if (monthlyStats.avgSleep < 7) {
      insights.push('😴 Tidur kamu kurang dari target. Istirahat yang cukup penting untuk produktivitas!');
    } else if (monthlyStats.avgSleep >= 8) {
      insights.push('✨ Pola tidur kamu sangat baik! Pertahankan!');
    }

    if (monthlyStats.totalPomodoros >= 50) {
      insights.push('🔥 Wow! Kamu sangat produktif dengan teknik Pomodoro!');
    }

    if (monthlyStats.habitStreak >= 7) {
      insights.push('⚡ Streak kebiasaan kamu mengesankan! Terus pertahankan!');
    }

    if (insights.length === 0) {
      insights.push('📊 Terus gunakan aplikasi untuk mendapatkan insights lebih banyak!');
    }

    return insights;
  }, [monthlyStats]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[40px] font-bold notion-heading leading-tight">Analitik & Insights</h2>
        <p className="notion-text-secondary text-sm mt-2">Analisis mendalam produktivitas kamu</p>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="notion-text/80 text-sm">Tingkat Penyelesaian</p>
            <Award className="notion-text/80" size={24} />
          </div>
          <p className="text-4xl font-bold notion-text">{monthlyStats.completionRate}%</p>
          <p className="notion-text-secondary text-sm mt-1">30 hari terakhir</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="notion-text/80 text-sm">Total Pomodoro</p>
            <Zap className="notion-text/80" size={24} />
          </div>
          <p className="text-4xl font-bold notion-text">{monthlyStats.totalPomodoros}</p>
          <p className="notion-text-secondary text-sm mt-1">Sesi selesai</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="notion-text/80 text-sm">Rata-rata Tidur</p>
            <TrendingUp className="notion-text/80" size={24} />
          </div>
          <p className="text-4xl font-bold notion-text">{monthlyStats.avgSleep.toFixed(1)}j</p>
          <p className="notion-text-secondary text-sm mt-1">Per malam</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="notion-text/80 text-sm">Target Aktif</p>
            <Target className="notion-text/80" size={24} />
          </div>
          <p className="text-4xl font-bold notion-text">{monthlyStats.activeGoals}</p>
          <p className="notion-text-secondary text-sm mt-1">Sedang berjalan</p>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold notion-heading mb-4 flex items-center gap-2">
          <TrendingUp size={24} />
          Insights & Rekomendasi
        </h3>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="bg-white/10 rounded-lg p-4">
              <p className="notion-text">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="notion-card p-6">
          <h3 className="text-lg font-semibold notion-heading mb-4">Produktivitas Mingguan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyProductivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Line type="monotone" dataKey="tugas" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
              <Line type="monotone" dataKey="pomodoro" stroke="#000000" strokeWidth={3} dot={{ fill: '#000000', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="notion-card p-6">
          <h3 className="text-lg font-semibold notion-heading mb-4">Performa per Kategori</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="category" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Bar dataKey="value" fill="#000000" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary */}
      <div className="notion-card p-6">
        <h3 className="text-lg font-semibold notion-heading mb-4">Ringkasan 30 Hari</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="notion-text-secondary text-sm">Total Tugas</p>
            <p className="text-[40px] font-bold notion-heading leading-tight mt-1">{monthlyStats.totalTasks}</p>
          </div>
          <div className="text-center">
            <p className="notion-text-secondary text-sm">Tugas Selesai</p>
            <p className="text-3xl font-bold text-green-400 mt-1">{monthlyStats.completedTasks}</p>
          </div>
          <div className="text-center">
            <p className="notion-text-secondary text-sm">Sesi Pomodoro</p>
            <p className="text-3xl font-bold notion-text mt-1">{monthlyStats.totalPomodoros}</p>
          </div>
          <div className="text-center">
            <p className="notion-text-secondary text-sm">Habit Streak</p>
            <p className="text-3xl font-bold text-orange-400 mt-1">{monthlyStats.habitStreak}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
