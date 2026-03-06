import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { getCurrentWeekKey, getWeekLabel } from '../../utils/dateUtils';
import PageHeader from '../layout/PageHeader';

export default function WeeklyReflectionPage() {
  const navigate = useNavigate();
  const { weekKey: paramWeekKey } = useParams();
  const weekKey = paramWeekKey || getCurrentWeekKey();

  const { tasks, weeklyReflections, addWeeklyReflection, updateWeeklyReflection, brainDumps } = useStore();

  const existing = weeklyReflections.find(r => r.weekKey === weekKey);
  const weekTasks = tasks.filter(t => t.weekKey === weekKey);
  const doneTasks = weekTasks.filter(t => t.status === 'done');
  const completionRate = weekTasks.length > 0
    ? Math.round((doneTasks.length / weekTasks.length) * 100)
    : 0;

  const [form, setForm] = useState({
    achievements: existing?.achievements || '',
    failures: existing?.failures || '',
    nextWeekFocus: existing?.nextWeekFocus || '',
    learnings: existing?.learnings || '',
  });
  const [saved, setSaved] = useState(false);
  const [aiResources, setAiResources] = useState<string[]>(existing?.aiSuggestedResources || []);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleSave = () => {
    if (existing) {
      updateWeeklyReflection(existing.id, { ...form, taskCompletionRate: completionRate });
    } else {
      addWeeklyReflection({
        weekKey,
        ...form,
        taskCompletionRate: completionRate,
        aiSuggestedResources: aiResources,
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="週次振り返り" back />

      <div className="px-5 py-4 space-y-6 pb-24">
        {/* Week info */}
        <div className="border border-border-color p-4">
          <p className="text-xs text-text-muted mb-1">{weekKey}</p>
          <p className="text-sm font-medium text-text-primary">{getWeekLabel(weekKey)}</p>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-1 bg-background-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-text-primary rounded-full"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-xs text-text-muted">{doneTasks.length}/{weekTasks.length} ({completionRate}%)</span>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">今週の達成</label>
          <textarea
            value={form.achievements}
            onChange={e => setForm(f => ({ ...f, achievements: e.target.value }))}
            placeholder="今週できたことを振り返る..."
            rows={3}
            className="w-full text-sm bg-transparent border border-border-color p-3 resize-none text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Failures */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">今週の未達成</label>
          <textarea
            value={form.failures}
            onChange={e => setForm(f => ({ ...f, failures: e.target.value }))}
            placeholder="できなかったこと、課題..."
            rows={3}
            className="w-full text-sm bg-transparent border border-border-color p-3 resize-none text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Next week focus */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">来週の重点</label>
          <textarea
            value={form.nextWeekFocus}
            onChange={e => setForm(f => ({ ...f, nextWeekFocus: e.target.value }))}
            placeholder="来週に意識すること..."
            rows={2}
            className="w-full text-sm bg-transparent border border-border-color p-3 resize-none text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Learnings */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">今週の学び</label>
          <textarea
            value={form.learnings}
            onChange={e => setForm(f => ({ ...f, learnings: e.target.value }))}
            placeholder="気づき、学んだこと..."
            rows={3}
            className="w-full text-sm bg-transparent border border-border-color p-3 resize-none text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`w-full py-4 text-sm font-semibold tracking-wide transition-all ${
            saved ? 'bg-background-secondary text-text-primary border border-border-color' : 'bg-text-primary text-white'
          }`}
        >
          {saved ? '保存しました' : '保存する'}
        </button>

        {/* Tasks done this week */}
        {doneTasks.length > 0 && (
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">完了したタスク</p>
            <div className="space-y-1">
              {doneTasks.map(t => (
                <div key={t.id} className="flex items-center gap-2 py-2 border-b border-border-color last:border-0">
                  <span className="w-1 h-1 rounded-full bg-text-primary flex-shrink-0" />
                  <span className="text-sm text-text-secondary">{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
