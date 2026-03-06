// ==================== User ====================
export interface UserProfile {
  id: string;
  name: string;
  company: string;
  age: number;
  yearsOfService: number;
  role: string;
  otherActivities: string[];
  setupCompleted: boolean;
  morningReminderTime: string;
  eveningReminderTime: string;
  weeklyReflectionDay: number;
  weeklyReflectionTime: string;
  skillReminderInterval: 'monthly' | 'quarterly';
}

// ==================== Vision ====================
export interface Vision {
  threeYears: string;
  tenYears: string;
  updatedAt: string;
}

// ==================== Quarter ====================
export interface Quarter {
  id: string;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  theme: string;
  achievements: string;
  failures: string;
  nextTheme: string;
  slideUrl?: string;
  aiSummary?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Project ====================
export type ProjectCategory = 'work' | 'side' | 'learning' | 'other';

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  description: string;
  goal?: string;
  archived: boolean;
  createdAt: string;
}

// ==================== Task ====================
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'carried_over';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  weekKey: string;
  status: TaskStatus;
  progress: number;
  goal?: string;      // タスクのゴール
  deadline?: string;  // 期限 YYYY-MM-DD
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Routine ====================
export interface Routine {
  id: string;
  name: string;
  emoji: string;
  order: number;
  active: boolean;
  createdAt: string;
}

// ==================== Daily Log ====================
export interface DailyLog {
  id: string;
  date: string;
  todayFocus: string;
  morningTasks: string[];
  morningCheckedAt?: string;
  eveningCompletedTasks: string[];
  eveningNotes: Record<string, string>;
  eveningReflection: string;
  eveningCheckedAt?: string;
  routineChecks: string[];
}

// ==================== Reflection ====================
export interface DailyReflection {
  id: string;
  date: string;
  learnings: string;
  insights: string;
  tomorrowFocus: string;
}

export interface WeeklyReflection {
  id: string;
  weekKey: string;
  achievements: string;
  failures: string;
  nextWeekFocus: string;
  learnings: string;
  taskCompletionRate: number;
  aiSuggestedResources?: string[];
  createdAt: string;
}

// ==================== Skill ====================
export type SkillStatus = 'acquired' | 'learning' | 'wishlist';

export interface Skill {
  id: string;
  name: string;
  category: string;
  status: SkillStatus;
  acquiredAt?: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Learning ====================
export type LearningCategory = 'book' | 'video' | 'podcast' | 'seminar' | 'other';

export interface LearningLog {
  id: string;
  title: string;
  category: LearningCategory;
  content: string;
  learnings: [string, string, string];
  action: string;
  link?: string;
  date: string;
  relatedSkillId?: string;
  createdAt: string;
}

// ==================== Brain Dump ====================
export interface BrainDump {
  id: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ==================== App State ====================
export interface AppState {
  profile: UserProfile | null;
  vision: Vision;
  quarters: Quarter[];
  projects: Project[];
  tasks: Task[];
  routines: Routine[];
  dailyLogs: DailyLog[];
  dailyReflections: DailyReflection[];
  weeklyReflections: WeeklyReflection[];
  skills: Skill[];
  learningLogs: LearningLog[];
  brainDumps: BrainDump[];
}
