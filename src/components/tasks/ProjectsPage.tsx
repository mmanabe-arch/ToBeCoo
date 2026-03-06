import { useState } from 'react';
import { Archive, Plus, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Project, ProjectCategory } from '../../types';
import PageHeader from '../layout/PageHeader';

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  work: '業務',
  side: '副業',
  learning: '学習',
  other: 'その他',
};

export default function ProjectsPage() {
  const { projects, addProject, updateProject, archiveProject } = useStore();
  const [showArchived, setShowArchived] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const active = projects.filter(p => !p.archived);
  const archived = projects.filter(p => p.archived);
  const visible = showArchived ? archived : active;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="プロジェクト"
        back
        right={
          <button onClick={() => setShowAdd(s => !s)} className="p-2">
            <Plus size={18} className="text-text-secondary" />
          </button>
        }
      />

      {/* Toggle */}
      <div className="flex border-b border-border-color">
        <button
          onClick={() => setShowArchived(false)}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            !showArchived ? 'text-text-primary border-b-2 border-text-primary' : 'text-text-muted'
          }`}
        >
          アクティブ ({active.length})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            showArchived ? 'text-text-primary border-b-2 border-text-primary' : 'text-text-muted'
          }`}
        >
          アーカイブ ({archived.length})
        </button>
      </div>

      <div className="px-5 py-4 space-y-3 pb-24">
        {showAdd && (
          <AddProjectForm onClose={() => setShowAdd(false)} />
        )}

        {visible.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onArchive={() => archiveProject(project.id)}
            onUnarchive={() => updateProject(project.id, { archived: false })}
          />
        ))}

        {visible.length === 0 && !showAdd && (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">
              {showArchived ? 'アーカイブされたプロジェクトはありません' : 'プロジェクトを作成してください'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onArchive,
  onUnarchive,
}: {
  project: Project;
  onArchive: () => void;
  onUnarchive: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border-color">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-text-muted border border-border-color px-1.5 py-0.5">
              {CATEGORY_LABELS[project.category]}
            </span>
          </div>
          <p className="text-sm font-medium text-text-primary">{project.name}</p>
        </div>
        <ChevronRight size={16} className={`text-text-muted transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border-color">
          {project.description && (
            <p className="text-xs text-text-secondary mt-3 mb-4 leading-relaxed">{project.description}</p>
          )}
          <div className="flex gap-2">
            {project.archived ? (
              <button
                onClick={onUnarchive}
                className="flex-1 py-2 border border-border-color text-xs text-text-secondary"
              >
                アーカイブ解除
              </button>
            ) : (
              <button
                onClick={onArchive}
                className="flex items-center gap-1 py-2 px-3 border border-border-color text-xs text-text-secondary"
              >
                <Archive size={12} />
                アーカイブ
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddProjectForm({ onClose }: { onClose: () => void }) {
  const addProject = useStore(s => s.addProject);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('work');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    addProject({ name: name.trim(), category, description, archived: false });
    onClose();
  };

  return (
    <div className="border border-text-primary p-4 space-y-3">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">新規プロジェクト</p>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="プロジェクト名"
        className="w-full text-sm bg-transparent border-b border-border-color pb-2 focus:border-text-primary transition-colors text-text-primary placeholder:text-text-muted"
        autoFocus
      />
      <select
        value={category}
        onChange={e => setCategory(e.target.value as ProjectCategory)}
        className="w-full text-xs text-text-secondary bg-transparent border border-border-color px-2 py-2"
      >
        {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="説明（任意）"
        rows={2}
        className="w-full text-xs bg-transparent border border-border-color p-2 resize-none text-text-primary placeholder:text-text-muted"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex-1 py-2 bg-text-primary text-white text-xs font-medium disabled:opacity-40"
        >
          作成
        </button>
        <button onClick={onClose} className="flex-1 py-2 border border-border-color text-xs text-text-secondary">
          キャンセル
        </button>
      </div>
    </div>
  );
}
