import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Clock, Moon, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  requestNotificationPermission,
  getNotificationPermission,
  sendNotification,
  checkTaskDeadline,
  checkBedtime,
  formatTimeRemaining,
} from '../services/notificationService';
import toast from 'react-hot-toast';

export const Notifications: React.FC = () => {
  const { tasks, settings, pomodoroSessions } = useStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] = useState(getNotificationPermission());

  useEffect(() => {
    setPermission(getNotificationPermission());
    setNotificationsEnabled(settings.notifications && permission.granted);
  }, [settings.notifications, permission.granted]);

  // Check task deadlines every 30 minutes
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkDeadlines = () => {
      const incompleteTasks = tasks.filter(t => !t.completed);
      
      incompleteTasks.forEach(task => {
        const { isApproaching, hoursLeft } = checkTaskDeadline(task.dueDate);
        
        if (isApproaching) {
          const timeLeft = formatTimeRemaining(hoursLeft);
          sendNotification(
            '⏰ Deadline Mendekat!',
            `Tugas "${task.title}" deadline ${timeLeft}`,
            {
              tag: `task-${task.id}`,
              requireInteraction: task.priority === 'urgent',
            }
          );
        }
      });
    };

    // Check immediately
    checkDeadlines();

    // Then check every 30 minutes
    const interval = setInterval(checkDeadlines, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tasks, notificationsEnabled]);

  // Check bedtime every hour
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkSleepTime = () => {
      if (checkBedtime(settings.targetBedTime)) {
        sendNotification(
          '😴 Waktunya Tidur!',
          `Sudah jam ${settings.targetBedTime}. Yuk istirahat untuk performa optimal besok!`,
          {
            tag: 'bedtime',
            icon: '😴',
          }
        );
      }
    };

    // Check every hour
    const interval = setInterval(checkSleepTime, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.targetBedTime, notificationsEnabled]);

  // Pomodoro break reminder
  useEffect(() => {
    if (!notificationsEnabled) return;

    const lastSession = pomodoroSessions[pomodoroSessions.length - 1];
    
    if (lastSession && lastSession.completed) {
      const sessionEnd = new Date(lastSession.endTime || lastSession.startTime);
      const now = new Date();
      const minutesSinceEnd = (now.getTime() - sessionEnd.getTime()) / (1000 * 60);

      // If session just ended (within 1 minute)
      if (minutesSinceEnd < 1) {
        const breakDuration = lastSession.type === 'work' 
          ? settings.pomodoroShortBreak 
          : settings.pomodoroWorkDuration;

        sendNotification(
          '☕ Waktunya Break!',
          `Sesi Pomodoro selesai! Istirahat ${breakDuration} menit ya.`,
          {
            tag: 'pomodoro-break',
            requireInteraction: false,
          }
        );
      }
    }
  }, [pomodoroSessions, notificationsEnabled, settings]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    
    if (granted) {
      setNotificationsEnabled(true);
      setPermission(getNotificationPermission());
      toast.success('Notifikasi berhasil diaktifkan! 🔔');
      
      // Send test notification
      sendNotification(
        '✅ Notifikasi Aktif!',
        'Kamu akan mendapat reminder untuk tugas, tidur, dan break.'
      );
    } else {
      toast.error('Notifikasi ditolak. Aktifkan di pengaturan browser.');
    }
  };

  const handleDisableNotifications = () => {
    setNotificationsEnabled(false);
    toast('Notifikasi dinonaktifkan', { icon: '🔕' });
  };

  // Get upcoming reminders
  const upcomingReminders = tasks
    .filter(t => !t.completed)
    .map(t => {
      const { isApproaching, hoursLeft } = checkTaskDeadline(t.dueDate);
      return { task: t, isApproaching, hoursLeft };
    })
    .filter(r => r.isApproaching)
    .sort((a, b) => a.hoursLeft - b.hoursLeft);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Notifikasi & Reminder</h2>
        <p className="text-white/70 mt-1">Kelola pengingat dan notifikasi</p>
      </div>

      {/* Notification Status */}
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {notificationsEnabled ? (
              <Bell className="text-green-400" size={32} />
            ) : (
              <BellOff className="text-red-400" size={32} />
            )}
            <div>
              <h3 className="text-xl font-bold text-white">
                Status Notifikasi
              </h3>
              <p className="text-white/70 text-sm">
                {notificationsEnabled ? 'Aktif' : 'Nonaktif'}
              </p>
            </div>
          </div>

          {notificationsEnabled ? (
            <button
              onClick={handleDisableNotifications}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Nonaktifkan
            </button>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Aktifkan Notifikasi
            </button>
          )}
        </div>

        {permission.denied && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mt-4">
            <p className="text-white text-sm">
              ⚠️ Notifikasi diblokir oleh browser. Untuk mengaktifkan:
              <br />
              1. Klik icon gembok/info di address bar
              <br />
              2. Ubah permission "Notifications" menjadi "Allow"
              <br />
              3. Refresh halaman
            </p>
          </div>
        )}
      </div>

      {/* Notification Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-500 rounded-lg p-3">
              <Clock size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Deadline Reminder</h3>
          </div>
          <p className="text-white/70 text-sm">
            Pengingat otomatis 24 jam sebelum deadline tugas
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-500 rounded-lg p-3">
              <Moon size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Bedtime Reminder</h3>
          </div>
          <p className="text-white/70 text-sm">
            Pengingat tidur sesuai target jam tidur kamu
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-500 rounded-lg p-3">
              <CheckCircle size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Pomodoro Break</h3>
          </div>
          <p className="text-white/70 text-sm">
            Pengingat istirahat setelah sesi Pomodoro selesai
          </p>
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle size={24} />
          Reminder Mendatang
        </h3>

        {upcomingReminders.length > 0 ? (
          <div className="space-y-3">
            {upcomingReminders.map(({ task, hoursLeft }) => (
              <div
                key={task.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{task.title}</h4>
                    <p className="text-white/60 text-sm mt-1">
                      Deadline: {formatTimeRemaining(hoursLeft)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'urgent'
                        ? 'bg-red-500 text-white'
                        : task.priority === 'high'
                        ? 'bg-orange-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-white/60">
              ✅ Tidak ada deadline mendesak dalam 24 jam ke depan
            </p>
          </div>
        )}
      </div>

      {/* Settings Info */}
      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-3">⚙️ Pengaturan Notifikasi</h3>
        <div className="space-y-2 text-white/80 text-sm">
          <p>• Target waktu tidur: {settings.targetBedTime}</p>
          <p>• Durasi Pomodoro: {settings.pomodoroWorkDuration} menit</p>
          <p>• Break pendek: {settings.pomodoroShortBreak} menit</p>
          <p>• Break panjang: {settings.pomodoroLongBreak} menit</p>
        </div>
        <p className="text-white/60 text-xs mt-4">
          Ubah pengaturan di menu Settings untuk menyesuaikan reminder
        </p>
      </div>
    </div>
  );
};
