import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AIAssistant } from './components/AIAssistant';
import { Tasks } from './components/Tasks';
import { Sleep } from './components/Sleep';
import { Pomodoro } from './components/Pomodoro';
import { Goals } from './components/Goals';
import { Habits } from './components/Habits';
import { Analytics } from './components/Analytics';
import { Calendar } from './components/Calendar';
import { AdvancedCalendar } from './components/AdvancedCalendar';
import { Notifications } from './components/Notifications';
import { StudyMusic } from './components/StudyMusic';
import { SocialSharing } from './components/SocialSharing';
import { Notes } from './components/Notes';
import { StudyPlanner } from './components/StudyPlanner';
import { StudyResources } from './components/StudyResources';
import { Themes } from './components/Themes';
import { Friends } from './components/Friends';
import { StudyGroups } from './components/StudyGroups';
import { Multiplayer } from './components/Multiplayer';
import { Leaderboard } from './components/Leaderboard';
import { Profile } from './components/Profile';
import { Feedback } from './components/Feedback';
import { Settings } from './components/Settings';
import { Auth } from './components/Auth';
import { useStore } from './store/useStore';
import { getThemeById } from './data/themes';

function App() {
  const { currentView, isAuthenticated, settings, updateSettings } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Ensure theme is set on first load
    if (!settings.theme) {
      updateSettings({ theme: 'default' });
    }
  }, []);

  useEffect(() => {
    // Apply dark mode to html element
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [settings.darkMode]);

  useEffect(() => {
    // Apply theme
    const theme = getThemeById(settings.theme || 'default');
    
    // Set CSS custom properties for theme
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
    document.documentElement.style.setProperty('--theme-text', theme.textColor);
    document.documentElement.style.setProperty('--theme-card-bg', theme.cardBg);
    
    // Apply background
    document.body.style.setProperty('background', theme.background, 'important');
    document.body.style.setProperty('background-attachment', 'fixed', 'important');
    
    if (theme.backgroundImage) {
      document.body.style.setProperty('background-image', theme.backgroundImage, 'important');
    } else {
      document.body.style.removeProperty('background-image');
    }
    
    // Apply font size
    const fontSizes = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = fontSizes[settings.fontSize || 'medium'];
  }, [settings.theme, settings.fontSize]);

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <Auth />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'tasks':
        return <Tasks />;
      case 'sleep':
        return <Sleep />;
      case 'pomodoro':
        return <Pomodoro />;
      case 'goals':
        return <Goals />;
      case 'habits':
        return <Habits />;
      case 'analytics':
        return <Analytics />;
      case 'calendar':
        return <Calendar />;
      case 'advanced-calendar':
        return <AdvancedCalendar />;
      case 'notifications':
        return <Notifications />;
      case 'study-music':
        return <StudyMusic />;
      case 'social-sharing':
        return <SocialSharing />;
      case 'notes':
        return <Notes />;
      case 'study-planner':
        return <StudyPlanner />;
      case 'study-resources':
        return <StudyResources />;
      case 'themes':
        return <Themes />;
      case 'friends':
        return <Friends />;
      case 'study-groups':
        return <StudyGroups />;
      case 'multiplayer':
        return <Multiplayer />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'profile':
        return <Profile />;
      case 'feedback':
        return <Feedback />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#191919]">
      {/* Mobile Menu Button - Notion Style */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 notion-button p-2 notion-shadow"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content - Notion Style */}
      <main className="flex-1 overflow-y-auto lg:ml-0 bg-white dark:bg-[#191919]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 lg:px-24 py-8 md:py-12 mt-12 lg:mt-0">
          {renderView()}
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#FFFFFF',
            color: '#37352F',
            border: '1px solid #E9E9E7',
            boxShadow: 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px',
          },
        }}
      />
    </div>
  );
}

export default App;
