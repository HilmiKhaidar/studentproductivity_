import React, { useState, useMemo } from 'react';
import { Plus, Search, CheckCircle2, Circle, Trash2, Edit2, Calendar as CalendarIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Task, TaskCategory, Priority } from '../types';
import { generateId, formatDate, getPriorityColor, getCategoryColor } from '../utils/helpers';

export const Tasks: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskComplete } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && !task.completed) ||
        (filterStatus === 'completed' && task.completed);

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [tasks, searchQuery, filterCategory, filterPriority, filterStatus]);

  const handleSubmit = (formData: Partial<Task>) => {
    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      const newTask: Task = {
        id: generateId(),
        title: formData.title!,
        description: formData.description!,
        category: formData.category!,
        priority: formData.priority!,
        dueDate: formData.dueDate!,
        completed: false,
        estimatedTime: formData.estimatedTime!,
        createdAt: new Date().toISOString(),
        tags: formData.tags || [],
      };
      addTask(newTask);
    }
    setShowModal(false);
    setEditingTask(null);
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = total - completed;
    const urgent = tasks.filter((t) => !t.completed && t.priority === 'urgent').length;

    return { total, completed, active, urgent };
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[40px] font-bold notion-heading leading-tight">Manajemen Tugas</h2>
          <p className="notion-text-secondary text-sm mt-2">Kelola semua tugas dan deadline kamu</p>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setShowModal(true);
          }}
          className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          Tambah Tugas
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="notion-card p-4">
          <p className="notion-text-secondary text-sm">Total Tugas</p>
          <p className="text-[40px] font-bold notion-heading leading-tight mt-1">{stats.total}</p>
        </div>
        <div className="notion-card p-4">
          <p className="notion-text-secondary text-sm">Aktif</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{stats.active}</p>
        </div>
        <div className="notion-card p-4">
          <p className="notion-text-secondary text-sm">Selesai</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{stats.completed}</p>
        </div>
        <div className="notion-card p-4">
          <p className="notion-text-secondary text-sm">Mendesak</p>
          <p className="text-3xl font-bold text-red-400 mt-1">{stats.urgent}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="notion-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 notion-text/50" size={20} />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as TaskCategory | 'all')}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="all">Semua Kategori</option>
            <option value="study">Belajar</option>
            <option value="assignment">Tugas</option>
            <option value="exam">Ujian</option>
            <option value="project">Proyek</option>
            <option value="personal">Personal</option>
            <option value="other">Lainnya</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="all">Semua Prioritas</option>
            <option value="urgent">Mendesak</option>
            <option value="high">Tinggi</option>
            <option value="medium">Sedang</option>
            <option value="low">Rendah</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'completed')}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="completed">Selesai</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="notion-card p-12 text-center">
            <p className="notion-text-secondary text-lg">Tidak ada tugas ditemukan</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="notion-card p-4 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className="mt-1 notion-text-secondary hover:notion-text transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 size={24} className="text-green-400" />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold notion-text ${
                          task.completed ? 'line-through opacity-60' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                      <p className="notion-text-secondary text-sm mt-1">{task.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`${getCategoryColor(task.category)} notion-text text-xs px-3 py-1 rounded-full`}>
                          {task.category}
                        </span>
                        <span className={`${getPriorityColor(task.priority)} notion-text text-xs px-3 py-1 rounded-full`}>
                          {task.priority}
                        </span>
                        <span className="notion-text-secondary text-sm flex items-center gap-1">
                          <CalendarIcon size={14} />
                          {formatDate(task.dueDate)}
                        </span>
                        <span className="notion-text-secondary text-sm">
                          ~{task.estimatedTime} menit
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setShowModal(true);
                        }}
                        className="notion-text-secondary hover:notion-text transition-colors p-2"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Task>>(
    task || {
      title: '',
      description: '',
      category: 'study',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      estimatedTime: 30,
      tags: [],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-2xl p-6 max-w-2xl w-full border border-white/20 shadow-2xl">
        <h3 className="text-2xl font-bold notion-heading mb-6">
          {task ? 'Edit Tugas' : 'Tambah Tugas Baru'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block notion-text/90 text-sm font-medium mb-2">Judul Tugas</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="Masukkan judul tugas"
            />
          </div>
          <div>
            <label className="block notion-text/90 text-sm font-medium mb-2">Deskripsi</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 h-24 resize-none"
              placeholder="Deskripsi detail tugas"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block notion-text/90 text-sm font-medium mb-2">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="study">Belajar</option>
                <option value="assignment">Tugas</option>
                <option value="exam">Ujian</option>
                <option value="project">Proyek</option>
                <option value="personal">Personal</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block notion-text/90 text-sm font-medium mb-2">Prioritas</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
                <option value="urgent">Mendesak</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block notion-text/90 text-sm font-medium mb-2">Deadline</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label className="block notion-text/90 text-sm font-medium mb-2">Estimasi Waktu (menit)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 notion-text px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              {task ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
