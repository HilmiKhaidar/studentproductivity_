export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: Priority;
  dueDate: string;
  completed: boolean;
  estimatedTime: number; // in minutes
  actualTime?: number;
  createdAt: string;
  completedAt?: string;
  tags: string[];
}

export type TaskCategory = 'study' | 'assignment' | 'exam' | 'project' | 'personal' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface SleepRecord {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number; // in minutes
  quality: SleepQuality;
  notes?: string;
  interruptions: number;
  deepSleepPercentage?: number;
}

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export interface PomodoroSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  type: 'work' | 'short-break' | 'long-break';
  taskId?: string;
  completed: boolean;
  interrupted: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  progress: number; // 0-100
  milestones: Milestone[];
  createdAt: string;
  completed: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly';
  targetDays: number[];
  streak: number;
  longestStreak: number;
  completedDates: string[];
  createdAt: string;
  color: string;
}

export interface StudySession {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  duration: number;
  productivity: number; // 1-5
  notes?: string;
}

export interface UserSettings {
  pomodoroWorkDuration: number;
  pomodoroShortBreak: number;
  pomodoroLongBreak: number;
  pomodoroSessionsBeforeLongBreak: number;
  targetSleepHours: number;
  targetBedTime: string;
  targetWakeTime: string;
  notifications: boolean;
  darkMode: boolean;
  focusSoundEnabled: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}
