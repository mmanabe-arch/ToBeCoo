import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Archive } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { ProjectCategory } from '../../types';
import PageHeader from '../layout/PageHeader';

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  work: '業務',
  side: '副業',
  learning: '学習',
  other: 'その他',
};

export default function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, tasks, updateProject, archiveProject } = useStore();

  const project = projects.find(p => p.id === id);

  const [form, setForm] = useState({
    name: project?.name || '',
    category: project?.category || 'work' as ProjectCategory,
    description: project?.description || '',
    goal: project?.goal || '',
  });
  const [saved, setSaved] = useState(false);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">プロジェクトが見つかりません</p>
      </div>
    );
  }

  const projectTasks = tasks.filter(t => t.projectId === id);
  const doneTasks = projectTasks.filter(t => t.status === 'done');
  const activeTasks = projectTasks.filter(t => t.status !== 'done' && t.status !== 'carried_over');

  const handleSave = () => {
    updateProject(project.id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleArchive = () => {
    archiveProject(project.id);
    navigate('/projects');
  };

  const setF = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="プロジェクト設定" back />

      <div className="px-5 py-4 space-y-5 pb-24">
        {/* Stats */}
        <div className="flex border border-border-color">
          <div className="flex-1 p-3 border-r border-border-color text-center">
            <p className="text-xl font-light text-text-primary">{activeTasks.length}</p>
            <p className="text-[10px] text-text-muted mt-0.5">進行中</p>
          </div>
          <div className="flex-1 p-3 border-r border-border-color text-center">
            <p className="text-xl font-light text-text-primary">{doneTasks.length}</p>
            <p className="text-[10px] text-text-muted mt-0.5">完了</p>
          </div>
          <div className="flex-1 p-3 text-center">
            <p className="text-xl font-light text-text-primary">{projectTasks.length}</p>
            <p className="text-[10px] text-text-muted mt-0.5">合計</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">プロジェクト名</label>
          <input
            value={form.name}
            onChange={e => setF('name', e.target.value)}
            className="w-full text-base bg-transparent border-b-2 border-border-color focus:border-text-primary transition-colors py-2 text-text-primary font-light"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">カテゴリ</label>
          <div className="flex gap-2">
            {(Object.keys(CATEGORY_LABELS) as ProjectCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setF('category', cat)}
                className={`flex-1 py-2 text-xs border transition-colors ${
                  form.category === cat
                    ? 'border-text-primary bg-text-primary text-white'
                    : 'border-border-color text-text-secondary'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">ゴール</label>
          <textarea
            value={form.goal}
            onChange={e => setF('goal', e.target.value)}
            placeholder="このプロジェクトで達成したいこと..."
            rows={3}
            className="w-full text-sm bg-transparent border border-border-color p-3 resize-none text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">説明</label>
          <textarea
            value={form.description}
            onChange={e => setF('description', e.target.value)}
            placeholder="プロジェクトの概要..."
            rows={3}
            className="w-full text-sm bg-transparent border border-border-color p-3 resize-none text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Active tasks list */}
        {activeTasks.length > 0 && (
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">進行中のタスク</p>
            <div className="space-y-1">
              {activeTasks.map(t => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-border-color last:border-0">
                  <span className="text-sm text-text-primary">{t.title}</span>
                  <span className="text-xs text-text-muted">{t.progress ?? 0}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!form.name.trim()}
          className={`w-full py-4 text-sm font-semibold tracking-wide transition-all ${
            saved ? 'bg-background-secondary text-text-primary border border-border-color' : 'bg-text-primary text-white'
          } disabled:opacity-40`}
        >
          {saved ? '保存しました' : '保存する'}
        </button>

        {/* Archive */}
        {!project.archived && (
          <button
            onClick={handleArchive}
            className="w-full flex items-center justify-center gap-2 py-3 border border-border-color text-sm text-text-muted"
          >
            <Archive size={14} />
            アーカイブする
          </button>
        )}
      </div>
    </div>
  );
}
