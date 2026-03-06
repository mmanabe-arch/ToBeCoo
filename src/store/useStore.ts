import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserProfile, Vision, Quarter, Project, Task,
  DailyLog, DailyReflection, WeeklyReflection,
  Skill, LearningLog, BrainDump, AppState, TaskStatus
} from '../types';

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface StoreActions {
  // Profile
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;

  // Vision
  setVision: (vision: Vision) => void;

  // Quarters
  addQuarter: (q: Omit<Quarter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuarter: (id: string, partial: Partial<Quarter>) => void;

  // Projects
  addProject: (p: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, partial: Partial<Project>) => void;
  archiveProject: (id: string) => void;

  // Tasks
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, partial: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;

  // Daily Logs
  getTodayLog: () => DailyLog | undefined;
  upsertDailyLog: (date: string, partial: Partial<DailyLog>) => void;

  // Reflections
  addDailyReflection: (r: Omit<DailyReflection, 'id'>) => void;
  updateDailyReflection: (id: string, partial: Partial<DailyReflection>) => void;
  addWeeklyReflection: (r: Omit<WeeklyReflection, 'id' | 'createdAt'>) => void;
  updateWeeklyReflection: (id: string, partial: Partial<WeeklyReflection>) => void;
  getWeeklyReflection: (weekKey: string) => WeeklyReflection | undefined;

  // Skills
  addSkill: (s: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSkill: (id: string, partial: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;

  // Learning Logs
  addLearningLog: (l: Omit<LearningLog, 'id' | 'createdAt'>) => void;
  updateLearningLog: (id: string, partial: Partial<LearningLog>) => void;
  deleteLearningLog: (id: string) => void;

  // Brain Dumps
  addBrainDump: (b: Omit<BrainDump, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBrainDump: (id: string, partial: Partial<BrainDump>) => void;
  deleteBrainDump: (id: string) => void;
}

const defaultVision: Vision = {
  threeYears: '',
  tenYears: '',
  updatedAt: new Date().toISOString(),
};

export const useStore = create<AppState & StoreActions>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      vision: defaultVision,
      quarters: [],
      projects: [],
      tasks: [],
      dailyLogs: [],
      dailyReflections: [],
      weeklyReflections: [],
      skills: [],
      learningLogs: [],
      brainDumps: [],

      // Profile
      setProfile: (profile) => set({ profile }),
      updateProfile: (partial) => set((s) => ({
        profile: s.profile ? { ...s.profile, ...partial } : null
      })),

      // Vision
      setVision: (vision) => set({ vision }),

      // Quarters
      addQuarter: (q) => set((s) => ({
        quarters: [...s.quarters, {
          ...q,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }]
      })),
      updateQuarter: (id, partial) => set((s) => ({
        quarters: s.quarters.map(q => q.id === id
          ? { ...q, ...partial, updatedAt: new Date().toISOString() }
          : q
        )
      })),

      // Projects
      addProject: (p) => set((s) => ({
        projects: [...s.projects, {
          ...p,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }]
      })),
      updateProject: (id, partial) => set((s) => ({
        projects: s.projects.map(p => p.id === id ? { ...p, ...partial } : p)
      })),
      archiveProject: (id) => set((s) => ({
        projects: s.projects.map(p => p.id === id ? { ...p, archived: true } : p)
      })),

      // Tasks
      addTask: (t) => set((s) => ({
        tasks: [...s.tasks, {
          ...t,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }]
      })),
      updateTask: (id, partial) => set((s) => ({
        tasks: s.tasks.map(t => t.id === id
          ? { ...t, ...partial, updatedAt: new Date().toISOString() }
          : t
        )
      })),
      updateTaskStatus: (id, status) => set((s) => ({
        tasks: s.tasks.map(t => t.id === id
          ? { ...t, status, updatedAt: new Date().toISOString() }
          : t
        )
      })),
      deleteTask: (id) => set((s) => ({
        tasks: s.tasks.filter(t => t.id !== id)
      })),

      // Daily Logs
      getTodayLog: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().dailyLogs.find(l => l.date === today);
      },
      upsertDailyLog: (date, partial) => set((s) => {
        const existing = s.dailyLogs.find(l => l.date === date);
        if (existing) {
          return {
            dailyLogs: s.dailyLogs.map(l => l.date === date ? { ...l, ...partial } : l)
          };
        }
        return {
          dailyLogs: [...s.dailyLogs, {
            id: generateId(),
            date,
            todayFocus: '',
            morningTasks: [],
            eveningCompletedTasks: [],
            eveningNotes: {},
            eveningReflection: '',
            ...partial,
          }]
        };
      }),

      // Reflections
      addDailyReflection: (r) => set((s) => ({
        dailyReflections: [...s.dailyReflections, { ...r, id: generateId() }]
      })),
      updateDailyReflection: (id, partial) => set((s) => ({
        dailyReflections: s.dailyReflections.map(r => r.id === id ? { ...r, ...partial } : r)
      })),
      addWeeklyReflection: (r) => set((s) => ({
        weeklyReflections: [...s.weeklyReflections, {
          ...r,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }]
      })),
      updateWeeklyReflection: (id, partial) => set((s) => ({
        weeklyReflections: s.weeklyReflections.map(r => r.id === id ? { ...r, ...partial } : r)
      })),
      getWeeklyReflection: (weekKey) => get().weeklyReflections.find(r => r.weekKey === weekKey),

      // Skills
      addSkill: (s_) => set((s) => ({
        skills: [...s.skills, {
          ...s_,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }]
      })),
      updateSkill: (id, partial) => set((s) => ({
        skills: s.skills.map(sk => sk.id === id
          ? { ...sk, ...partial, updatedAt: new Date().toISOString() }
          : sk
        )
      })),
      deleteSkill: (id) => set((s) => ({
        skills: s.skills.filter(sk => sk.id !== id)
      })),

      // Learning Logs
      addLearningLog: (l) => set((s) => ({
        learningLogs: [...s.learningLogs, {
          ...l,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }]
      })),
      updateLearningLog: (id, partial) => set((s) => ({
        learningLogs: s.learningLogs.map(l => l.id === id ? { ...l, ...partial } : l)
      })),
      deleteLearningLog: (id) => set((s) => ({
        learningLogs: s.learningLogs.filter(l => l.id !== id)
      })),

      // Brain Dumps
      addBrainDump: (b) => set((s) => ({
        brainDumps: [...s.brainDumps, {
          ...b,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }]
      })),
      updateBrainDump: (id, partial) => set((s) => ({
        brainDumps: s.brainDumps.map(b => b.id === id
          ? { ...b, ...partial, updatedAt: new Date().toISOString() }
          : b
        )
      })),
      deleteBrainDump: (id) => set((s) => ({
        brainDumps: s.brainDumps.filter(b => b.id !== id)
      })),
    }),
    {
      name: 'personal-os-storage',
    }
  )
);
