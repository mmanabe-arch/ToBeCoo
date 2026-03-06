import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserProfile, Vision, Quarter, Project, Task,
  DailyLog, DailyReflection, WeeklyReflection,
  Skill, LearningLog, BrainDump, Routine, AppState, TaskStatus
} from '../types';

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface StoreActions {
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;

  setVision: (vision: Vision) => void;

  addQuarter: (q: Omit<Quarter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuarter: (id: string, partial: Partial<Quarter>) => void;

  addProject: (p: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, partial: Partial<Project>) => void;
  archiveProject: (id: string) => void;

  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, partial: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTaskProgress: (id: string, progress: number) => void;
  deleteTask: (id: string) => void;

  addRoutine: (r: Omit<Routine, 'id' | 'createdAt'>) => void;
  updateRoutine: (id: string, partial: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  reorderRoutines: (ids: string[]) => void;

  getTodayLog: () => DailyLog | undefined;
  upsertDailyLog: (date: string, partial: Partial<DailyLog>) => void;
  toggleRoutineCheck: (date: string, routineId: string) => void;

  addDailyReflection: (r: Omit<DailyReflection, 'id'>) => void;
  updateDailyReflection: (id: string, partial: Partial<DailyReflection>) => void;
  addWeeklyReflection: (r: Omit<WeeklyReflection, 'id' | 'createdAt'>) => void;
  updateWeeklyReflection: (id: string, partial: Partial<WeeklyReflection>) => void;
  getWeeklyReflection: (weekKey: string) => WeeklyReflection | undefined;

  addSkill: (s: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSkill: (id: string, partial: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;

  addLearningLog: (l: Omit<LearningLog, 'id' | 'createdAt'>) => void;
  updateLearningLog: (id: string, partial: Partial<LearningLog>) => void;
  deleteLearningLog: (id: string) => void;

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
      profile: null,
      vision: defaultVision,
      quarters: [],
      projects: [],
      tasks: [],
      routines: [],
      dailyLogs: [],
      dailyReflections: [],
      weeklyReflections: [],
      skills: [],
      learningLogs: [],
      brainDumps: [],

      setProfile: (profile) => set({ profile }),
      updateProfile: (partial) => set((s) => ({
        profile: s.profile ? { ...s.profile, ...partial } : null
      })),

      setVision: (vision) => set({ vision }),

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

      addTask: (t) => set((s) => ({
        tasks: [...s.tasks, {
          ...t,
          id: generateId(),
          progress: t.progress ?? 0,
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
      updateTaskProgress: (id, progress) => set((s) => ({
        tasks: s.tasks.map(t => {
          if (t.id !== id) return t;
          const status: TaskStatus = progress >= 100 ? 'done' : progress > 0 ? 'in_progress' : 'todo';
          return { ...t, progress, status, updatedAt: new Date().toISOString() };
        })
      })),
      deleteTask: (id) => set((s) => ({
        tasks: s.tasks.filter(t => t.id !== id)
      })),

      addRoutine: (r) => set((s) => ({
        routines: [...s.routines, {
          ...r,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }]
      })),
      updateRoutine: (id, partial) => set((s) => ({
        routines: s.routines.map(r => r.id === id ? { ...r, ...partial } : r)
      })),
      deleteRoutine: (id) => set((s) => ({
        routines: s.routines.filter(r => r.id !== id)
      })),
      reorderRoutines: (ids) => set((s) => ({
        routines: ids.map((id, i) => {
          const r = s.routines.find(r => r.id === id)!;
          return { ...r, order: i };
        })
      })),

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
            routineChecks: [],
            ...partial,
          }]
        };
      }),
      toggleRoutineCheck: (date, routineId) => set((s) => {
        const existing = s.dailyLogs.find(l => l.date === date);
        const checks = existing?.routineChecks || [];
        const newChecks = checks.includes(routineId)
          ? checks.filter(id => id !== routineId)
          : [...checks, routineId];
        if (existing) {
          return {
            dailyLogs: s.dailyLogs.map(l =>
              l.date === date ? { ...l, routineChecks: newChecks } : l
            )
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
            routineChecks: newChecks,
          }]
        };
      }),

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
