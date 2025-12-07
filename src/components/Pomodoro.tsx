import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, BarChart3 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PomodoroSession } from '../types';
import { generateId } from '../utils/helpers';

type TimerType = 'work' | 'short-break' | 'long-break';

export const Pomodoro: React.FC = () => {
  const { settings, pomodoroSessions, addPomodoroSession, setCurrentPomodoro, currentPomodoro } = useStore();
  const [timerType, setTimerType] = useState<TimerType>('work');
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroWorkDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const getDuration = (type: TimerType): number => {
    switch (type) {
      case 'work':
        return settings.pomodoroWorkDuration * 60;
      case 'short-break':
        return settings.pomodoroShortBreak * 60;
      case 'long-break':
        return settings.pomodoroLongBreak * 60;
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (currentPomodoro) {
      const completedSession: PomodoroSession = {
        ...currentPomodoro,
        endTime: new Date().toISOString(),
        completed: true,
        interrupted: false,
      };
      addPomodoroSession(completedSession);
      setCurrentPomodoro(null);
    }

    if (timerType === 'work') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      if (newSessionsCompleted % settings.pomodoroSessionsBeforeLongBreak === 0) {
        setTimerType('long-break');
        setTimeLeft(getDuration('long-break'));
      } else {
        setTimerType('short-break');
        setTimeLeft(getDuration('short-break'));
      }
    } else {
      setTimerType('work');
      setTimeLeft(getDuration('work'));
    }

    if (settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Selesai!', {
        body: timerType === 'work' ? 'Waktunya istirahat!' : 'Waktunya fokus lagi!',
      });
    }
  };

  const handleStart = () => {
    if (!isRunning) {
      const session: PomodoroSession = {
        id: generateId(),
        startTime: new Date().toISOString(),
        duration: getDuration(timerType) / 60,
        type: timerType,
        completed: false,
        interrupted: false,
      };
      setCurrentPomodoro(session);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(timerType));
    if (currentPomodoro) {
      const interruptedSession: PomodoroSession = {
        ...currentPomodoro,
        endTime: new Date().toISOString(),
        completed: false,
        interrupted: true,
      };
      addPomodoroSession(interruptedSession);
      setCurrentPomodoro(null);
    }
  };

  const handleTypeChange = (type: TimerType) => {
    if (isRunning) {
      handleReset();
    }
    setTimerType(type);
    setTimeLeft(getDuration(type));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((getDuration(timerType) - timeLeft) / getDuration(timerType)) * 100;

  const todayStats = pomodoroSessions.filter(
    (s) => s.startTime.startsWith(new Date().toISOString().split('T')[0]) && s.completed
  );

  const totalWorkTime = todayStats
    .filter((s) => s.type === 'work')
    .reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Pomodoro Timer</h2>
          <p className="text-white/70 mt-1">Tingkatkan fokus dengan teknik Pomodoro</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            {/* Type Selector */}
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => handleTypeChange('work')}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  timerType === 'work'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Zap className="inline mr-2" size={18} />
                Fokus
              </button>
              <button
                onClick={() => handleTypeChange('short-break')}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  timerType === 'short-break'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Coffee className="inline mr-2" size={18} />
                Istirahat Pendek
              </button>
              <button
                onClick={() => handleTypeChange('long-break')}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  timerType === 'long-break'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Coffee className="inline mr-2" size={18} />
                Istirahat Panjang
              </button>
            </div>

            {/* Timer Display */}
            <div className="relative">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-7xl font-bold text-white mb-2">{formatTime(timeLeft)}</p>
                <p className="text-white/70 text-lg capitalize">
                  {timerType === 'work' ? 'Fokus' : timerType === 'short-break' ? 'Istirahat Pendek' : 'Istirahat Panjang'}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mt-8">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="flex-1 bg-white text-purple-600 py-4 rounded-lg font-bold text-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <Play size={24} />
                  Mulai
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex-1 bg-white text-purple-600 py-4 rounded-lg font-bold text-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <Pause size={24} />
                  Jeda
                </button>
              )}
              <button
                onClick={handleReset}
                className="bg-white/10 text-white px-6 py-4 rounded-lg font-bold hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={24} />
                Reset
              </button>
            </div>

            {/* Session Counter */}
            <div className="mt-6 text-center">
              <p className="text-white/70 text-sm">Sesi Selesai Hari Ini</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {Array.from({ length: settings.pomodoroSessionsBeforeLongBreak }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < (sessionsCompleted % settings.pomodoroSessionsBeforeLongBreak)
                        ? 'bg-white'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/80 text-sm">Sesi Hari Ini</p>
              <BarChart3 className="text-white/80" size={24} />
            </div>
            <p className="text-4xl font-bold text-white">{todayStats.length}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/80 text-sm">Waktu Fokus</p>
              <Zap className="text-white/80" size={24} />
            </div>
            <p className="text-4xl font-bold text-white">{totalWorkTime}m</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/80 text-sm">Streak</p>
              <Zap className="text-white/80" size={24} />
            </div>
            <p className="text-4xl font-bold text-white">{sessionsCompleted}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-white font-bold mb-3">Tips Pomodoro</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>• Fokus penuh saat sesi kerja</li>
              <li>• Hindari distraksi</li>
              <li>• Istirahat dengan benar</li>
              <li>• Jangan skip istirahat</li>
              <li>• Evaluasi produktivitas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Sesi Terakhir</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {pomodoroSessions
            .slice(-6)
            .reverse()
            .map((session) => (
              <div
                key={session.id}
                className={`bg-white/5 rounded-lg p-4 border ${
                  session.completed ? 'border-green-500/30' : 'border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session.type === 'work'
                        ? 'bg-purple-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {session.type === 'work' ? 'Fokus' : 'Istirahat'}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      session.completed ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {session.completed ? '✓ Selesai' : '✗ Terputus'}
                  </span>
                </div>
                <p className="text-white/70 text-sm">
                  {new Date(session.startTime).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-white font-medium">{session.duration} menit</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
