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
  morningReminderTime: string; // HH:mm
  eveningReminderTime: string; // HH:mm
  weeklyReflectionDay: number; // 0=Sun ... 6=Sat
  weeklyReflectionTime: string; // HH:mm
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
  quarter: 1 | 2 | 3 | 4; // Q1-Q4
  theme: string; // 今四半期の重点テーマ
  achievements: string;
  failures: string;
  nextTheme: string;
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
  archived: boolean;
  createdAt: string;
}

// ==================== Task ====================
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'carried_over';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  weekKey: string; // YYYY-WW
  status: TaskStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Daily Log ====================
export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  todayFocus: string; // 今日意識すること（翌日用）
  morningTasks: string[]; // task IDs selected in morning
  morningCheckedAt?: string;
  eveningCompletedTasks: string[]; // task IDs completed
  eveningNotes: Record<string, string>; // taskId -> note
  eveningReflection: string; // 今日の一言振り返り
  eveningCheckedAt?: string;
}

// ==================== Reflection ====================
export interface DailyReflection {
  id: string;
  date: string; // YYYY-MM-DD
  learnings: string;
  insights: string;
  tomorrowFocus: string;
}

export interface WeeklyReflection {
  id: string;
  weekKey: string; // YYYY-WW
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
  durationMinutes: number;
  cost: number;
  date: string; // YYYY-MM-DD
  learnings: [string, string, string]; // 3つの学び
  action: string; // 1つの実践すること
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
  dailyLogs: DailyLog[];
  dailyReflections: DailyReflection[];
  weeklyReflections: WeeklyReflection[];
  skills: Skill[];
  learningLogs: LearningLog[];
  brainDumps: BrainDump[];
}
