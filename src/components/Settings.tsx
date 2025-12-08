import React, { useState } from 'react';
import { Save, Bell, Moon, Clock, Target } from 'lucide-react';
import { useStore } from '../store/useStore';
import { UserSettings } from '../types';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    if (formData.notifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Apply dark mode immediately
    if (formData.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[40px] font-bold notion-heading leading-tight">Pengaturan</h2>
        <p className="notion-text-secondary text-sm mt-2">Sesuaikan preferensi aplikasi kamu</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pomodoro Settings */}
        <div className="notion-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-blue-400" size={24} />
            <h3 className="text-lg font-semibold notion-heading">Pengaturan Pomodoro</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block notion-text/90 text-sm font-medium mb-2">
                Durasi Kerja (menit)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.pomodoroWorkDuration}
                onChange={(e) =>
                  setFormData({ ...formData, pomodoroWorkDuration: parseInt(e.target.value) })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label className="block notion-text/90 text-sm font-medium mb-2">
                Istirahat Pendek (menit)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.pomodoroShortBreak}
                onChange={(e) =>
                  setFormData({ ...formData, pomodoroShortBreak: parseInt(e.target.value) })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label className="block notion-text/90 text-sm font-medium mb-2">
                Istirahat Panjang (menit)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.pomodoroLongBreak}
                onChange={(e) =>
                  setFormData({ ...formData, pomodoroLongBreak: parseInt(e.target.value) })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label className="block notion-text/90 text-sm font-medium mb-2">
                Sesi Sebelum Istirahat Panjang
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={formData.pomodoroSessionsBeforeLongBreak}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pomodoroSessionsBeforeLongBreak: parseInt(e.target.value),
                  })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>
        </div>

        {/* Sleep Settings */}
        <div className="notion-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="text-purple-400" size={24} />
            <h3 className="text-lg font-semibold notion-heading">Target Tidur</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block notion-text/90 text-sm font-medium mb-2">
                Target Jam Tidur
              </label>
              <input
                type="number"
                min="4"
                max="12"
                step="0.5"
                value={formData.targetSleepHours}
                onChange={(e) =>
                  setFormData({ ...formData, targetSleepHours: parseFloat(e.target.value) })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label className="block notion-text/90 text-sm font-medium mb-2">
                Jam Tidur Ideal
              </label>
              <input
                type="time"
                value={formData.targetBedTime}
                onChange={(e) => setFormData({ ...formData, targetBedTime: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label className="block notion-text/90 text-sm font-medium mb-2">
                Jam Bangun Ideal
              </label>
              <input
                type="time"
                value={formData.targetWakeTime}
                onChange={(e) => setFormData({ ...formData, targetWakeTime: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="notion-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-green-400" size={24} />
            <h3 className="text-lg font-semibold notion-heading">Pengaturan Umum</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="notion-text-secondary" size={20} />
                <div>
                  <p className="notion-text font-medium">Notifikasi</p>
                  <p className="notion-text-secondary text-sm">Aktifkan notifikasi browser</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifications}
                  onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-white/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="notion-text-secondary" size={20} />
                <div>
                  <p className="notion-text font-medium">Mode Gelap</p>
                  <p className="notion-text-secondary text-sm">Tema gelap untuk mata</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.darkMode}
                  onChange={(e) => setFormData({ ...formData, darkMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-white/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg ${
              saved
                ? 'bg-green-500 notion-text'
                : 'bg-white text-purple-600 hover:bg-white/90'
            }`}
          >
            <Save size={20} />
            {saved ? 'Tersimpan!' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
        <h3 className="notion-text font-bold mb-2">💡 Tips</h3>
        <ul className="notion-text/80 text-sm space-y-1">
          <li>• Sesuaikan durasi Pomodoro dengan gaya belajar kamu</li>
          <li>• Tidur yang cukup meningkatkan produktivitas hingga 40%</li>
          <li>• Aktifkan notifikasi untuk pengingat penting</li>
          <li>• Konsisten dengan jadwal tidur untuk hasil terbaik</li>
        </ul>
      </div>
    </div>
  );
};
