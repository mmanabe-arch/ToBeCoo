import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getTodayString } from '../../utils/dateUtils';

export default function EveningCheckout() {
  const navigate = useNavigate();
  const { tasks, dailyLogs, upsertDailyLog, updateTaskStatus } = useStore();

  const today = getTodayString();
  const todayLog = dailyLogs.find(l => l.date === today);
  const morningTaskIds = todayLog?.morningTasks || [];
  const morningTasks = tasks.filter(t => morningTaskIds.includes(t.id));

  const [completedIds, setCompletedIds] = useState<string[]>(
    todayLog?.eveningCompletedTasks || morningTasks.filter(t => t.status === 'done').map(t => t.id)
  );
  const [notes, setNotes] = useState<Record<string, string>>(todayLog?.eveningNotes || {});
  const [todayFocus, setTodayFocus] = useState(todayLog?.todayFocus || '');
  const [reflection, setReflection] = useState(todayLog?.eveningReflection || '');

  const toggleComplete = (id: string) => {
    setCompletedIds(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  };

  const handleComplete = () => {
    // Update task statuses
    morningTasks.forEach(task => {
      if (completedIds.includes(task.id)) {
        updateTaskStatus(task.id, 'done');
      }
    });

    upsertDailyLog(today, {
      eveningCompletedTasks: completedIds,
      eveningNotes: notes,
      todayFocus,
      eveningReflection: reflection,
      eveningCheckedAt: new Date().toISOString(),
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="px-5 pt-10 pb-6 border-b border-border-color animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Moon size={16} strokeWidth={1.5} className="text-text-secondary" />
          <p className="text-xs text-text-muted uppercase tracking-wide">Evening Check-out</p>
        </div>
        <h2 className="text-2xl font-light text-text-primary animate-slide-up">お疲れ様でした</h2>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto pb-24 stagger-children">
        {/* Task completion */}
        {morningTasks.length > 0 && (
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide mb-3">タスクの完了確認</p>
            <div className="space-y-2">
              {morningTasks.map(task => {
                const isDone = completedIds.includes(task.id);
                return (
                  <div key={task.id} className="border border-border-color">
                    <button
                      onClick={() => toggleComplete(task.id)}
                      className="w-full flex items-center gap-3 p-3 text-left"
                    >
                      <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isDone ? 'border-text-primary bg-text-primary' : 'border-border-color'
                      }`}>
                        {isDone && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-sm flex-1 ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                        {task.title}
                      </span>
                    </button>
                    {!isDone && (
                      <div className="px-3 pb-3">
                        <input
                          value={notes[task.id] || ''}
                          onChange={e => setNotes(n => ({ ...n, [task.id]: e.target.value }))}
                          placeholder="一言メモ（任意）"
                          className="w-full text-xs bg-background-secondary border border-border-color px-3 py-2 text-text-secondary placeholder:text-text-muted"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tomorrow's focus */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">
            明日意識すること
          </label>
          <textarea
            value={todayFocus}
            onChange={e => setTodayFocus(e.target.value)}
            placeholder="明日大切にしたいこと..."
            rows={2}
            className="w-full text-sm bg-transparent border border-border-color p-3 resize-none text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Today's reflection */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">
            今日の一言振り返り（任意）
          </label>
          <textarea
            value={reflection}
            onChange={e => setReflection(e.target.value)}
            placeholder="今日をひと言で..."
            rows={2}
            className="w-full text-sm bg-transparent border border-border-color p-3 resize-none text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Complete button */}
      <div className="px-5 pb-8 pt-4 border-t border-border-color">
        <button
          onClick={handleComplete}
          className="w-full py-4 bg-text-primary text-white text-sm font-semibold tracking-wide"
        >
          チェックアウト完了
        </button>
        <button onClick={() => navigate('/')} className="w-full py-3 text-text-muted text-xs mt-2">
          スキップ
        </button>
      </div>
    </div>
  );
}
