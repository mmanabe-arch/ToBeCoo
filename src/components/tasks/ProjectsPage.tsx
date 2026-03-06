import { useState } from 'react';
import { Plus, ChevronRight, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import type { ProjectCategory } from '../../types';
import PageHeader from '../layout/PageHeader';

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  work: '業務',
  side: '副業',
  learning: '学習',
  other: 'その他',
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, addProject, updateProject } = useStore();
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

      <div className="flex border-b border-border-color">
        <button
          onClick={() => setShowArchived(false)}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${!showArchived ? 'text-text-primary border-b-2 border-text-primary' : 'text-text-muted'}`}
        >
          アクティブ ({active.length})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${showArchived ? 'text-text-primary border-b-2 border-text-primary' : 'text-text-muted'}`}
        >
          アーカイブ ({archived.length})
        </button>
      </div>

      <div className="px-5 py-4 space-y-2 pb-24">
        {showAdd && <AddProjectForm onClose={() => setShowAdd(false)} />}

        {visible.map(project => (
          <button
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="w-full flex items-center justify-between p-4 border border-border-color text-left hover:border-text-secondary transition-colors"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-text-muted border border-border-color px-1.5 py-0.5">
                  {CATEGORY_LABELS[project.category]}
                </span>
                {project.archived && (
                  <span className="text-[10px] text-text-muted border border-border-color px-1.5 py-0.5">
                    アーカイブ
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-text-primary">{project.name}</p>
              {project.goal && (
                <p className="text-xs text-text-muted mt-1 line-clamp-1">{project.goal}</p>
              )}
            </div>
            <Settings size={14} className="text-text-muted flex-shrink-0" />
          </button>
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
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
      <div className="flex gap-1">
        {(Object.keys(CATEGORY_LABELS) as ProjectCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-1 py-2 text-[10px] border transition-colors ${
              category === cat ? 'border-text-primary bg-text-primary text-white' : 'border-border-color text-text-secondary'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="説明（任意）"
        rows={2}
        className="w-full text-xs bg-transparent border border-border-color p-2 resize-none text-text-primary placeholder:text-text-muted"
      />
      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={!name.trim()} className="flex-1 py-2 bg-text-primary text-white text-xs font-medium disabled:opacity-40">作成</button>
        <button onClick={onClose} className="flex-1 py-2 border border-border-color text-xs text-text-secondary">キャンセル</button>
      </div>
    </div>
  );
}
