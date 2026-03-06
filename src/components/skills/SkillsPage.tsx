import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Skill, SkillStatus } from '../../types';
import PageHeader from '../layout/PageHeader';
import { useNavigate } from 'react-router-dom';

const STATUS_LABELS: Record<SkillStatus, string> = {
  acquired: '習得済み',
  learning: '習得中',
  wishlist: '習得したい',
};

const STATUS_ORDER: SkillStatus[] = ['learning', 'wishlist', 'acquired'];

export default function SkillsPage() {
  const navigate = useNavigate();
  const { skills, addSkill, updateSkill, deleteSkill } = useStore();
  const [filterStatus, setFilterStatus] = useState<SkillStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const categories = Array.from(new Set(skills.map(s => s.category).filter(Boolean)));

  const filtered = skills
    .filter(s => filterStatus === 'all' || s.status === filterStatus)
    .filter(s => filterCategory === 'all' || s.category === filterCategory)
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));

  const groupedByStatus = STATUS_ORDER.reduce<Record<SkillStatus, Skill[]>>((acc, status) => {
    acc[status] = filtered.filter(s => s.status === status);
    return acc;
  }, { acquired: [], learning: [], wishlist: [] });

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="スキル"
        right={
          <div className="flex gap-2">
            <button onClick={() => navigate('/learning')} className="text-xs text-text-secondary border border-border-color px-3 py-1.5">
              学習記録
            </button>
            <button onClick={() => setShowAdd(s => !s)} className="p-2">
              <Plus size={18} className="text-text-secondary" />
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="px-5 py-3 border-b border-border-color space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', ...STATUS_ORDER] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-shrink-0 px-3 py-1 text-xs border transition-colors ${
                filterStatus === s
                  ? 'border-text-primary bg-text-primary text-white'
                  : 'border-border-color text-text-secondary'
              }`}
            >
              {s === 'all' ? 'すべて' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all', ...categories]).map(c => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`flex-shrink-0 px-3 py-1 text-[10px] border transition-colors ${
                  filterCategory === c
                    ? 'border-text-secondary bg-background-secondary text-text-primary'
                    : 'border-border-color text-text-muted'
                }`}
              >
                {c === 'all' ? '全カテゴリ' : c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-4 space-y-6 pb-24">
        {showAdd && (
          <AddSkillForm onClose={() => setShowAdd(false)} />
        )}

        {STATUS_ORDER.map(status => {
          const group = groupedByStatus[status];
          if (group.length === 0) return null;
          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  {STATUS_LABELS[status]}
                </p>
                <span className="text-xs text-text-muted">({group.length})</span>
              </div>
              <div className="space-y-2">
                {group.map(skill => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onUpdate={(partial) => updateSkill(skill.id, partial)}
                    onDelete={() => deleteSkill(skill.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && !showAdd && (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">スキルを追加してください</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SkillCard({
  skill,
  onUpdate,
  onDelete,
}: {
  skill: Skill;
  onUpdate: (partial: Partial<Skill>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border-color">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div>
          <p className="text-sm text-text-primary">{skill.name}</p>
          {skill.category && (
            <p className="text-[10px] text-text-muted mt-0.5">{skill.category}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted">{STATUS_LABELS[skill.status]}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-border-color space-y-3">
          {/* Status change */}
          <div className="flex gap-1 pt-3">
            {STATUS_ORDER.map(s => (
              <button
                key={s}
                onClick={() => onUpdate({ status: s })}
                className={`flex-1 py-1.5 text-[10px] border transition-colors ${
                  skill.status === s
                    ? 'border-text-primary bg-text-primary text-white'
                    : 'border-border-color text-text-secondary'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Note */}
          <textarea
            value={skill.note}
            onChange={e => onUpdate({ note: e.target.value })}
            placeholder="メモ..."
            rows={2}
            className="w-full text-xs bg-transparent border border-border-color p-2 resize-none text-text-primary placeholder:text-text-muted"
          />

          {/* Delete */}
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-xs text-text-muted"
          >
            <Trash2 size={12} />
            削除
          </button>
        </div>
      )}
    </div>
  );
}

function AddSkillForm({ onClose }: { onClose: () => void }) {
  const addSkill = useStore(s => s.addSkill);
  const { skills } = useStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<SkillStatus>('wishlist');

  const existingCategories = Array.from(new Set(skills.map(s => s.category).filter(Boolean)));

  const handleSubmit = () => {
    if (!name.trim()) return;
    addSkill({ name: name.trim(), category, status, note: '' });
    onClose();
  };

  return (
    <div className="border border-text-primary p-4 space-y-3">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">スキルを追加</p>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="スキル名"
        className="w-full text-sm bg-transparent border-b border-border-color pb-2 focus:border-text-primary transition-colors text-text-primary placeholder:text-text-muted"
        autoFocus
      />
      <div>
        <input
          value={category}
          onChange={e => setCategory(e.target.value)}
          list="skill-categories"
          placeholder="カテゴリ（任意）"
          className="w-full text-xs bg-transparent border-b border-border-color pb-2 text-text-primary placeholder:text-text-muted"
        />
        <datalist id="skill-categories">
          {existingCategories.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>
      <div className="flex gap-1">
        {STATUS_ORDER.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`flex-1 py-2 text-[10px] border transition-colors ${
              status === s
                ? 'border-text-primary bg-text-primary text-white'
                : 'border-border-color text-text-secondary'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
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
