import { useState } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Skill, SkillStatus, LearningLog, LearningCategory } from '../../types';
import { getTodayString, formatDateShort } from '../../utils/dateUtils';

const SKILL_STATUS_LABELS: Record<SkillStatus, string> = {
  acquired: '習得済み',
  learning: '習得中',
  wishlist: '習得したい',
};
const SKILL_STATUS_ORDER: SkillStatus[] = ['learning', 'wishlist', 'acquired'];

const LEARNING_CATEGORY_LABELS: Record<LearningCategory, string> = {
  book: '読書',
  video: '動画',
  podcast: 'Podcast',
  seminar: 'セミナー',
  other: 'その他',
};

export default function SkillsTabPage() {
  const [tab, setTab] = useState<'skills' | 'learning'>('skills');

  return (
    <div className="min-h-screen bg-background">
      <div className="flex border-b border-border-color sticky top-0 bg-background z-40">
        <button
          onClick={() => setTab('skills')}
          className={`flex-1 py-4 text-sm font-medium transition-colors ${tab === 'skills' ? 'text-text-primary border-b-2 border-text-primary' : 'text-text-muted'}`}
        >
          スキル
        </button>
        <button
          onClick={() => setTab('learning')}
          className={`flex-1 py-4 text-sm font-medium transition-colors ${tab === 'learning' ? 'text-text-primary border-b-2 border-text-primary' : 'text-text-muted'}`}
        >
          学習記録
        </button>
      </div>
      {tab === 'skills' ? <SkillsContent /> : <LearningContent />}
    </div>
  );
}

