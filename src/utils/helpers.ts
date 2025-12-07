import { format, parseISO, differenceInMinutes, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatTime = (date: string | Date): string => {
  return format(typeof date === 'string' ? parseISO(date) : date, 'HH:mm', { locale: id });
};

export const formatDate = (date: string | Date): string => {
  return format(typeof date === 'string' ? parseISO(date) : date, 'dd MMM yyyy', { locale: id });
};

export const formatDateTime = (date: string | Date): string => {
  return format(typeof date === 'string' ? parseISO(date) : date, 'dd MMM yyyy HH:mm', { locale: id });
};

export const calculateSleepDuration = (bedTime: string, wakeTime: string): number => {
  const bed = parseISO(bedTime);
  const wake = parseISO(wakeTime);
  return differenceInMinutes(wake, bed);
};

export const minutesToHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}j ${mins}m`;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getWeekDays = (date: Date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    study: 'bg-blue-500',
    assignment: 'bg-purple-500',
    exam: 'bg-red-500',
    project: 'bg-indigo-500',
    personal: 'bg-pink-500',
    other: 'bg-gray-500',
  };
  return colors[category] || 'bg-gray-500';
};

export const getSleepQualityColor = (quality: string): string => {
  switch (quality) {
    case 'excellent':
      return 'text-green-500';
    case 'good':
      return 'text-blue-500';
    case 'fair':
      return 'text-yellow-500';
    case 'poor':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export const calculateProductivityScore = (
  completedTasks: number,
  totalTasks: number,
  pomodoroSessions: number,
  sleepQuality: number
): number => {
  // Jika tidak ada data sama sekali, return 0
  if (totalTasks === 0 && pomodoroSessions === 0 && sleepQuality === 0) {
    return 0;
  }

  // Hitung skor berdasarkan data yang ada
  const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 40 : 0;
  const pomodoroScore = Math.min(pomodoroSessions * 5, 30);
  const sleepScore = sleepQuality * 30;
  
  return Math.round(taskScore + pomodoroScore + sleepScore);
};
