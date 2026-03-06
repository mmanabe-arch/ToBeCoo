import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Check, Clock, Circle, ArrowRight, Folder } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getCurrentWeekKey, getWeekLabel, prevWeekKey, nextWeekKey } from '../../utils/dateUtils';
import type { Task, TaskStatus } from '../../types';
import PageHeader from '../layout/PageHeader';

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  todo: <Circle size={16} strokeWidth={1.5} className="text-text-muted" />,
  in_progress: <Clock size={16} strokeWidth={1.5} className="text-text-secondary" />,
  done: <Check size={16} strokeWidth={2} className="text-text-primary" />,
  carried_over: <ArrowRight size={16} strokeWidth={1.5} className="text-text-muted" />,
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: '未着手',
  in_progress: '進行中',
  done: '完了',
  carried_over: '持越',
};

export default function TasksPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tasks, projects, addTask, updateTask, updateTaskStatus } = useStore();
  const [weekKey, setWeekKey] = useState(getCurrentWeekKey());
  const [showAddTask, setShowAddTask] = useState(searchParams.get('new') === '1');
  const [showProjects, setShowProjects] = useState(false);

  const activeProjects = projects.filter(p => !p.archived);
  const weekTasks = tasks.filter(t => t.weekKey === weekKey);

  // Group by project
  const tasksByProject = activeProjects.reduce<Record<string, Task[]>>((acc, p) => {
    acc[p.id] = weekTasks.filter(t => t.projectId === p.id);
    return acc;
  }, {});
  const orphanTasks = weekTasks.filter(t => !activeProjects.find(p => p.id === t.projectId));

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
          <p className="text-[10px] text-text-muted">{weekKey}</p>
        </div>
        <button onClick={() => setWeekKey(nextWeekKey(weekKey))} className="p-1">
          <ChevronRight size={20} className="text-text-secondary" />
        </button>
      </div>

      <div className="px-5 py-4 space-y-4 pb-24">
        {/* Add Task */}
        {showAddTask ? (
          <AddTaskForm
            weekKey={weekKey}
            projects={activeProjects}
            onClose={() => setShowAddTask(false)}
          />
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
          if (ptasks.length === 0 && !showProjects) return null;
          return (
            <ProjectTaskGroup
              key={project.id}
              project={project}
              tasks={ptasks}
              onStatusChange={updateTaskStatus}
              onUpdate={updateTask}
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
                onStatusChange={updateTaskStatus}
                onUpdate={updateTask}
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
  onStatusChange,
  onUpdate,
}: {
  project: { id: string; name: string; category: string };
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onUpdate: (id: string, partial: Partial<Task>) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div>
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center justify-between w-full mb-2"
      >
        <div className="flex items-center gap-2">
          <Folder size={12} className="text-text-muted" />
          <span className="text-xs font-medium text-text-secondary">{project.name}</span>
        </div>
        <span className="text-[10px] text-text-muted">
          {doneCount}/{tasks.length}
        </span>
      </button>
      {expanded && tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

function TaskItem({
  task,
  onStatusChange,
  onUpdate,
}: {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onUpdate: (id: string, partial: Partial<Task>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const cycleStatus = () => {
    const order: TaskStatus[] = ['todo', 'in_progress', 'done', 'carried_over'];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    onStatusChange(task.id, next);
  };

  const handleBlur = () => {
    if (title.trim()) onUpdate(task.id, { title: title.trim() });
    setEditing(false);
  };

  return (
    <div className={`flex items-center gap-3 py-2.5 border-b border-border-color last:border-0 ${
      task.status === 'done' ? 'opacity-50' : ''
    }`}>
      <button onClick={cycleStatus} className="flex-shrink-0">
        {STATUS_ICONS[task.status]}
      </button>
      {editing ? (
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={e => e.key === 'Enter' && handleBlur()}
          className="flex-1 text-sm bg-transparent border-b border-text-primary py-0.5"
          autoFocus
        />
      ) : (
        <button
          onDoubleClick={() => setEditing(true)}
          className={`flex-1 text-left text-sm ${
            task.status === 'done' ? 'line-through text-text-muted' : 'text-text-primary'
          }`}
        >
          {task.title}
        </button>
      )}
      <span className="text-[10px] text-text-muted flex-shrink-0">
        {STATUS_LABELS[task.status]}
      </span>
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
  const [projectId, setProjectId] = useState(projects[0]?.id || '');

  const handleSubmit = () => {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      projectId,
      weekKey,
      status: 'todo',
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
      {projects.length > 0 && (
        <select
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          className="w-full text-xs text-text-secondary bg-transparent border border-border-color px-2 py-1.5"
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="flex-1 py-2 bg-text-primary text-white text-xs font-medium disabled:opacity-40"
        >
          追加
        </button>
        <button onClick={onClose} className="flex-1 py-2 border border-border-color text-xs text-text-secondary">
          キャンセル
        </button>
      </div>
    </div>
  );
}
