import React, { useState } from 'react';
import { Plus, Target, CheckCircle2, Circle, Trash2, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Goal, Milestone } from '../types';
import { generateId, formatDate } from '../utils/helpers';

export const Goals: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  const handleSubmit = (formData: Partial<Goal>) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, formData);
    } else {
      const newGoal: Goal = {
        id: generateId(),
        title: formData.title!,
        description: formData.description!,
        category: formData.category!,
        targetDate: formData.targetDate!,
        progress: 0,
        milestones: formData.milestones || [],
        createdAt: new Date().toISOString(),
        completed: false,
      };
      addGoal(newGoal);
    }
    setShowModal(false);
    setEditingGoal(null);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId
        ? {
            ...m,
            completed: !m.completed,
            completedAt: !m.completed ? new Date().toISOString() : undefined,
          }
        : m
    );

    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const progress = Math.round((completedCount / updatedMilestones.length) * 100);

    updateGoal(goalId, {
      milestones: updatedMilestones,
      progress,
      completed: progress === 100,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[40px] font-bold notion-heading leading-tight">Target & Tujuan</h2>
          <p className="notion-text-secondary text-sm mt-2">Tetapkan dan capai target akademik kamu</p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            setShowModal(true);
          }}
          className="bg-white notion-text px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          Tambah Target
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="notion-text/80 text-sm">Total Target</p>
              <p className="text-4xl font-bold notion-text mt-2">{goals.length}</p>
            </div>
            <Target className="notion-text/80" size={32} />
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="notion-text/80 text-sm">Aktif</p>
              <p className="text-4xl font-bold notion-text mt-2">{activeGoals.length}</p>
            </div>
            <TrendingUp className="notion-text/80" size={32} />
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="notion-text/80 text-sm">Tercapai</p>
              <p className="text-4xl font-bold notion-text mt-2">{completedGoals.length}</p>
            </div>
            <CheckCircle2 className="notion-text/80" size={32} />
          </div>
        </div>
      </div>

      {/* Active Goals */}
      <div className="notion-card p-6">
        <h3 className="text-lg font-semibold notion-heading mb-4">Target Aktif</h3>
        <div className="space-y-4">
          {activeGoals.length === 0 ? (
            <p className="notion-text-secondary text-center py-8">Belum ada target aktif</p>
          ) : (
            activeGoals.map((goal) => (
              <div
                key={goal.id}
                className="notion-card p-6 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold notion-heading">{goal.title}</h4>
                    <p className="notion-text-secondary text-sm mt-2">{goal.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="bg-blue-500 notion-text text-xs px-3 py-1 rounded-full">
                        {goal.category}
                      </span>
                      <span className="notion-text-secondary text-sm">
                        Target: {formatDate(goal.targetDate)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="notion-text-secondary text-sm">Progress</span>
                    <span className="notion-text font-bold">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-blue-50 dark:bg-blue-900/10 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                {goal.milestones.length > 0 && (
                  <div>
                    <p className="notion-text-secondary text-sm font-medium mb-2">Milestone:</p>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-center gap-3 notion-card p-3"
                        >
                          <button
                            onClick={() => toggleMilestone(goal.id, milestone.id)}
                            className="notion-text-secondary hover:notion-text transition-colors"
                          >
                            {milestone.completed ? (
                              <CheckCircle2 size={20} className="text-green-400" />
                            ) : (
                              <Circle size={20} />
                            )}
                          </button>
                          <span
                            className={`flex-1 notion-text ${
                              milestone.completed ? 'line-through opacity-60' : ''
                            }`}
                          >
                            {milestone.title}
                          </span>
                          {milestone.completed && milestone.completedAt && (
                            <span className="notion-text/50 text-xs">
                              {formatDate(milestone.completedAt)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="notion-card p-6">
          <h3 className="text-lg font-semibold notion-heading mb-4">Target Tercapai 🎉</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-green-500/20 rounded-lg p-4 border border-green-500/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold notion-text">{goal.title}</h4>
                    <p className="notion-text-secondary text-sm mt-1">{goal.description}</p>
                    <span className="text-green-400 text-sm mt-2 inline-block">
                      ✓ Selesai
                    </span>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <GoalModal
          goal={editingGoal}
          onClose={() => {
            setShowModal(false);
            setEditingGoal(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

interface GoalModalProps {
  goal: Goal | null;
  onClose: () => void;
  onSubmit: (goal: Partial<Goal>) => void;
}

const GoalModal: React.FC<GoalModalProps> = ({ goal, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Goal>>(
    goal || {
      title: '',
      description: '',
      category: '',
      targetDate: new Date().toISOString().split('T')[0],
      milestones: [],
    }
  );
  const [milestoneInput, setMilestoneInput] = useState('');

  const addMilestone = () => {
    if (!milestoneInput.trim()) return;
    const newMilestone: Milestone = {
      id: generateId(),
      title: milestoneInput,
      completed: false,
    };
    setFormData({
      ...formData,
      milestones: [...(formData.milestones || []), newMilestone],
    });
    setMilestoneInput('');
  };

  const removeMilestone = (id: string) => {
    setFormData({
      ...formData,
      milestones: formData.milestones?.filter((m) => m.id !== id) || [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-lg rounded-2xl p-6 max-w-2xl w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold notion-heading mb-6">
          {goal ? 'Edit Target' : 'Tambah Target Baru'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block notion-text/90 text-sm font-medium mb-2">Judul Target</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="Contoh: Lulus dengan IPK 3.5"
            />
          </div>
          <div>
            <label className="block notion-text/90 text-sm font-medium mb-2">Deskripsi</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 h-24 resize-none"
              placeholder="Jelaskan target kamu secara detail"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block notion-text/90 text-sm font-medium mb-2">Kategori</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Akademik, Karir, dll"
              />
            </div>
            <div>
              <label className="block notion-text/90 text-sm font-medium mb-2">Target Tanggal</label>
              <input
                type="date"
                required
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>
          <div>
            <label className="block notion-text/90 text-sm font-medium mb-2">Milestone</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={milestoneInput}
                onChange={(e) => setMilestoneInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Tambah milestone..."
              />
              <button
                type="button"
                onClick={addMilestone}
                className="bg-white/20 notion-text px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {formData.milestones?.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-2 notion-card p-2"
                >
                  <span className="flex-1 notion-text">{milestone.title}</span>
                  <button
                    type="button"
                    onClick={() => removeMilestone(milestone.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
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
              className="flex-1 bg-white notion-text px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              {goal ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};