import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getTodayString, getCurrentWeekKey } from '../../utils/dateUtils';

export default function MorningCheckin() {
  const navigate = useNavigate();
  const { tasks, dailyLogs, upsertDailyLog } = useStore();

  const today = getTodayString();
  const weekKey = getCurrentWeekKey();
  const todayLog = dailyLogs.find(l => l.date === today);
  const yesterday = (() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();
  const yesterdayLog = dailyLogs.find(l => l.date === yesterday);

  const weekTasks = tasks.filter(t => t.weekKey === weekKey && t.status !== 'done');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(todayLog?.morningTasks || []);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { addTask, projects } = useStore();

  const toggleTask = (id: string) => {
    setSelectedTaskIds(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  };

  const handleComplete = () => {
    upsertDailyLog(today, {
      morningTasks: selectedTaskIds,
      morningCheckedAt: new Date().toISOString(),
    });
    navigate('/');
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const projectId = projects.find(p => !p.archived)?.id || '';
    addTask({
      title: newTaskTitle.trim(),
      projectId,
      weekKey,
      status: 'in_progress',
      progress: 0,
    });
    setNewTaskTitle('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="px-5 pt-10 pb-6 border-b border-border-color animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Sun size={16} strokeWidth={1.5} className="text-text-secondary" />
          <p className="text-xs text-text-muted uppercase tracking-wide">Morning Check-in</p>
        </div>
        <h2 className="text-2xl font-light text-text-primary animate-slide-up">
          {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'long' })}
        </h2>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto pb-24 stagger-children">
        {/* Yesterday's focus */}
        {yesterdayLog?.todayFocus && (
          <div className="border-l-2 border-text-primary pl-4">
            <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wide">昨日の意識すること</p>
            <p className="text-sm text-text-primary leading-relaxed">{yesterdayLog.todayFocus}</p>
          </div>
        )}

        {/* Select tasks */}
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide mb-3">今日のタスク</p>
          {weekTasks.length === 0 ? (
            <p className="text-sm text-text-muted">今週のタスクはありません</p>
          ) : (
            <div className="space-y-1">
              {weekTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full flex items-center gap-3 p-3 border transition-all text-left ${
                    selectedTaskIds.includes(task.id)
                      ? 'border-text-primary bg-background-secondary'
                      : 'border-border-color'
                  }`}
                >
                  <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 ${
                    selectedTaskIds.includes(task.id)
                      ? 'border-text-primary bg-text-primary'
                      : 'border-border-color'
                  }`}>
                    {selectedTaskIds.includes(task.id) && (
                      <Check size={10} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span className="text-sm text-text-primary">{task.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add new task */}
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide mb-2">タスクを追加</p>
          <div className="flex gap-2">
            <input
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="新しいタスク..."
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
              className="flex-1 text-sm bg-transparent border-b border-border-color py-2 text-text-primary placeholder:text-text-muted"
            />
            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
              className="py-2 px-4 bg-text-primary text-white text-xs disabled:opacity-40"
            >
              追加
            </button>
          </div>
        </div>
      </div>

      {/* Complete button */}
      <div className="px-5 pb-8 pt-4 border-t border-border-color">
        <button
          onClick={handleComplete}
          className="w-full py-4 bg-text-primary text-white text-sm font-semibold tracking-wide"
        >
          チェックイン完了
        </button>
        <button onClick={() => navigate('/')} className="w-full py-3 text-text-muted text-xs mt-2">
          スキップ
        </button>
      </div>
    </div>
  );
}
