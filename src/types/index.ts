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
  photoURL?: string;
  bio?: string;
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
  members: string[]; // user IDs
  inviteCode: string; // 6-digit code for inviting
  createdAt: string;
  isActive: boolean;
  color: string;
  goals: string[];
  currentSession?: GroupSession;
}

export interface GroupSession {
  id: string;
  groupId: string;
  type: 'pomodoro' | 'study';
  startTime: string;
  endTime?: string;
  duration: number;
  activeMembers: string[];
  isActive: boolean;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'system';
}

export interface SharedTask {
  id: string;
  groupId: string;
  title: string;
  description: string;
  assignedTo: string[]; // user IDs
  dueDate: string;
  completed: boolean;
  completedBy: string[];
  createdBy: string;
  createdAt: string;
  priority: Priority;
  category: string;
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

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'tasks' | 'pomodoro' | 'streak' | 'social' | 'special';
  requirement: number;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  photoURL?: string;
  score: number;
  rank: number;
  tasksCompleted: number;
  pomodoroSessions: number;
  streak: number;
  level: number;
  badges: string[];
}

export interface WeeklyCompetition {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'tasks' | 'pomodoro' | 'streak' | 'mixed';
  participants: string[];
  leaderboard: LeaderboardEntry[];
  prizes: string[];
  isActive: boolean;
}

export interface TeamChallenge {
  id: string;
  name: string;
  description: string;
  teamA: {
    name: string;
    members: string[];
    score: number;
  };
  teamB: {
    name: string;
    members: string[];
    score: number;
  };
  startDate: string;
  endDate: string;
  type: 'tasks' | 'pomodoro' | 'study-hours';
  isActive: boolean;
  winner?: 'A' | 'B' | 'tie';
}

// Calendar Integration
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  type: 'task' | 'exam' | 'class' | 'meeting' | 'personal' | 'other';
  color: string;
  location?: string;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  reminders: number[]; // minutes before event
  googleEventId?: string;
  createdAt: string;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number; // every X days/weeks/months
  daysOfWeek?: number[]; // 0-6 for weekly
  endDate?: string;
  occurrences?: number;
}

// Study Resources
export interface StudyFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document' | 'other';
  url: string;
  size: number; // in bytes
  uploadedBy: string;
  uploadedAt: string;
  subject?: string;
  tags: string[];
  sharedWith: string[]; // user IDs or group IDs
  isPublic: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  nextReview?: string;
  reviewCount: number;
  correctCount: number;
  createdAt: string;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  subject: string;
  color: string;
  cards: Flashcard[];
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
  sharedWith: string[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
  attempts: QuizAttempt[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: { questionId: string; answer: string }[];
  score: number;
  percentage: number;
  completedAt: string;
  timeSpent: number; // in seconds
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  tags: string[];
  favicon?: string;
  createdAt: string;
  isFavorite: boolean;
}

// Multiplayer Features
export interface PrivateMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
}

export interface StudySession {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  description: string;
  participants: SessionParticipant[];
  startTime: string;
  endTime?: string;
  isActive: boolean;
  type: 'video' | 'audio' | 'silent';
  maxParticipants: number;
  isPublic: boolean;
  subject?: string;
}

export interface SessionParticipant {
  userId: string;
  name: string;
  photoURL?: string;
  joinedAt: string;
  isActive: boolean;
  isMuted?: boolean;
  isVideoOn?: boolean;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  type: 'task_completed' | 'goal_achieved' | 'streak_milestone' | 'badge_earned' | 'study_session';
  content: string;
  timestamp: string;
  likes: string[];
  comments: ActivityComment[];
}

export interface ActivityComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: string;
}

export interface WhiteboardData {
  id: string;
  sessionId: string;
  elements: WhiteboardElement[];
  createdBy: string;
  lastModified: string;
}

export interface WhiteboardElement {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth?: number;
  text?: string;
  points?: { x: number; y: number }[];
}
