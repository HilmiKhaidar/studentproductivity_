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
import { Notifications } from './components/Notifications';
import { StudyMusic } from './components/StudyMusic';
import { SocialSharing } from './components/SocialSharing';
import { Notes } from './components/Notes';
import { StudyPlanner } from './components/StudyPlanner';
import { Themes } from './components/Themes';
import { Friends } from './components/Friends';
import { Profile } from './components/Profile';
import { Feedback } from './components/Feedback';
import { Settings } from './components/Settings';
import { Auth } from './components/Auth';
import { useStore } from './store/useStore';
import { getThemeById } from './data/themes';

function App() {
  const { currentView, isAuthenticated, settings } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
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
    document.body.style.background = theme.background;
    if (theme.backgroundImage) {
      document.body.style.backgroundImage = theme.backgroundImage;
    } else {
      document.body.style.backgroundImage = 'none';
    }
    document.body.style.color = theme.textColor;
    
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
      case 'themes':
        return <Themes />;
      case 'friends':
        return <Friends />;
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
    <div className="flex min-h-screen">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/10 backdrop-blur-lg text-white p-3 rounded-lg border border-white/20 shadow-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto lg:ml-0">
        <div className="max-w-7xl mx-auto mt-16 lg:mt-0">
          {renderView()}
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
    </div>
  );
}

export default App;
