import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, ChevronRight, Sun, Moon, Settings } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getTodayString, getCurrentWeekKey, getCurrentQuarterInfo, getQuarterLabel } from '../../utils/dateUtils';
import type { Routine } from '../../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    profile, vision, quarters, tasks, dailyLogs, learningLogs,
    routines, projects, toggleRoutineCheck,
  } = useStore();

  const today = getTodayString();
  const weekKey = getCurrentWeekKey();
  const { year, quarter } = getCurrentQuarterInfo();

  const todayLog = dailyLogs.find(l => l.date === today);
  const yesterdayLog = (() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return dailyLogs.find(l => l.date === d.toISOString().split('T')[0]);
  })();

  const todayFocus = todayLog?.todayFocus || yesterdayLog?.todayFocus || '';
  const currentQuarter = quarters.find(q => q.year === year && q.quarter === quarter);

  // Week task stats
  const weekTasks = tasks.filter(t => t.weekKey === weekKey);
  const weekDone = weekTasks.filter(t => t.status === 'done').length;
  const weekRate = weekTasks.length > 0 ? Math.round((weekDone / weekTasks.length) * 100) : 0;

  // In-progress tasks (not done, has some progress or in_progress status)
  const activeTasks = weekTasks.filter(t => t.status !== 'done' && t.status !== 'carried_over');

  // Routine checks today
  const todayChecks = todayLog?.routineChecks || [];
  const activeRoutines = [...routines]
    .filter(r => r.active)
    .sort((a, b) => a.order - b.order);

  // Active projects
  const activeProjects = projects.filter(p => !p.archived);

  // Latest learning
  const latestLearning = [...learningLogs].sort((a, b) => b.date.localeCompare(a.date))[0];

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

      <div className="px-5 py-4 space-y-5 pb-24">
        {/* Check-in / Check-out */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/routine/morning')}
            className={`flex-1 flex items-center gap-2 p-3 border transition-all ${
              morningDone ? 'border-text-primary bg-text-primary text-white' : 'border-border-color text-text-secondary'
            }`}
          >
            <Sun size={14} strokeWidth={1.5} />
            <span className="text-xs font-medium">{morningDone ? '朝 ✓' : '朝のチェックイン'}</span>
          </button>
          <button
            onClick={() => navigate('/routine/evening')}
            className={`flex-1 flex items-center gap-2 p-3 border transition-all ${
              eveningDone ? 'border-text-primary bg-text-primary text-white' : 'border-border-color text-text-secondary'
            }`}
          >
            <Moon size={14} strokeWidth={1.5} />
            <span className="text-xs font-medium">{eveningDone ? '夜 ✓' : '夜のチェックアウト'}</span>
          </button>
        </div>

        {/* Daily Routines */}
        <RoutinesSection
          routines={activeRoutines}
          checkedIds={todayChecks}
          onToggle={(id) => toggleRoutineCheck(today, id)}
          onManage={() => navigate('/routines')}
        />

        {/* Today's Focus */}
        {todayFocus ? (
          <div className="border border-text-primary p-4">
            <p className="text-xs text-text-muted mb-2 uppercase tracking-wide">今日意識すること</p>
            <p className="text-sm text-text-primary leading-relaxed">{todayFocus}</p>
          </div>
        ) : (
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
            <div className="border-l-2 border-border-color pl-3">
              <p className="text-[10px] text-text-muted mb-0.5">10年後</p>
              <p className="text-sm text-text-primary font-serif leading-relaxed">
                {vision.tenYears || <span className="text-text-muted">未設定</span>}
              </p>
            </div>
            <div className="border-l-2 border-text-primary pl-3">
              <p className="text-[10px] text-text-muted mb-0.5">3年後</p>
              <p className="text-sm text-text-primary font-serif leading-relaxed">
                {vision.threeYears || <span className="text-text-muted">未設定</span>}
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

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted uppercase tracking-wide">進行中のプロジェクト</p>
              <button onClick={() => navigate('/projects')} className="text-xs text-text-muted">すべて →</button>
            </div>
            <div className="space-y-1.5">
              {activeProjects.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="w-full flex items-center justify-between py-2 border-b border-border-color last:border-0 text-left"
                >
                  <span className="text-sm text-text-primary">{p.name}</span>
                  <ChevronRight size={14} className="text-text-muted flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* This Week's Task Rate + Active Tasks */}
        <div className="border border-border-color p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted uppercase tracking-wide">今週のタスク達成率</p>
            <button onClick={() => navigate('/tasks')} className="text-xs text-text-muted">詳細 →</button>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-light text-text-primary">
              {weekRate}<span className="text-base">%</span>
            </span>
            <span className="text-xs text-text-muted mb-1">{weekDone} / {weekTasks.length} タスク</span>
          </div>
          <div className="h-1 bg-background-secondary rounded-full overflow-hidden">
            <div className="h-full bg-text-primary transition-all rounded-full" style={{ width: `${weekRate}%` }} />
          </div>

          {/* Active tasks with progress (display only) */}
          {activeTasks.length > 0 && (
            <div className="pt-2 border-t border-border-color space-y-2">
              {activeTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => navigate('/tasks')}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-text-primary flex-1 mr-2 line-clamp-1">{task.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.deadline && (
                        <span className={`text-[10px] ${
                          new Date(task.deadline) < new Date() ? 'text-text-primary font-medium' : 'text-text-muted'
                        }`}>
                          {new Date(task.deadline).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                        </span>
                      )}
                      <span className="text-xs font-medium text-text-secondary">{task.progress ?? 0}%</span>
                    </div>
                  </div>
                  <div className="h-0.5 bg-background-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-text-primary rounded-full transition-all"
                      style={{ width: `${task.progress ?? 0}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Latest Learning */}
        {latestLearning && (
          <button
            onClick={() => navigate('/skills')}
            className="w-full border border-border-color p-4 text-left hover:border-text-secondary transition-colors"
          >
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">直近の学習</p>
            <p className="text-sm font-medium text-text-primary mb-2">{latestLearning.title}</p>
            {latestLearning.learnings.filter(Boolean).slice(0, 1).map((l, i) => (
              <p key={i} className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                → {l}
              </p>
            ))}
          </button>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => navigate('/tasks?new=1')} className="border border-border-color p-3 text-left text-sm text-text-secondary hover:border-text-secondary transition-colors">
            + タスクを追加
          </button>
          <button onClick={() => navigate('/memo?new=1')} className="border border-border-color p-3 text-left text-sm text-text-secondary hover:border-text-secondary transition-colors">
            + メモを書く
          </button>
          <button onClick={() => navigate('/reflection/weekly')} className="border border-border-color p-3 text-left text-sm text-text-secondary hover:border-text-secondary transition-colors">
            週次振り返り
          </button>
          <button onClick={() => navigate('/skills')} className="border border-border-color p-3 text-left text-sm text-text-secondary hover:border-text-secondary transition-colors">
            + 学習を記録
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== Routines Section ====================
function RoutinesSection({
  routines,
  checkedIds,
  onToggle,
  onManage,
}: {
  routines: Routine[];
  checkedIds: string[];
  onToggle: (id: string) => void;
  onManage: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-text-muted uppercase tracking-wide">デイリールーティン</p>
        <button onClick={onManage} className="p-1">
          <Settings size={14} className="text-text-muted" />
        </button>
      </div>
      {routines.length === 0 ? (
        <button
          onClick={onManage}
          className="w-full border border-dashed border-border-color p-3 text-center text-xs text-text-muted"
        >
          ルーティンを追加する
        </button>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {routines.map(routine => {
            const checked = checkedIds.includes(routine.id);
            return (
              <button
                key={routine.id}
                onClick={() => onToggle(routine.id)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg transition-all ${
                  checked
                    ? 'border-text-primary bg-text-primary opacity-40'
                    : 'border-border-color bg-background'
                }`}>
                  <span>{routine.emoji || '○'}</span>
                </div>
                <p className={`text-[10px] text-center max-w-[52px] leading-tight transition-all ${
                  checked ? 'text-text-muted line-through' : 'text-text-secondary'
                }`}>
                  {routine.name}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
