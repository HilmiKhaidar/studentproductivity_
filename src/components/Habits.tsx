import React, { useState } from 'react';
import { Plus, Zap, Flame, Calendar, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Habit } from '../types';
import { generateId, getWeekDays } from '../utils/helpers';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export const Habits: React.FC = () => {
  const { habits, addHabit, deleteHabit, toggleHabitCompletion } = useStore();
  const [showModal, setShowModal] = useState(false);
  const weekDays = getWeekDays();
  const today = new Date().toISOString().split('T')[0];

  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const todayCompleted = habits.filter((h) => h.completedDates.includes(today)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Pelacak Kebiasaan</h2>
          <p className="text-white/70 mt-1">Bangun kebiasaan baik untuk produktivitas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          Tambah Kebiasaan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Kebiasaan</p>
              <p className="text-4xl font-bold text-white mt-2">{habits.length}</p>
            </div>
            <Zap className="text-white/80" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Selesai Hari Ini</p>
              <p className="text-4xl font-bold text-white mt-2">{todayCompleted}/{habits.length}</p>
            </div>
            <Calendar className="text-white/80" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Streak</p>
              <p className="text-4xl font-bold text-white mt-2">{totalStreak}</p>
            </div>
            <Flame className="text-white/80" size={32} />
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <p className="text-white/70 text-lg">Belum ada kebiasaan yang dilacak</p>
          </div>
        ) : (
          habits.map((habit) => (
            <div
              key={habit.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    />
                    <h3 className="text-xl font-bold text-white">{habit.name}</h3>
                  </div>
                  <p className="text-white/70 mt-1">{habit.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Flame className="text-orange-400" size={18} />
                      <span className="text-white font-bold">{habit.streak} hari</span>
                      <span className="text-white/60 text-sm">streak</span>
                    </div>
                    <div className="h-4 w-px bg-white/20" />
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-sm">Terbaik:</span>
                      <span className="text-white font-bold">{habit.longestStreak} hari</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-red-400 hover:text-red-300 transition-colors p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Week View */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isCompleted = habit.completedDates.includes(dateStr);
                  const isToday = dateStr === today;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => toggleHabitCompletion(habit.id, dateStr)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white shadow-lg scale-105'
                          : isToday
                          ? 'bg-white/20 text-white border-2 border-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xs font-medium">
                        {format(day, 'EEE', { locale: idLocale })}
                      </span>
                      <span className="text-lg font-bold">{format(day, 'd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <HabitModal
          onClose={() => setShowModal(false)}
          onSubmit={(habit) => {
            addHabit(habit);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

interface HabitModalProps {
  onClose: () => void;
  onSubmit: (habit: Habit) => void;
}

const HabitModal: React.FC<HabitModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily' as 'daily' | 'weekly',
    color: '#8b5cf6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const habit: Habit = {
      id: generateId(),
      name: formData.name,
      description: formData.description,
      frequency: formData.frequency,
      targetDays: [],
      streak: 0,
      longestStreak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
      color: formData.color,
    };
    onSubmit(habit);
  };

  const colors = [
    '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-2xl p-6 max-w-lg w-full border border-white/20 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6">Tambah Kebiasaan Baru</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">Nama Kebiasaan</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="Contoh: Olahraga pagi"
            />
          </div>
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">Deskripsi</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 h-20 resize-none"
              placeholder="Jelaskan kebiasaan ini"
            />
          </div>
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">Frekuensi</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'daily' | 'weekly' })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="daily">Setiap Hari</option>
              <option value="weekly">Mingguan</option>
            </select>
          </div>
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">Warna</label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-full aspect-square rounded-lg transition-all ${
                    formData.color === color ? 'ring-4 ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              Tambah
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
