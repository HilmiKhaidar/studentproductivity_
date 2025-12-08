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
  Bot,
  Music,
  FileText,
  CalendarDays,
  Trophy,
  Video,
  BookOpen,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useStore } from '../store/useStore';

const menuSections = [
  {
    title: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    ]
  },
  {
    title: 'Productivity',
    items: [
      { id: 'tasks', label: 'Tasks', icon: CheckSquare },
      { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
      { id: 'notes', label: 'Notes', icon: FileText },
      { id: 'study-planner', label: 'Study Planner', icon: CalendarDays },
      { id: 'study-resources', label: 'Resources', icon: BookOpen },
    ]
  },
  {
    title: 'Tracking',
    items: [
      { id: 'goals', label: 'Goals', icon: Target },
      { id: 'habits', label: 'Habits', icon: Zap },
      { id: 'sleep', label: 'Sleep', icon: Moon },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp },
      { id: 'advanced-calendar', label: 'Calendar', icon: Calendar },
    ]
  },
  {
    title: 'Social',
    items: [
      { id: 'friends', label: 'Friends', icon: Users },
      { id: 'study-groups', label: 'Study Groups', icon: Users },
      { id: 'multiplayer', label: 'Multiplayer', icon: Video },
      { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    ]
  },
  {
    title: 'More',
    items: [
      { id: 'study-music', label: 'Music', icon: Music },
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentView, setCurrentView, user, settings, updateSettings } = useStore();

  const handleMenuClick = (viewId: string) => {
    setCurrentView(viewId);
    onClose();
  };

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  return (
    <div
      className={`
        fixed lg:sticky top-0 left-0 z-40
        w-60 bg-[#FBFBFA] dark:bg-[#202020] border-r border-[#E9E9E7] dark:border-[#373737] h-screen
        flex flex-col
        transition-transform duration-200 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Workspace Header */}
      <div className="px-3 py-3 border-b border-[#E9E9E7] dark:border-[#373737]">
        <button className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
          <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
            <Zap className="text-white" size={12} />
          </div>
          <span className="text-sm font-semibold notion-text truncate">StudyHub</span>
          <ChevronDown size={14} className="ml-auto text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-3 py-2">
          <button
            onClick={() => handleMenuClick('profile')}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-5 h-5 rounded flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm notion-text font-medium truncate">{user.name}</span>
          </button>
        </div>
      )}

      {/* Menu Sections */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {menuSections.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? 'mt-4' : ''}>
            <div className="px-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider notion-text-secondary">
                {section.title}
              </span>
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`
                      w-full flex items-center gap-2 px-2 py-1 rounded text-sm
                      transition-all duration-150
                      ${isActive 
                        ? 'bg-black/5 dark:bg-white/5 notion-text font-medium' 
                        : 'notion-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:notion-text'
                      }
                    `}
                  >
                    <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-[#2383E2]' : ''}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="px-3 py-3 border-t border-[#E9E9E7] dark:border-[#373737] space-y-1">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm notion-text-secondary hover:notion-text"
        >
          <Moon size={16} />
          <span>{settings.darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm notion-text-secondary hover:notion-text"
        >
          <Plus size={16} />
          <span>New Page</span>
        </button>
      </div>
    </div>
  );
};
