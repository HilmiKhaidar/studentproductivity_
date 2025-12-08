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
  Users,
  MessageSquare,
  Bot,
  Bell,
  Music,
  Share2,
  FileText,
  CalendarDays,
  Palette,
  Trophy,
  Video,
  BookOpen,
} from 'lucide-react';
import { useStore } from '../store/useStore';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'study-planner', label: 'Study Planner', icon: CalendarDays },
  { id: 'study-resources', label: 'Resources', icon: BookOpen },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'habits', label: 'Habits', icon: Zap },
  { id: 'sleep', label: 'Sleep', icon: Moon },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'advanced-calendar', label: 'Calendar', icon: Calendar },
  { id: 'study-music', label: 'Music', icon: Music },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'study-groups', label: 'Study Groups', icon: Users },
  { id: 'multiplayer', label: 'Multiplayer', icon: Video },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentView, setCurrentView, user } = useStore();

  const handleMenuClick = (viewId: string) => {
    setCurrentView(viewId);
    onClose();
  };

  return (
    <div
      className={`
        fixed lg:sticky top-0 left-0 z-40
        w-60 bg-[#F7F6F3] dark:bg-[#252525] border-r border-[#E9E9E7] dark:border-[#3F3F3F] h-screen
        flex flex-col
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E9E9E7] dark:border-[#3F3F3F]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
            <Zap className="text-white" size={16} />
          </div>
          <h1 className="text-sm font-semibold notion-text">StudyHub</h1>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-3 py-2 border-b border-[#E9E9E7] dark:border-[#3F3F3F]">
          <button
            onClick={() => handleMenuClick('profile')}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/50 dark:hover:bg-[#2F2F2F] transition-all"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-6 h-6 rounded" />
            ) : (
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm notion-text font-medium truncate">{user.name}</span>
          </button>
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm
                  transition-all duration-150
                  ${isActive 
                    ? 'bg-white dark:bg-[#2F2F2F] notion-text font-medium' 
                    : 'notion-text-secondary hover:bg-white/50 dark:hover:bg-[#2F2F2F]'
                  }
                `}
              >
                <Icon size={16} className={isActive ? 'text-[#2383E2]' : ''} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[#E9E9E7] dark:border-[#3F3F3F]">
        <div className="text-xs notion-text-secondary text-center">
          StudyHub © 2024
        </div>
      </div>
    </div>
  );
};
