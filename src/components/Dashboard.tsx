import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  Moon,
  Target,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDate, minutesToHours, calculateProductivityScore } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const { tasks, sleepRecords, pomodoroSessions, goals, habits } = useStore();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => t.dueDate.startsWith(today));
    const completedToday = todayTasks.filter((t) => t.completed).length;
    const todayPomodoros = pomodoroSessions.filter(
      (s) => s.startTime.startsWith(today) && s.completed
    ).length;
    
    const lastSleep = sleepRecords[sleepRecords.length - 1];
    const avgSleepQuality = lastSleep ? 
      (lastSleep.quality === 'excellent' ? 1 : lastSleep.quality === 'good' ? 0.75 : lastSleep.quality === 'fair' ? 0.5 : 0.25) : 0;
    
    const productivityScore = calculateProductivityScore(
      completedToday,
      todayTasks.length,
      todayPomodoros,
      avgSleepQuality
    );

    const activeGoals = goals.filter((g) => !g.completed).length;
    const activeHabits = habits.length;
    const todayHabitsCompleted = habits.filter((h) => h.completedDates.includes(today)).length;

    return {
      todayTasks: todayTasks.length,
      completedToday,
      todayPomodoros,
      lastSleep,
      productivityScore,
      activeGoals,
      activeHabits,
      todayHabitsCompleted,
    };
  }, [tasks, sleepRecords, pomodoroSessions, goals, habits]);

  const weeklyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map((date) => {
      const dayTasks = tasks.filter((t) => t.dueDate.startsWith(date));
      const completed = dayTasks.filter((t) => t.completed).length;
      const pomodoros = pomodoroSessions.filter(
        (s) => s.startTime.startsWith(date) && s.completed
      ).length;

      return {
        date: new Date(date).toLocaleDateString('id-ID', { weekday: 'short' }),
        tugas: completed,
        pomodoro: pomodoros,
      };
    });
  }, [tasks, pomodoroSessions]);

  const tasksByCategory = useMemo(() => {
    const categories = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-white/70 mt-1">{formatDate(new Date())}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <p className="text-white/70 text-sm">Skor Produktivitas</p>
          <p className="text-4xl font-bold text-white mt-1">{stats.productivityScore}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckCircle2 className="text-green-400" size={24} />}
          title="Tugas Hari Ini"
          value={`${stats.completedToday}/${stats.todayTasks}`}
          subtitle="Selesai"
          color="from-green-500 to-emerald-600"
        />
        <StatCard
          icon={<Clock className="text-blue-400" size={24} />}
          title="Pomodoro"
          value={stats.todayPomodoros.toString()}
          subtitle="Sesi hari ini"
          color="from-blue-500 to-cyan-600"
        />
        <StatCard
          icon={<Moon className="text-purple-400" size={24} />}
          title="Tidur Terakhir"
          value={stats.lastSleep ? minutesToHours(stats.lastSleep.duration) : '-'}
          subtitle={stats.lastSleep?.quality || 'Belum ada data'}
          color="from-purple-500 to-pink-600"
        />
        <StatCard
          icon={<Zap className="text-yellow-400" size={24} />}
          title="Kebiasaan"
          value={`${stats.todayHabitsCompleted}/${stats.activeHabits}`}
          subtitle="Selesai hari ini"
          color="from-yellow-500 to-orange-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Aktivitas 7 Hari Terakhir</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
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
              <Bar dataKey="tugas" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pomodoro" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Tugas per Kategori</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={tasksByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {tasksByCategory.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Tugas Mendesak
          </h3>
          <div className="space-y-3">
            {tasks
              .filter((t) => !t.completed && (t.priority === 'urgent' || t.priority === 'high'))
              .slice(0, 5)
              .map((task) => (
                <div
                  key={task.id}
                  className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium">{task.title}</p>
                      <p className="text-white/60 text-sm mt-1">{task.category}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        task.priority === 'urgent' ? 'bg-red-500' : 'bg-orange-500'
                      } text-white`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            {tasks.filter((t) => !t.completed && (t.priority === 'urgent' || t.priority === 'high'))
              .length === 0 && (
              <p className="text-white/60 text-center py-4">Tidak ada tugas mendesak 🎉</p>
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target size={20} />
            Target Aktif
          </h3>
          <div className="space-y-3">
            {goals
              .filter((g) => !g.completed)
              .slice(0, 5)
              .map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-medium">{goal.title}</p>
                    <span className="text-white/70 text-sm">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            {goals.filter((g) => !g.completed).length === 0 && (
              <p className="text-white/60 text-center py-4">Belum ada target aktif</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subtitle, color }) => {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          <p className="text-white/70 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="bg-white/20 rounded-lg p-3">{icon}</div>
      </div>
    </div>
  );
};
