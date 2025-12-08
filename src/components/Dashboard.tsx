import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Moon,
  Target,
  Zap,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDate, minutesToHours, calculateProductivityScore } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDailyQuote, getRandomQuote } from '../data/quotes';

export const Dashboard: React.FC = () => {
  const { tasks, sleepRecords, pomodoroSessions, goals, habits } = useStore();
  const [quote, setQuote] = useState(getDailyQuote());

  const refreshQuote = () => {
    setQuote(getRandomQuote());
  };

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
      {/* Page Title - Notion Style */}
      <div className="space-y-1">
        <h1 className="text-[40px] font-bold notion-heading leading-tight">Dashboard</h1>
        <p className="notion-text-secondary text-sm">{formatDate(new Date())}</p>
      </div>

      {/* Divider */}
      <div className="border-b border-[#E9E9E7] dark:border-[#373737]"></div>

      {/* Motivational Quote - Notion Callout Style */}
      <div className="flex gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-900/30">
        <div className="flex-shrink-0 mt-0.5">
          <Sparkles className="text-blue-500" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold notion-heading">Daily Quote</h3>
            <button
              onClick={refreshQuote}
              className="notion-text-secondary hover:notion-text transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded flex-shrink-0"
              title="Refresh quote"
            >
              <RefreshCw size={14} />
            </button>
          </div>
          <blockquote className="notion-text text-sm leading-relaxed mb-2">
            "{quote.text}"
          </blockquote>
          <p className="notion-text-secondary text-xs">— {quote.author}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckCircle2 className="text-green-500" size={20} />}
          title="Tasks Today"
          value={`${stats.completedToday}/${stats.todayTasks}`}
          subtitle="Completed"
        />
        <StatCard
          icon={<Clock className="text-blue-500" size={20} />}
          title="Pomodoro"
          value={stats.todayPomodoros.toString()}
          subtitle="Sessions today"
        />
        <StatCard
          icon={<Moon className="text-purple-500" size={20} />}
          title="Last Sleep"
          value={stats.lastSleep ? minutesToHours(stats.lastSleep.duration) : '-'}
          subtitle={stats.lastSleep?.quality || 'No data'}
        />
        <StatCard
          icon={<Zap className="text-yellow-500" size={20} />}
          title="Habits"
          value={`${stats.todayHabitsCompleted}/${stats.activeHabits}`}
          subtitle="Completed today"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="notion-card p-6">
          <h3 className="text-lg font-semibold notion-heading mb-4">Last 7 Days Activity</h3>
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

        <div className="notion-card p-6">
          <h3 className="text-lg font-semibold notion-heading mb-4">Tasks by Category</h3>
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
        <div className="notion-card p-6">
          <h3 className="text-lg font-semibold notion-heading mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" />
            Urgent Tasks
          </h3>
          <div className="space-y-3">
            {tasks
              .filter((t) => !t.completed && (t.priority === 'urgent' || t.priority === 'high'))
              .slice(0, 5)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2 p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="notion-text text-sm">{task.title}</p>
                    <p className="notion-text-secondary text-xs mt-0.5">{task.category}</p>
                  </div>
                  <span
                    className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      task.priority === 'urgent' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            {tasks.filter((t) => !t.completed && (t.priority === 'urgent' || t.priority === 'high'))
              .length === 0 && (
              <p className="notion-text-secondary text-center py-8 text-sm">No urgent tasks 🎉</p>
            )}
          </div>
        </div>

        <div className="notion-card p-6">
          <h3 className="text-lg font-semibold notion-heading mb-4 flex items-center gap-2">
            <Target size={18} className="text-blue-500" />
            Active Goals
          </h3>
          <div className="space-y-3">
            {goals
              .filter((g) => !g.completed)
              .slice(0, 5)
              .map((goal) => (
                <div
                  key={goal.id}
                  className="p-3 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="notion-text text-sm font-medium">{goal.title}</p>
                    <span className="notion-text-secondary text-xs flex-shrink-0 ml-2">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            {goals.filter((g) => !g.completed).length === 0 && (
              <p className="notion-text-secondary text-center py-8 text-sm">No active goals</p>
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
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subtitle }) => {
  return (
    <div className="notion-card p-4 hover:bg-[#F7F6F3] dark:hover:bg-[#252525] transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="notion-text-secondary text-xs font-medium mb-2">{title}</p>
          <p className="text-2xl font-bold notion-heading mb-1">{value}</p>
          <p className="notion-text-secondary text-xs">{subtitle}</p>
        </div>
        <div className="flex-shrink-0 mt-1">{icon}</div>
      </div>
    </div>
  );
};
