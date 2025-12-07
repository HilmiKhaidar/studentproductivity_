import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Moon,
  Timer,
  Target,
  TrendingUp,
  Calendar,
  Settings,
  Zap,
  User,
  MessageSquare,
} from 'lucide-react';
import { useStore } from '../store/useStore';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tugas', icon: CheckSquare },
  { id: 'sleep', label: 'Tidur', icon: Moon },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'goals', label: 'Target', icon: Target },
  { id: 'habits', label: 'Kebiasaan', icon: Zap },
  { id: 'analytics', label: 'Analitik', icon: TrendingUp },
  { id: 'calendar', label: 'Kalender', icon: Calendar },
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentView, setCurrentView } = useStore();

  const handleMenuClick = (viewId: string) => {
    setCurrentView(viewId);
    onClose(); // Close sidebar on mobile after selecting
  };

  return (
    <div
      className={`
        fixed lg:sticky top-0 left-0 z-40
        w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 h-screen
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <div className="p-6 border-b border-white/20">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="text-yellow-400" />
          StudyHub
        </h1>
        <p className="text-white/70 text-sm mt-1">Produktivitas Mahasiswa</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/20">
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-white/70 text-xs mb-2">Skor Produktivitas Hari Ini</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/20 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" style={{ width: '75%' }} />
            </div>
            <span className="text-white font-bold">75%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
