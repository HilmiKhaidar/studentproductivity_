import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Task,
  SleepRecord,
  PomodoroSession,
  Goal,
  Habit,
  StudySession,
  UserSettings,
  User,
  Note,
  ClassSchedule,
  Exam,
} from '../types';
import { registerUser, loginUser, logoutUser, requestPasswordReset } from '../services/authService';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: any }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;

  // Tasks
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  // Sleep
  sleepRecords: SleepRecord[];
  addSleepRecord: (record: SleepRecord) => void;
  updateSleepRecord: (id: string, record: Partial<SleepRecord>) => void;
  deleteSleepRecord: (id: string) => void;

  // Pomodoro
  pomodoroSessions: PomodoroSession[];
  currentPomodoro: PomodoroSession | null;
  addPomodoroSession: (session: PomodoroSession) => void;
  updatePomodoroSession: (id: string, session: Partial<PomodoroSession>) => void;
  setCurrentPomodoro: (session: PomodoroSession | null) => void;

  // Goals
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Habits
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, date: string) => void;

  // Study Sessions
  studySessions: StudySession[];
  addStudySession: (session: StudySession) => void;

  // Notes
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Class Schedule
  classSchedules: ClassSchedule[];
  addClassSchedule: (schedule: ClassSchedule) => void;
  updateClassSchedule: (id: string, schedule: Partial<ClassSchedule>) => void;
  deleteClassSchedule: (id: string) => void;

  // Exams
  exams: Exam[];
  addExam: (exam: Exam) => void;
  updateExam: (id: string, exam: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  // Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // UI State
  currentView: string;
  setCurrentView: (view: string) => void;
}

const defaultSettings: UserSettings = {
  pomodoroWorkDuration: 25,
  pomodoroShortBreak: 5,
  pomodoroLongBreak: 15,
  pomodoroSessionsBeforeLongBreak: 4,
  targetSleepHours: 8,
  targetBedTime: '22:00',
  targetWakeTime: '06:00',
  notifications: true,
  darkMode: false,
  focusSoundEnabled: false,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const result = await loginUser(email, password);
        if (result.success && result.user) {
          set({ user: result.user, isAuthenticated: true });
        }
        return result;
      },
      register: async (email, password, name) => {
        return await registerUser(email, password, name);
      },
      logout: async () => {
        await logoutUser();
        set({ user: null, isAuthenticated: false });
      },
      resetPassword: async (email) => {
        return await requestPasswordReset(email);
      },
      // Tasks
      tasks: [],
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updatedTask } : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
      toggleTaskComplete: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  completedAt: !task.completed ? new Date().toISOString() : undefined,
                }
              : task
          ),
        })),

      // Sleep
      sleepRecords: [],
      addSleepRecord: (record) =>
        set((state) => ({ sleepRecords: [...state.sleepRecords, record] })),
      updateSleepRecord: (id, updatedRecord) =>
        set((state) => ({
          sleepRecords: state.sleepRecords.map((record) =>
            record.id === id ? { ...record, ...updatedRecord } : record
          ),
        })),
      deleteSleepRecord: (id) =>
        set((state) => ({
          sleepRecords: state.sleepRecords.filter((record) => record.id !== id),
        })),

      // Pomodoro
      pomodoroSessions: [],
      currentPomodoro: null,
      addPomodoroSession: (session) =>
        set((state) => ({ pomodoroSessions: [...state.pomodoroSessions, session] })),
      updatePomodoroSession: (id, updatedSession) =>
        set((state) => ({
          pomodoroSessions: state.pomodoroSessions.map((session) =>
            session.id === id ? { ...session, ...updatedSession } : session
          ),
        })),
      setCurrentPomodoro: (session) => set({ currentPomodoro: session }),

      // Goals
      goals: [],
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      updateGoal: (id, updatedGoal) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updatedGoal } : goal
          ),
        })),
      deleteGoal: (id) =>
        set((state) => ({ goals: state.goals.filter((goal) => goal.id !== id) })),

      // Habits
      habits: [],
      addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
      updateHabit: (id, updatedHabit) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...updatedHabit } : habit
          ),
        })),
      deleteHabit: (id) =>
        set((state) => ({ habits: state.habits.filter((habit) => habit.id !== id) })),
      toggleHabitCompletion: (id, date) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id === id) {
              const isCompleted = habit.completedDates.includes(date);
              const newCompletedDates = isCompleted
                ? habit.completedDates.filter((d) => d !== date)
                : [...habit.completedDates, date];
              
              // Calculate streak
              const sortedDates = [...newCompletedDates].sort();
              let streak = 0;
              const today = new Date().toISOString().split('T')[0];
              
              if (sortedDates.includes(today)) {
                streak = 1;
                for (let i = sortedDates.length - 2; i >= 0; i--) {
                  const currentDate = new Date(sortedDates[i + 1]);
                  const prevDate = new Date(sortedDates[i]);
                  const diffDays = Math.floor(
                    (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  if (diffDays === 1) {
                    streak++;
                  } else {
                    break;
                  }
                }
              }

              return {
                ...habit,
                completedDates: newCompletedDates,
                streak,
                longestStreak: Math.max(habit.longestStreak, streak),
              };
            }
            return habit;
          }),
        })),

      // Study Sessions
      studySessions: [],
      addStudySession: (session) =>
        set((state) => ({ studySessions: [...state.studySessions, session] })),

      // Notes
      notes: [],
      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      updateNote: (id, updatedNote) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updatedNote, updatedAt: new Date().toISOString() } : note
          ),
        })),
      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
      togglePinNote: (id) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isPinned: !note.isPinned } : note
          ),
        })),

      // Class Schedule
      classSchedules: [],
      addClassSchedule: (schedule) =>
        set((state) => ({ classSchedules: [...state.classSchedules, schedule] })),
      updateClassSchedule: (id, updatedSchedule) =>
        set((state) => ({
          classSchedules: state.classSchedules.map((schedule) =>
            schedule.id === id ? { ...schedule, ...updatedSchedule } : schedule
          ),
        })),
      deleteClassSchedule: (id) =>
        set((state) => ({
          classSchedules: state.classSchedules.filter((schedule) => schedule.id !== id),
        })),

      // Exams
      exams: [],
      addExam: (exam) => set((state) => ({ exams: [...state.exams, exam] })),
      updateExam: (id, updatedExam) =>
        set((state) => ({
          exams: state.exams.map((exam) =>
            exam.id === id ? { ...exam, ...updatedExam } : exam
          ),
        })),
      deleteExam: (id) =>
        set((state) => ({ exams: state.exams.filter((exam) => exam.id !== id) })),

      // Settings
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),

      // UI State
      currentView: 'dashboard',
      setCurrentView: (view) => set({ currentView: view }),
    }),
    {
      name: 'student-productivity-storage',
    }
  )
);