// ==================== Skills ====================
function SkillsContent() {
  const { skills, addSkill, updateSkill, deleteSkill } = useStore();
  const [filterStatus, setFilterStatus] = useState<SkillStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const categories = Array.from(new Set(skills.map(s => s.category).filter(Boolean)));
  const filtered = skills
    .filter(s => filterStatus === 'all' || s.status === filterStatus)
    .filter(s => filterCategory === 'all' || s.category === filterCategory)
    .sort((a, b) => SKILL_STATUS_ORDER.indexOf(a.status) - SKILL_STATUS_ORDER.indexOf(b.status));

  const groupedByStatus = SKILL_STATUS_ORDER.reduce<Record<SkillStatus, Skill[]>>((acc, status) => {
    acc[status] = filtered.filter(s => s.status === status);
    return acc;
  }, { acquired: [], learning: [], wishlist: [] });

  return (
    <div className="px-5 py-4 space-y-4 pb-24">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', ...SKILL_STATUS_ORDER] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`flex-shrink-0 px-3 py-1 text-xs border transition-colors ${filterStatus === s ? 'border-text-primary bg-text-primary text-white' : 'border-border-color text-text-secondary'}`}>
            {s === 'all' ? 'すべて' : SKILL_STATUS_LABELS[s]}
          </button>
        ))}
        <button onClick={() => setShowAdd(s => !s)} className="ml-auto flex-shrink-0 flex items-center gap-1 px-3 py-1 text-xs border border-border-color text-text-secondary">
          <Plus size={12} />追加
        </button>
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', ...categories]).map(c => (
            <button key={c} onClick={() => setFilterCategory(c)}
              className={`flex-shrink-0 px-3 py-1 text-[10px] border transition-colors ${filterCategory === c ? 'border-text-secondary bg-background-secondary text-text-primary' : 'border-border-color text-text-muted'}`}>
              {c === 'all' ? '全カテゴリ' : c}
            </button>
          ))}
        </div>
      )}

      {showAdd && <AddSkillForm onClose={() => setShowAdd(false)} />}

      {SKILL_STATUS_ORDER.map(status => {
        const group = groupedByStatus[status];
        if (group.length === 0) return null;
        return (
          <div key={status}>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
              {SKILL_STATUS_LABELS[status]} ({group.length})
            </p>
            <div className="space-y-2">
              {group.map(skill => (
                <SkillCard key={skill.id} skill={skill}
                  onUpdate={(p) => updateSkill(skill.id, p)}
                  onDelete={() => deleteSkill(skill.id)} />
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
  );
}

function SkillCard({ skill, onUpdate, onDelete }: { skill: Skill; onUpdate: (p: Partial<Skill>) => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border-color">
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between p-3 text-left">
        <div>
          <p className="text-sm text-text-primary">{skill.name}</p>
          {skill.category && <p className="text-[10px] text-text-muted mt-0.5">{skill.category}</p>}
        </div>
        <span className="text-[10px] text-text-muted">{SKILL_STATUS_LABELS[skill.status]}</span>
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t border-border-color space-y-2 pt-3">
          <div className="flex gap-1">
            {SKILL_STATUS_ORDER.map(s => (
              <button key={s} onClick={() => onUpdate({ status: s })}
                className={`flex-1 py-1.5 text-[10px] border transition-colors ${skill.status === s ? 'border-text-primary bg-text-primary text-white' : 'border-border-color text-text-secondary'}`}>
                {SKILL_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <textarea value={skill.note} onChange={e => onUpdate({ note: e.target.value })} placeholder="メモ..." rows={2}
            className="w-full text-xs bg-transparent border border-border-color p-2 resize-none text-text-primary placeholder:text-text-muted" />
          <button onClick={onDelete} className="flex items-center gap-1 text-xs text-text-muted">
            <Trash2 size={12} />削除
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
      <input value={name} onChange={e => setName(e.target.value)} placeholder="スキル名"
        className="w-full text-sm bg-transparent border-b border-border-color pb-2 focus:border-text-primary text-text-primary placeholder:text-text-muted" autoFocus />
      <input value={category} onChange={e => setCategory(e.target.value)} list="skill-cats" placeholder="カテゴリ（任意）"
        className="w-full text-xs bg-transparent border-b border-border-color pb-2 text-text-primary placeholder:text-text-muted" />
      <datalist id="skill-cats">{existingCategories.map(c => <option key={c} value={c} />)}</datalist>
      <div className="flex gap-1">
        {SKILL_STATUS_ORDER.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`flex-1 py-2 text-[10px] border transition-colors ${status === s ? 'border-text-primary bg-text-primary text-white' : 'border-border-color text-text-secondary'}`}>
            {SKILL_STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={!name.trim()} className="flex-1 py-2 bg-text-primary text-white text-xs disabled:opacity-40">追加</button>
        <button onClick={onClose} className="flex-1 py-2 border border-border-color text-xs text-text-secondary">キャンセル</button>
      </div>
    </div>
  );
}

// ==================== Learning ====================
function LearningContent() {
  const { learningLogs, deleteLearningLog, addLearningLog, skills } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [filterCategory, setFilterCategory] = useState<LearningCategory | 'all'>('all');

  const sorted = [...learningLogs].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = sorted.filter(l => filterCategory === 'all' || l.category === filterCategory);

  // Group by category for display
  const categoryGroups = (Object.keys(LEARNING_CATEGORY_LABELS) as LearningCategory[]).reduce<Record<LearningCategory, LearningLog[]>>((acc, cat) => {
    acc[cat] = filtered.filter(l => l.category === cat);
    return acc;
  }, { book: [], video: [], podcast: [], seminar: [], other: [] });

  return (
    <div className="pb-24">
      <div className="px-5 py-3 border-b border-border-color">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', ...Object.keys(LEARNING_CATEGORY_LABELS)] as const).map(c => (
            <button key={c} onClick={() => setFilterCategory(c as LearningCategory | 'all')}
              className={`flex-shrink-0 px-3 py-1 text-xs border transition-colors ${filterCategory === c ? 'border-text-primary bg-text-primary text-white' : 'border-border-color text-text-secondary'}`}>
              {c === 'all' ? 'すべて' : LEARNING_CATEGORY_LABELS[c as LearningCategory]}
            </button>
          ))}
          <button onClick={() => setShowAdd(s => !s)} className="ml-auto flex-shrink-0 flex items-center gap-1 px-3 py-1 text-xs border border-border-color text-text-secondary">
            <Plus size={12} />追加
          </button>
        </div>
      </div>

      <div className="px-5 py-4 space-y-5">
        {showAdd && <AddLearningForm onClose={() => setShowAdd(false)} />}

        {filterCategory === 'all' ? (
          // Show by category groups
          (Object.keys(LEARNING_CATEGORY_LABELS) as LearningCategory[]).map(cat => {
            const group = categoryGroups[cat];
            if (group.length === 0) return null;
            return (
              <div key={cat}>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                  {LEARNING_CATEGORY_LABELS[cat]} ({group.length})
                </p>
                <div className="space-y-2">
                  {group.map(log => (
                    <LearningCard key={log.id} log={log} onDelete={() => deleteLearningLog(log.id)} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // Single category
          <div className="space-y-2">
            {filtered.map(log => (
              <LearningCard key={log.id} log={log} onDelete={() => deleteLearningLog(log.id)} />
            ))}
          </div>
        )}

        {filtered.length === 0 && !showAdd && (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">学習記録がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LearningCard({ log, onDelete }: { log: LearningLog; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border-color">
      <button onClick={() => setExpanded(e => !e)} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-text-primary flex-1">{log.title}</p>
          <span className="text-[10px] text-text-muted flex-shrink-0">{formatDateShort(log.date)}</span>
        </div>
        {/* Show first learning preview */}
        {log.learnings[0] && (
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mt-1">
            → {log.learnings[0]}
          </p>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border-color pt-3 space-y-3">
          {/* Content */}
          {log.content && (
            <div>
              <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wide">取り組んだ内容</p>
              <p className="text-xs text-text-primary leading-relaxed">{log.content}</p>
            </div>
          )}

          {/* Learnings */}
          <div>
            <p className="text-[10px] text-text-muted mb-2 uppercase tracking-wide">3つの学び</p>
            {log.learnings.filter(Boolean).map((l, i) => (
              <div key={i} className="flex gap-2 py-1">
                <span className="text-xs text-text-muted">{i + 1}.</span>
                <p className="text-xs text-text-primary">{l}</p>
              </div>
            ))}
          </div>

          {/* Action */}
          {log.action && (
            <div>
              <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wide">実践すること</p>
              <p className="text-xs text-text-primary border-l-2 border-text-primary pl-2">{log.action}</p>
            </div>
          )}

          {/* Link */}
          {log.link && (
            <a href={log.link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-text-secondary border border-border-color px-3 py-2 w-full">
              <ExternalLink size={12} />
              <span className="truncate">{log.link}</span>
            </a>
          )}

          <button onClick={onDelete} className="flex items-center gap-1 text-xs text-text-muted">
            <Trash2 size={12} />削除
          </button>
        </div>
      )}
    </div>
  );
}

function AddLearningForm({ onClose }: { onClose: () => void }) {
  const addLearningLog = useStore(s => s.addLearningLog);
  const { skills } = useStore();
  const [form, setForm] = useState({
    title: '',
    category: 'book' as LearningCategory,
    content: '',
    learning1: '',
    learning2: '',
    learning3: '',
    action: '',
    link: '',
    date: getTodayString(),
    relatedSkillId: '',
  });
  const learningSkills = skills.filter(s => s.status === 'learning');
  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.title.trim() || !form.learning1.trim()) return;
    addLearningLog({
      title: form.title.trim(),
      category: form.category,
      content: form.content,
      learnings: [form.learning1, form.learning2, form.learning3],
      action: form.action,
      link: form.link || undefined,
      date: form.date,
      relatedSkillId: form.relatedSkillId || undefined,
    });
    onClose();
  };

  return (
    <div className="border border-text-primary p-4 space-y-3">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">学習を記録</p>

      <input value={form.title} onChange={e => setF('title', e.target.value)} placeholder="タイトル（書籍名、講座名など）"
        className="w-full text-sm bg-transparent border-b border-border-color pb-2 focus:border-text-primary text-text-primary placeholder:text-text-muted" autoFocus />

      <div className="flex gap-2">
        <select value={form.category} onChange={e => setF('category', e.target.value)}
          className="flex-1 text-xs bg-transparent border border-border-color px-2 py-2 text-text-secondary">
          {Object.entries(LEARNING_CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input type="date" value={form.date} onChange={e => setF('date', e.target.value)}
          className="flex-1 text-xs bg-transparent border border-border-color px-2 py-2 text-text-secondary" />
      </div>

      {/* Content */}
      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">取り組んだ内容</p>
        <textarea value={form.content} onChange={e => setF('content', e.target.value)} placeholder="どんな内容に取り組みましたか..." rows={2}
          className="w-full text-xs bg-transparent border border-border-color p-2 resize-none text-text-primary placeholder:text-text-muted" />
      </div>

      {/* 3 Learnings */}
      <div className="space-y-2">
        <p className="text-[10px] text-text-muted uppercase tracking-wide">3つの学び</p>
        {['learning1', 'learning2', 'learning3'].map((key, i) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-text-muted w-3">{i + 1}.</span>
            <input value={form[key as keyof typeof form]} onChange={e => setF(key, e.target.value)}
              placeholder={`学び${i + 1}${i === 0 ? '（必須）' : '（任意）'}`}
              className="flex-1 text-xs bg-transparent border-b border-border-color pb-1.5 text-text-primary placeholder:text-text-muted" />
          </div>
        ))}
      </div>

      <input value={form.action} onChange={e => setF('action', e.target.value)} placeholder="実践すること"
        className="w-full text-xs bg-transparent border-b border-border-color pb-1.5 text-text-primary placeholder:text-text-muted" />

      {/* Link */}
      <input value={form.link} onChange={e => setF('link', e.target.value)} placeholder="参考リンク（任意）" type="url"
        className="w-full text-xs bg-transparent border border-border-color px-2 py-1.5 text-text-primary placeholder:text-text-muted" />

      {learningSkills.length > 0 && (
        <select value={form.relatedSkillId} onChange={e => setF('relatedSkillId', e.target.value)}
          className="w-full text-xs bg-transparent border border-border-color px-2 py-2 text-text-secondary">
          <option value="">関連スキル（任意）</option>
          {learningSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      )}

      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={!form.title.trim() || !form.learning1.trim()}
          className="flex-1 py-2 bg-text-primary text-white text-xs disabled:opacity-40">記録</button>
        <button onClick={onClose} className="flex-1 py-2 border border-border-color text-xs text-text-secondary">キャンセル</button>
      </div>
    </div>
  );
}
