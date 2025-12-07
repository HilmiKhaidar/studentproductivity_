import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';

interface FocusModeProps {
  onClose: () => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ onClose }) => {
  const { settings } = useStore();
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroWorkDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Auto switch mode
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(settings.pomodoroShortBreak * 60);
      } else {
        setMode('work');
        setTimeLeft(settings.pomodoroWorkDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, settings]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? settings.pomodoroWorkDuration * 60 : settings.pomodoroShortBreak * 60);
  };

  const progress = mode === 'work'
    ? ((settings.pomodoroWorkDuration * 60 - timeLeft) / (settings.pomodoroWorkDuration * 60)) * 100
    : ((settings.pomodoroShortBreak * 60 - timeLeft) / (settings.pomodoroShortBreak * 60)) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
      >
        <X size={32} />
      </button>

      {/* Main Content */}
      <div className="text-center">
        {/* Mode Badge */}
        <div className="mb-8">
          <span className={`px-6 py-3 rounded-full text-lg font-bold ${
            mode === 'work' 
              ? 'bg-red-500/20 text-red-300 border-2 border-red-500' 
              : 'bg-green-500/20 text-green-300 border-2 border-green-500'
          }`}>
            {mode === 'work' ? '🎯 Focus Time' : '☕ Break Time'}
          </span>
        </div>

        {/* Timer Circle */}
        <div className="relative w-80 h-80 mx-auto mb-12">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="20"
              fill="none"
            />
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke={mode === 'work' ? '#ef4444' : '#10b981'}
              strokeWidth="20"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 140}`}
              strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl font-bold text-white">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="bg-white text-purple-900 p-6 rounded-full hover:bg-white/90 transition-all shadow-2xl hover:scale-110"
          >
            {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
          <button
            onClick={handleReset}
            className="bg-white/10 text-white p-6 rounded-full hover:bg-white/20 transition-all"
          >
            <RotateCcw size={32} />
          </button>
        </div>

        {/* Quote */}
        <div className="mt-12 max-w-2xl mx-auto">
          <p className="text-white/80 text-xl italic">
            "{mode === 'work' ? 'Focus is the gateway to thinking clearly' : 'Rest is not idleness'}"
          </p>
          <p className="text-white/60 mt-2">
            {mode === 'work' ? '— Thich Nhat Hanh' : '— John Lubbock'}
          </p>
        </div>
      </div>
    </div>
  );
};
