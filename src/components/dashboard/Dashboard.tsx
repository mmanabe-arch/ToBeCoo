import { useNavigate } from 'react-router-dom';
import { Edit3, ChevronRight, Sun, Moon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getTodayString, getCurrentWeekKey, getCurrentQuarterInfo, getQuarterLabel } from '../../utils/dateUtils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, vision, quarters, tasks, dailyLogs, learningLogs } = useStore();

  const today = getTodayString();
  const weekKey = getCurrentWeekKey();
  const { year, quarter } = getCurrentQuarterInfo();

  const todayLog = dailyLogs.find(l => l.date === today);
  const yesterdayLog = dailyLogs.find(l => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return l.date === d.toISOString().split('T')[0];
  });

  const todayFocus = todayLog?.todayFocus || yesterdayLog?.todayFocus || '';

  // Current quarter record
  const currentQuarter = quarters.find(q => q.year === year && q.quarter === quarter);

  // This week's task stats
  const weekTasks = tasks.filter(t => t.weekKey === weekKey);
  const weekDone = weekTasks.filter(t => t.status === 'done').length;
  const weekRate = weekTasks.length > 0
    ? Math.round((weekDone / weekTasks.length) * 100)
    : 0;

  // This month's learning
  const thisMonth = today.slice(0, 7);
  const monthLearning = learningLogs.filter(l => l.date.startsWith(thisMonth));
  const monthMinutes = monthLearning.reduce((sum, l) => sum + l.durationMinutes, 0);
  const monthCost = monthLearning.reduce((sum, l) => sum + l.cost, 0);

  const morningDone = !!todayLog?.morningCheckedAt;
  const eveningDone = !!todayLog?.eveningCheckedAt;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 border-b border-border-color">
        <p className="text-xs text-text-muted mb-1">
          {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold text-text-primary">{profile?.name}</h1>
          <p className="text-xs text-text-muted">{profile?.company} · {profile?.role}</p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4 pb-24">
        {/* Daily Routine Status */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/routine/morning')}
            className={`flex-1 flex items-center gap-2 p-3 border rounded-none transition-all ${
              morningDone
                ? 'border-text-primary bg-text-primary text-white'
                : 'border-border-color text-text-secondary'
            }`}
          >
            <Sun size={14} strokeWidth={1.5} />
            <span className="text-xs font-medium">{morningDone ? '朝✓' : '朝のチェックイン'}</span>
          </button>
          <button
            onClick={() => navigate('/routine/evening')}
            className={`flex-1 flex items-center gap-2 p-3 border rounded-none transition-all ${
              eveningDone
                ? 'border-text-primary bg-text-primary text-white'
                : 'border-border-color text-text-secondary'
            }`}
          >
            <Moon size={14} strokeWidth={1.5} />
            <span className="text-xs font-medium">{eveningDone ? '夜✓' : '夜のチェックアウト'}</span>
          </button>
        </div>

        {/* Today's Focus */}
        {todayFocus && (
          <div className="border border-text-primary p-4">
            <p className="text-xs text-text-muted mb-2 uppercase tracking-wide">今日意識すること</p>
            <p className="text-sm text-text-primary leading-relaxed">{todayFocus}</p>
          </div>
        )}
        {!todayFocus && (
          <button
            onClick={() => navigate('/routine/morning')}
            className="w-full border border-dashed border-border-color p-4 text-left"
          >
            <p className="text-xs text-text-muted mb-1 uppercase tracking-wide">今日意識すること</p>
            <p className="text-xs text-text-muted">朝のチェックインで設定</p>
          </button>
        )}

        {/* Vision */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted uppercase tracking-wide">Vision</p>
            <button onClick={() => navigate('/vision')} className="p-1">
              <Edit3 size={14} className="text-text-muted" />
            </button>
          </div>
          <div className="space-y-2">
            <div className="border-l-2 border-text-primary pl-3">
              <p className="text-[10px] text-text-muted mb-0.5">3年後</p>
              <p className="text-sm text-text-primary font-serif leading-relaxed">
                {vision.threeYears || <span className="text-text-muted">未設定</span>}
              </p>
            </div>
            <div className="border-l-2 border-border-color pl-3">
              <p className="text-[10px] text-text-muted mb-0.5">10年後</p>
              <p className="text-sm text-text-primary font-serif leading-relaxed">
                {vision.tenYears || <span className="text-text-muted">未設定</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Current Quarter Theme */}
        <button
          onClick={() => navigate('/quarter')}
          className="w-full border border-border-color p-4 text-left hover:border-text-secondary transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-muted uppercase tracking-wide">{getQuarterLabel(year, quarter)}</p>
            <ChevronRight size={14} className="text-text-muted" />
          </div>
          <p className="text-sm text-text-primary">
            {currentQuarter?.theme || <span className="text-text-muted">今四半期の重点テーマを設定</span>}
          </p>
        </button>

        {/* This Week's Task Rate */}
        <div className="border border-border-color p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-text-muted uppercase tracking-wide">今週のタスク達成率</p>
            <button onClick={() => navigate('/tasks')} className="text-xs text-text-muted">
              詳細 →
            </button>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-light text-text-primary">{weekRate}<span className="text-base">%</span></span>
            <span className="text-xs text-text-muted mb-1">{weekDone} / {weekTasks.length} タスク</span>
          </div>
          <div className="mt-3 h-1 bg-background-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-text-primary transition-all rounded-full"
              style={{ width: `${weekRate}%` }}
            />
          </div>
        </div>

        {/* Learning Stats */}
        <div className="border border-border-color p-4">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-3">今月の学習</p>
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-light text-text-primary">
                {Math.floor(monthMinutes / 60)}
                <span className="text-sm">h</span>
                {monthMinutes % 60 > 0 && (
                  <span>{monthMinutes % 60}<span className="text-sm">m</span></span>
                )}
              </p>
              <p className="text-[10px] text-text-muted mt-1">学習時間</p>
            </div>
            <div className="w-px bg-border-color" />
            <div>
              <p className="text-2xl font-light text-text-primary">
                ¥{monthCost.toLocaleString()}
              </p>
              <p className="text-[10px] text-text-muted mt-1">投資額</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <p className="text-xs text-text-muted uppercase tracking-wide">クイックアクション</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/tasks?new=1')}
              className="border border-border-color p-3 text-left text-sm text-text-secondary hover:border-text-secondary transition-colors"
            >
              + タスクを追加
            </button>
            <button
              onClick={() => navigate('/memo?new=1')}
              className="border border-border-color p-3 text-left text-sm text-text-secondary hover:border-text-secondary transition-colors"
            >
              + メモを書く
            </button>
            <button
              onClick={() => navigate('/reflection/weekly')}
              className="border border-border-color p-3 text-left text-sm text-text-secondary hover:border-text-secondary transition-colors"
            >
              週次振り返り
            </button>
            <button
              onClick={() => navigate('/learning?new=1')}
              className="border border-border-color p-3 text-left text-sm text-text-secondary hover:border-text-secondary transition-colors"
            >
              + 学習を記録
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
