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
  theme: string;
  customTheme?: Theme;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  taskId?: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  color?: string;
}

export interface ClassSchedule {
  id: string;
  subject: string;
  day: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room?: string;
  instructor?: string;
  color: string;
  notes?: string;
}

export interface Exam {
  id: string;
  subject: string;
  date: string;
  time: string;
  duration: number; // in minutes
  room?: string;
  topics: string[];
  studyProgress: number; // 0-100
  notes?: string;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  acceptedAt?: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  members: string[];
  createdAt: string;
  isActive: boolean;
  color: string;
}

export interface SharedTask {
  id: string;
  groupId: string;
  title: string;
  description: string;
  assignedTo: string[];
  dueDate: string;
  completed: boolean;
  createdBy: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio?: string;
  avatar?: string;
  level: number;
  xp: number;
  totalTasks: number;
  totalPomodoros: number;
  streak: number;
  badges: string[];
  isPublic: boolean;
  createdAt: string;
}

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  backgroundImage?: string;
  textColor: string;
  cardBg: string;
}
