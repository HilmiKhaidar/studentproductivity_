import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, User, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ClassSchedule, Exam } from '../types';
import toast from 'react-hot-toast';

export const StudyPlanner: React.FC = () => {
  const { classSchedules, addClassSchedule, updateClassSchedule, deleteClassSchedule, exams, addExam, updateExam, deleteExam } = useStore();
  const [activeTab, setActiveTab] = useState<'schedule' | 'exams'>('schedule');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

  const [scheduleForm, setScheduleForm] = useState({
    subject: '',
    day: 1,
    startTime: '08:00',
    endTime: '10:00',
    room: '',
    instructor: '',
    color: colors[0],
    notes: '',
  });

  const [examForm, setExamForm] = useState({
    subject: '',
    date: '',
    time: '08:00',
    duration: 120,
    room: '',
    topics: '',
    studyProgress: 0,
    notes: '',
  });

  const upcomingExams = useMemo(() => {
    const now = new Date();
    return exams
      .filter(exam => new Date(exam.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [exams]);

  const getDaysUntilExam = (examDate: string) => {
    const now = new Date();
    const exam = new Date(examDate);
    const diff = exam.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.subject.trim()) {
      toast.error('Nama mata kuliah tidak boleh kosong!');
      return;
    }

    const scheduleData: ClassSchedule = {
      id: editingSchedule?.id || Date.now().toString(),
      subject: scheduleForm.subject,
      day: scheduleForm.day,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      room: scheduleForm.room,
      instructor: scheduleForm.instructor,
      color: scheduleForm.color,
      notes: scheduleForm.notes,
    };

    if (editingSchedule) {
      updateClassSchedule(editingSchedule.id, scheduleData);
      toast.success('Jadwal berhasil diupdate!');
    } else {
      addClassSchedule(scheduleData);
      toast.success('Jadwal berhasil ditambahkan!');
    }

    setIsScheduleModalOpen(false);
    setEditingSchedule(null);
    setScheduleForm({ subject: '', day: 1, startTime: '08:00', endTime: '10:00', room: '', instructor: '', color: colors[0], notes: '' });
  };

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.subject.trim() || !examForm.date) {
      toast.error('Mata kuliah dan tanggal ujian harus diisi!');
      return;
    }

    const examData: Exam = {
      id: editingExam?.id || Date.now().toString(),
      subject: examForm.subject,
      date: examForm.date,
      time: examForm.time,
      duration: examForm.duration,
      room: examForm.room,
      topics: examForm.topics.split(',').map(t => t.trim()).filter(t => t),
      studyProgress: examForm.studyProgress,
      notes: examForm.notes,
    };

    if (editingExam) {
      updateExam(editingExam.id, examData);
      toast.success('Ujian berhasil diupdate!');
    } else {
      addExam(examData);
      toast.success('Ujian berhasil ditambahkan!');
    }

    setIsExamModalOpen(false);
    setEditingExam(null);
    setExamForm({ subject: '', date: '', time: '08:00', duration: 120, room: '', topics: '', studyProgress: 0, notes: '' });
  };

  const getScheduleForDay = (day: number) => {
    return classSchedules
      .filter(s => s.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">📅 Study Planner</h2>
          <p className="text-white/70 mt-1">Kelola jadwal kuliah dan ujianmu</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'schedule'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Jadwal Kuliah
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'exams'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Ujian & Deadline
        </button>
      </div>

      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingSchedule(null);
                setScheduleForm({ subject: '', day: 1, startTime: '08:00', endTime: '10:00', room: '', instructor: '', color: colors[0], notes: '' });
                setIsScheduleModalOpen(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Tambah Jadwal
            </button>
          </div>

          {/* Weekly Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {days.slice(1).map((day, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">{day}</h3>
                <div className="space-y-2">
                  {getScheduleForDay(idx + 1).map((schedule) => (
                    <div
                      key={schedule.id}
                      className="bg-white/5 rounded-lg p-3 border-l-4"
                      style={{ borderLeftColor: schedule.color }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-white">{schedule.subject}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-white/70">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                            {schedule.room && (
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {schedule.room}
                              </span>
                            )}
                          </div>
                          {schedule.instructor && (
                            <p className="text-sm text-white/60 mt-1 flex items-center gap-1">
                              <User size={14} />
                              {schedule.instructor}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingSchedule(schedule);
                              setScheduleForm({
                                subject: schedule.subject,
                                day: schedule.day,
                                startTime: schedule.startTime,
                                endTime: schedule.endTime,
                                room: schedule.room || '',
                                instructor: schedule.instructor || '',
                                color: schedule.color,
                                notes: schedule.notes || '',
                              });
                              setIsScheduleModalOpen(true);
                            }}
                            className="text-white/50 hover:text-white p-1"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Yakin ingin menghapus jadwal ini?')) {
                                deleteClassSchedule(schedule.id);
                                toast.success('Jadwal berhasil dihapus!');
                              }
                            }}
                            className="text-white/50 hover:text-red-400 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {getScheduleForDay(idx + 1).length === 0 && (
                    <p className="text-white/50 text-sm text-center py-4">Tidak ada jadwal</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingExam(null);
                setExamForm({ subject: '', date: '', time: '08:00', duration: 120, room: '', topics: '', studyProgress: 0, notes: '' });
                setIsExamModalOpen(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Tambah Ujian
            </button>
          </div>

          {/* Upcoming Exams Alert */}
          {upcomingExams.length > 0 && (
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-xl p-6 border border-orange-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="text-orange-400" />
                Ujian Mendatang
              </h3>
              <div className="space-y-3">
                {upcomingExams.map((exam) => {
                  const daysUntil = getDaysUntilExam(exam.date);
                  return (
                    <div key={exam.id} className="bg-white/10 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-lg">{exam.subject}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-white/70">
                            <span className="flex items-center gap-1">
                              <CalendarIcon size={14} />
                              {new Date(exam.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {exam.time} ({exam.duration} menit)
                            </span>
                          </div>
                          {exam.room && (
                            <p className="text-sm text-white/60 mt-1 flex items-center gap-1">
                              <MapPin size={14} />
                              {exam.room}
                            </p>
                          )}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-white/70">Progress Belajar</span>
                              <span className="text-white font-medium">{exam.studyProgress}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${exam.studyProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`px-4 py-2 rounded-lg text-center ${
                            daysUntil <= 3 ? 'bg-red-500' : daysUntil <= 7 ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            <div className="text-2xl font-bold text-white">{daysUntil}</div>
                            <div className="text-xs text-white/80">hari lagi</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Exams List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Semua Ujian</h3>
            <div className="space-y-3">
              {exams.length === 0 && (
                <p className="text-white/60 text-center py-8">Belum ada ujian terjadwal</p>
              )}
              {exams.map((exam) => (
                <div key={exam.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{exam.subject}</h4>
                      <p className="text-sm text-white/70 mt-1">
                        {new Date(exam.date).toLocaleDateString('id-ID')} • {exam.time}
                      </p>
                      {exam.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {exam.topics.map((topic, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingExam(exam);
                          setExamForm({
                            subject: exam.subject,
                            date: exam.date,
                            time: exam.time,
                            duration: exam.duration,
                            room: exam.room || '',
                            topics: exam.topics.join(', '),
                            studyProgress: exam.studyProgress,
                            notes: exam.notes || '',
                          });
                          setIsExamModalOpen(true);
                        }}
                        className="text-white/50 hover:text-white p-1"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Yakin ingin menghapus ujian ini?')) {
                            deleteExam(exam.id);
                            toast.success('Ujian berhasil dihapus!');
                          }
                        }}
                        className="text-white/50 hover:text-red-400 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal - Simplified */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-xl p-6 max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">{editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <input type="text" placeholder="Mata Kuliah" value={scheduleForm.subject} onChange={(e) => setScheduleForm({ ...scheduleForm, subject: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" required />
              <select value={scheduleForm.day} onChange={(e) => setScheduleForm({ ...scheduleForm, day: Number(e.target.value) })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
                {days.slice(1).map((day, idx) => (<option key={idx} value={idx + 1}>{day}</option>))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="time" value={scheduleForm.startTime} onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" />
                <input type="time" value={scheduleForm.endTime} onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" />
              </div>
              <input type="text" placeholder="Ruangan (opsional)" value={scheduleForm.room} onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" />
              <input type="text" placeholder="Dosen (opsional)" value={scheduleForm.instructor} onChange={(e) => setScheduleForm({ ...scheduleForm, instructor: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" />
              <div className="flex gap-2">
                {colors.map((color) => (<button key={color} type="button" onClick={() => setScheduleForm({ ...scheduleForm, color })} className={`w-8 h-8 rounded-full border-2 ${scheduleForm.color === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />))}
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold">Simpan</button>
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-6 bg-white/10 text-white py-3 rounded-lg font-semibold">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Modal - Simplified */}
      {isExamModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-xl p-6 max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">{editingExam ? 'Edit Ujian' : 'Tambah Ujian'}</h3>
            <form onSubmit={handleExamSubmit} className="space-y-4">
              <input type="text" placeholder="Mata Kuliah" value={examForm.subject} onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={examForm.date} onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" required />
                <input type="time" value={examForm.time} onChange={(e) => setExamForm({ ...examForm, time: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" />
              </div>
              <input type="number" placeholder="Durasi (menit)" value={examForm.duration} onChange={(e) => setExamForm({ ...examForm, duration: Number(e.target.value) })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" />
              <input type="text" placeholder="Ruangan (opsional)" value={examForm.room} onChange={(e) => setExamForm({ ...examForm, room: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" />
              <input type="text" placeholder="Topik (pisahkan dengan koma)" value={examForm.topics} onChange={(e) => setExamForm({ ...examForm, topics: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" />
              <div>
                <label className="block text-white/80 mb-2">Progress Belajar: {examForm.studyProgress}%</label>
                <input type="range" min="0" max="100" value={examForm.studyProgress} onChange={(e) => setExamForm({ ...examForm, studyProgress: Number(e.target.value) })} className="w-full" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold">Simpan</button>
                <button type="button" onClick={() => setIsExamModalOpen(false)} className="px-6 bg-white/10 text-white py-3 rounded-lg font-semibold">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
