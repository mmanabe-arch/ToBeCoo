import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Folder } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getCurrentWeekKey, getWeekLabel, prevWeekKey, nextWeekKey } from '../../utils/dateUtils';
import type { Task } from '../../types';
import PageHeader from '../layout/PageHeader';

const PROGRESS_STEPS = [5, 10, 30, 50, 100];

export default function TasksPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tasks, projects, addTask, updateTask, updateTaskProgress, deleteTask } = useStore();
  const [weekKey, setWeekKey] = useState(getCurrentWeekKey());
  const [showAddTask, setShowAddTask] = useState(searchParams.get('new') === '1');

  const activeProjects = projects.filter(p => !p.archived);
  const weekTasks = tasks.filter(t => t.weekKey === weekKey);

  const tasksByProject = activeProjects.reduce<Record<string, Task[]>>((acc, p) => {
    acc[p.id] = weekTasks.filter(t => t.projectId === p.id);
    return acc;
  }, {});
  const orphanTasks = weekTasks.filter(t => !activeProjects.find(p => p.id === t.projectId));

  const weekDone = weekTasks.filter(t => t.status === 'done').length;
  const weekRate = weekTasks.length > 0 ? Math.round((weekDone / weekTasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="タスク"
        right={
          <button onClick={() => navigate('/projects')} className="p-2">
            <Folder size={18} className="text-text-secondary" />
          </button>
        }
      />

      {/* Week Navigation */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-color">
        <button onClick={() => setWeekKey(prevWeekKey(weekKey))} className="p-1">
          <ChevronLeft size={20} className="text-text-secondary" />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium text-text-primary">{getWeekLabel(weekKey)}</p>
          <p className="text-[10px] text-text-muted">{weekRate}% 達成</p>
        </div>
        <button onClick={() => setWeekKey(nextWeekKey(weekKey))} className="p-1">
          <ChevronRight size={20} className="text-text-secondary" />
        </button>
      </div>

      <div className="px-5 py-4 space-y-4 pb-24">
        {/* Add Task */}
        {showAddTask ? (
          <AddTaskForm weekKey={weekKey} projects={activeProjects} onClose={() => setShowAddTask(false)} />
        ) : (
          <button
            onClick={() => setShowAddTask(true)}
            className="w-full flex items-center gap-2 p-3 border border-dashed border-border-color text-text-muted text-sm hover:border-text-secondary transition-colors"
          >
            <Plus size={16} />
            タスクを追加
          </button>
        )}

        {/* Tasks by project */}
        {activeProjects.map(project => {
          const ptasks = tasksByProject[project.id] || [];
          if (ptasks.length === 0) return null;
          return (
            <ProjectTaskGroup
              key={project.id}
              project={project}
              tasks={ptasks}
              onProgressChange={updateTaskProgress}
              onUpdate={updateTask}
              onDelete={deleteTask}
            />
          );
        })}

        {orphanTasks.length > 0 && (
          <div>
            <p className="text-xs text-text-muted mb-2">プロジェクト未設定</p>
            {orphanTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onProgressChange={updateTaskProgress}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}

        {weekTasks.length === 0 && !showAddTask && (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">この週のタスクはありません</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectTaskGroup({
  project,
  tasks,
  onProgressChange,
  onUpdate,
  onDelete,
}: {
  project: { id: string; name: string; category: string };
  tasks: Task[];
  onProgressChange: (id: string, p: number) => void;
  onUpdate: (id: string, partial: Partial<Task>) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const avgProgress = tasks.length > 0
    ? Math.round(tasks.reduce((sum, t) => sum + (t.progress ?? 0), 0) / tasks.length)
    : 0;

  return (
    <div>
      <button onClick={() => setExpanded(e => !e)} className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-2">
          <Folder size={12} className="text-text-muted" />
          <span className="text-xs font-medium text-text-secondary">{project.name}</span>
        </div>
        <span className="text-[10px] text-text-muted">{doneCount}/{tasks.length} · {avgProgress}%</span>
      </button>
      {expanded && tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onProgressChange={onProgressChange}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function TaskItem({
  task,
  onProgressChange,
  onUpdate,
  onDelete,
}: {
  task: Task;
  onProgressChange: (id: string, p: number) => void;
  onUpdate: (id: string, partial: Partial<Task>) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const progress = task.progress ?? 0;
  const isDone = task.status === 'done';

  const handleBlur = () => {
    if (title.trim()) onUpdate(task.id, { title: title.trim() });
    setEditing(false);
  };

  return (
    <div className={`border-b border-border-color last:border-0 ${isDone ? 'opacity-50' : ''}`}>
      {/* Main row */}
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center gap-3 py-2.5 text-left">
        {/* Progress ring indicator */}
        <div className="flex-shrink-0 w-8 h-8 relative">
          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="none" stroke="#E0E0E0" strokeWidth="2.5" />
            <circle
              cx="16" cy="16" r="12" fill="none"
              stroke="#0A0A0A" strokeWidth="2.5"
              strokeDasharray={`${(progress / 100) * 75.4} 75.4`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-medium text-text-primary">
            {progress}%
          </span>
        </div>

        {editing ? (
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={e => e.key === 'Enter' && handleBlur()}
            className="flex-1 text-sm bg-transparent border-b border-text-primary py-0.5"
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span
            onDoubleClick={e => { e.stopPropagation(); setEditing(true); }}
            className={`flex-1 text-sm ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}
          >
            {task.title}
          </span>
        )}
      </button>

      {/* Progress controls (expanded) */}
      {expanded && (
        <div className="pb-3 space-y-2">
          {/* Goal & Deadline */}
          {(task.goal || task.deadline) && (
            <div className="space-y-1 pb-1">
              {task.goal && (
                <p className="text-xs text-text-secondary leading-relaxed">
                  <span className="text-[10px] text-text-muted uppercase tracking-wide mr-1">ゴール</span>
                  {task.goal}
                </p>
              )}
              {task.deadline && (
                <p className={`text-xs ${new Date(task.deadline) < new Date() && !isDone ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
                  <span className="text-[10px] uppercase tracking-wide mr-1">期限</span>
                  {new Date(task.deadline).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {new Date(task.deadline) < new Date() && !isDone && ' ⚠ 期限超過'}
                </p>
              )}
            </div>
          )}
          {!isDone && (
            <>
              <div className="h-0.5 bg-background-secondary rounded-full overflow-hidden">
                <div className="h-full bg-text-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex gap-1">
                {PROGRESS_STEPS.map(step => (
                  <button
                    key={step}
                    onClick={() => onProgressChange(task.id, step)}
                    className={`flex-1 py-2 text-[10px] border font-medium transition-colors ${
                      progress >= step
                        ? 'border-text-primary bg-text-primary text-white'
                        : 'border-border-color text-text-muted'
                    }`}
                  >
                    {step}%
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="flex gap-3 pt-1">
            {isDone && (
              <button onClick={() => onProgressChange(task.id, 0)} className="text-xs text-text-muted border border-border-color px-3 py-1">
                未完了に戻す
              </button>
            )}
            <button onClick={() => onDelete(task.id)} className="text-xs text-text-muted">削除</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddTaskForm({
  weekKey,
  projects,
  onClose,
}: {
  weekKey: string;
  projects: { id: string; name: string }[];
  onClose: () => void;
}) {
  const addTask = useStore(s => s.addTask);
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');

  const handleSubmit = () => {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      projectId,
      weekKey,
      status: 'todo',
      progress: 0,
      goal: goal.trim() || undefined,
      deadline: deadline || undefined,
    });
    setTitle('');
    onClose();
  };

  return (
    <div className="border border-text-primary p-4 space-y-3">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="タスクを入力..."
        className="w-full text-sm bg-transparent border-b border-border-color pb-2 text-text-primary placeholder:text-text-muted"
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        autoFocus
      />
      <input
        value={goal}
        onChange={e => setGoal(e.target.value)}
        placeholder="ゴール（任意）"
        className="w-full text-xs bg-transparent border-b border-border-color pb-2 text-text-primary placeholder:text-text-muted"
      />
      <div className="flex items-center gap-2">
        <label className="text-[10px] text-text-muted uppercase tracking-wide flex-shrink-0">期限</label>
        <input
          type="date"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          className="flex-1 text-xs bg-transparent border border-border-color px-2 py-1.5 text-text-secondary"
        />
      </div>
      {projects.length > 0 && (
        <select
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          className="w-full text-xs text-text-secondary bg-transparent border border-border-color px-2 py-1.5"
        >
          <option value="">プロジェクト未設定</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      )}
      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={!title.trim()} className="flex-1 py-2 bg-text-primary text-white text-xs font-medium disabled:opacity-40">追加</button>
        <button onClick={onClose} className="flex-1 py-2 border border-border-color text-xs text-text-secondary">キャンセル</button>
      </div>
    </div>
  );
}
