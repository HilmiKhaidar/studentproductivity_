import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Tasks } from './components/Tasks';
import { Sleep } from './components/Sleep';
import { Pomodoro } from './components/Pomodoro';
import { Goals } from './components/Goals';
import { Habits } from './components/Habits';
import { Analytics } from './components/Analytics';
import { Calendar } from './components/Calendar';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { Auth } from './components/Auth';
import { useStore } from './store/useStore';

function App() {
  const { currentView, isAuthenticated, settings } = useStore();

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

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <Auth />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
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
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
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
