import React, { useState, useMemo } from 'react';
import { Plus, Moon, Sun, TrendingUp, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { SleepRecord, SleepQuality } from '../types';
import { generateId, formatDate, minutesToHours, getSleepQualityColor } from '../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const Sleep: React.FC = () => {
  const { sleepRecords, addSleepRecord, settings } = useStore();
  const [showModal, setShowModal] = useState(false);

  const stats = useMemo(() => {
    if (sleepRecords.length === 0) {
      return {
        avgDuration: 0,
        avgQuality: 0,
        totalNights: 0,
        targetAchieved: 0,
      };
    }

    const totalDuration = sleepRecords.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = totalDuration / sleepRecords.length;
    
    const qualityMap = { poor: 1, fair: 2, good: 3, excellent: 4 };
    const avgQuality = sleepRecords.reduce((sum, r) => sum + qualityMap[r.quality], 0) / sleepRecords.length;
    
    const targetMinutes = settings.targetSleepHours * 60;
    const targetAchieved = sleepRecords.filter((r) => r.duration >= targetMinutes).length;

    return {
      avgDuration,
      avgQuality,
      totalNights: sleepRecords.length,
      targetAchieved,
    };
  }, [sleepRecords, settings]);

  const chartData = useMemo(() => {
    return sleepRecords.slice(-14).map((record) => ({
      date: new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      durasi: (record.duration / 60).toFixed(1),
      target: settings.targetSleepHours,
    }));
  }, [sleepRecords, settings]);

  const qualityDistribution = useMemo(() => {
    const dist = { excellent: 0, good: 0, fair: 0, poor: 0 };
    sleepRecords.forEach((r) => dist[r.quality]++);
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [sleepRecords]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Pelacak Tidur</h2>
          <p className="text-white/70 mt-1">Monitor pola tidur dan kualitas istirahat</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          Catat Tidur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Rata-rata Durasi</p>
              <p className="text-3xl font-bold text-white mt-2">{minutesToHours(stats.avgDuration)}</p>
            </div>
            <Moon className="text-white/80" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Kualitas Rata-rata</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.avgQuality.toFixed(1)}/4</p>
            </div>
            <TrendingUp className="text-white/80" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Target Tercapai</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.totalNights > 0 ? Math.round((stats.targetAchieved / stats.totalNights) * 100) : 0}%
              </p>
            </div>
            <Sun className="text-white/80" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Malam</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalNights}</p>
            </div>
            <Calendar className="text-white/80" size={32} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Durasi Tidur (14 Hari Terakhir)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" label={{ value: 'Jam', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Line type="monotone" dataKey="durasi" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
              <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Distribusi Kualitas Tidur</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={qualityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sleep Records */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Riwayat Tidur</h3>
        <div className="space-y-3">
          {sleepRecords.length === 0 ? (
            <p className="text-white/60 text-center py-8">Belum ada catatan tidur</p>
          ) : (
            sleepRecords
              .slice()
              .reverse()
              .map((record) => (
                <div
                  key={record.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-white font-medium">{formatDate(record.date)}</p>
                          <p className="text-white/60 text-sm mt-1">
                            {new Date(record.bedTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -{' '}
                            {new Date(record.wakeTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="h-12 w-px bg-white/20" />
                        <div>
                          <p className="text-white/70 text-sm">Durasi</p>
                          <p className="text-white font-bold text-lg">{minutesToHours(record.duration)}</p>
                        </div>
                        <div className="h-12 w-px bg-white/20" />
                        <div>
                          <p className="text-white/70 text-sm">Kualitas</p>
                          <p className={`font-bold text-lg capitalize ${getSleepQualityColor(record.quality)}`}>
                            {record.quality}
                          </p>
                        </div>
                        {record.interruptions > 0 && (
                          <>
                            <div className="h-12 w-px bg-white/20" />
                            <div>
                              <p className="text-white/70 text-sm">Gangguan</p>
                              <p className="text-white font-bold text-lg">{record.interruptions}x</p>
                            </div>
                          </>
                        )}
                      </div>
                      {record.notes && (
                        <p className="text-white/60 text-sm mt-3 italic">"{record.notes}"</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {showModal && <SleepModal onClose={() => setShowModal(false)} onSubmit={addSleepRecord} />}
    </div>
  );
};

interface SleepModalProps {
  onClose: () => void;
  onSubmit: (record: SleepRecord) => void;
}

const SleepModal: React.FC<SleepModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    bedTime: '22:00',
    wakeTime: '06:00',
    quality: 'good' as SleepQuality,
    interruptions: 0,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bedDateTime = new Date(`${formData.date}T${formData.bedTime}`);
    let wakeDateTime = new Date(`${formData.date}T${formData.wakeTime}`);
    
    if (wakeDateTime <= bedDateTime) {
      wakeDateTime.setDate(wakeDateTime.getDate() + 1);
    }
    
    const duration = Math.floor((wakeDateTime.getTime() - bedDateTime.getTime()) / (1000 * 60));

    const record: SleepRecord = {
      id: generateId(),
      date: formData.date,
      bedTime: bedDateTime.toISOString(),
      wakeTime: wakeDateTime.toISOString(),
      duration,
      quality: formData.quality,
      interruptions: formData.interruptions,
      notes: formData.notes,
    };

    onSubmit(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-2xl p-6 max-w-lg w-full border border-white/20 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6">Catat Tidur</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">Tanggal</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Jam Tidur</label>
              <input
                type="time"
                required
                value={formData.bedTime}
                onChange={(e) => setFormData({ ...formData, bedTime: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Jam Bangun</label>
              <input
                type="time"
                required
                value={formData.wakeTime}
                onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">Kualitas Tidur</label>
            <select
              value={formData.quality}
              onChange={(e) => setFormData({ ...formData, quality: e.target.value as SleepQuality })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="excellent">Sangat Baik</option>
              <option value="good">Baik</option>
              <option value="fair">Cukup</option>
              <option value="poor">Buruk</option>
            </select>
          </div>
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">Jumlah Gangguan</label>
            <input
              type="number"
              min="0"
              value={formData.interruptions}
              onChange={(e) => setFormData({ ...formData, interruptions: parseInt(e.target.value) || 0 })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">Catatan (opsional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 h-20 resize-none"
              placeholder="Mimpi, perasaan saat bangun, dll."
            />
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
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
