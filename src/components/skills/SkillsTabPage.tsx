import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Clock, DollarSign, Tag, X } from 'lucide-react';
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
          className={`flex-1 py-4 text-sm font-medium transition-colors ${
            tab === 'skills'
              ? 'text-text-primary border-b-2 border-text-primary'
              : 'text-text-muted'
          }`}
        >
          スキル
        </button>
        <button
          onClick={() => setTab('learning')}
          className={`flex-1 py-4 text-sm font-medium transition-colors ${
            tab === 'learning'
              ? 'text-text-primary border-b-2 border-text-primary'
              : 'text-text-muted'
          }`}
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
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', ...SKILL_STATUS_ORDER] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`flex-shrink-0 px-3 py-1 text-xs border transition-colors ${
              filterStatus === s
                ? 'border-text-primary bg-text-primary text-white'
                : 'border-border-color text-text-secondary'
            }`}
          >
            {s === 'all' ? 'すべて' : SKILL_STATUS_LABELS[s]}
          </button>
        ))}
        <button
          onClick={() => setShowAdd(s => !s)}
          className="ml-auto flex-shrink-0 flex items-center gap-1 px-3 py-1 text-xs border border-border-color text-text-secondary"
        >
          <Plus size={12} />追加
        </button>
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

      {showAdd && <AddSkillForm onClose={() => setShowAdd(false)} />}

      {SKILL_STATUS_ORDER.map(status => {
        const group = groupedByStatus[status];
        if (group.length === 0) return null;
        return (
          <div key={status}>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
              {SKILL_STATUS_LABELS[status]} <span className="text-text-muted">({group.length})</span>
            </p>
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
  );
}

function SkillCard({ skill, onUpdate, onDelete }: {
  skill: Skill;
  onUpdate: (p: Partial<Skill>) => void;
  onDelete: () => void;
}) {
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
          <textarea
            value={skill.note}
            onChange={e => onUpdate({ note: e.target.value })}
            placeholder="メモ..."
            rows={2}
            className="w-full text-xs bg-transparent border border-border-color p-2 resize-none text-text-primary placeholder:text-text-muted"
          />
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

  const thisMonth = getTodayString().slice(0, 7);
  const monthLogs = learningLogs.filter(l => l.date.startsWith(thisMonth));
  const monthMinutes = monthLogs.reduce((sum, l) => sum + l.durationMinutes, 0);
  const monthCost = monthLogs.reduce((sum, l) => sum + l.cost, 0);

  return (
    <div className="pb-24">
      {/* Monthly summary */}
      <div className="flex border-b border-border-color">
        <div className="flex-1 px-5 py-4 border-r border-border-color">
          <div className="flex items-center gap-1 mb-1">
            <Clock size={12} className="text-text-muted" />
            <p className="text-[10px] text-text-muted uppercase">今月</p>
          </div>
          <p className="text-xl font-light text-text-primary">
            {Math.floor(monthMinutes / 60)}<span className="text-sm">h</span>
            {monthMinutes % 60 > 0 && <span>{monthMinutes % 60}<span className="text-sm">m</span></span>}
          </p>
        </div>
        <div className="flex-1 px-5 py-4">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign size={12} className="text-text-muted" />
            <p className="text-[10px] text-text-muted uppercase">投資額</p>
          </div>
          <p className="text-xl font-light text-text-primary">¥{monthCost.toLocaleString()}</p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
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

        {showAdd && <AddLearningForm onClose={() => setShowAdd(false)} />}

        {filtered.map(log => <LearningCard key={log.id} log={log} onDelete={() => deleteLearningLog(log.id)} />)}

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
          <span className="text-[10px] text-text-muted border border-border-color px-1.5 py-0.5 flex-shrink-0">
            {LEARNING_CATEGORY_LABELS[log.category]}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span>{formatDateShort(log.date)}</span>
          <span>{Math.floor(log.durationMinutes / 60)}h{log.durationMinutes % 60 > 0 ? `${log.durationMinutes % 60}m` : ''}</span>
          {log.cost > 0 && <span>¥{log.cost.toLocaleString()}</span>}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-border-color pt-3 space-y-3">
          <div>
            <p className="text-[10px] text-text-muted mb-2 uppercase tracking-wide">3つの学び</p>
            {log.learnings.filter(Boolean).map((l, i) => (
              <div key={i} className="flex gap-2 py-1">
                <span className="text-xs text-text-muted">{i + 1}.</span>
                <p className="text-xs text-text-primary">{l}</p>
              </div>
            ))}
          </div>
          {log.action && (
            <div>
              <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wide">実践すること</p>
              <p className="text-xs text-text-primary border-l-2 border-text-primary pl-2">{log.action}</p>
            </div>
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
    title: '', category: 'book' as LearningCategory,
    hours: '', minutes: '', cost: '',
    date: getTodayString(),
    learning1: '', learning2: '', learning3: '',
    action: '', relatedSkillId: '',
  });
  const learningSkills = skills.filter(s => s.status === 'learning');
  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.title.trim() || !form.learning1.trim()) return;
    const durationMinutes = (parseInt(form.hours) || 0) * 60 + (parseInt(form.minutes) || 0);
    addLearningLog({
      title: form.title.trim(), category: form.category, durationMinutes,
      cost: parseInt(form.cost) || 0, date: form.date,
      learnings: [form.learning1, form.learning2, form.learning3],
      action: form.action, relatedSkillId: form.relatedSkillId || undefined,
    });
    onClose();
  };

  return (
    <div className="border border-text-primary p-4 space-y-3">
      <input value={form.title} onChange={e => setF('title', e.target.value)} placeholder="タイトル"
        className="w-full text-sm bg-transparent border-b border-border-color pb-2 focus:border-text-primary text-text-primary placeholder:text-text-muted" autoFocus />
      <div className="flex gap-2">
        <select value={form.category} onChange={e => setF('category', e.target.value)}
          className="flex-1 text-xs bg-transparent border border-border-color px-2 py-2 text-text-secondary">
          {Object.entries(LEARNING_CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input type="date" value={form.date} onChange={e => setF('date', e.target.value)}
          className="flex-1 text-xs bg-transparent border border-border-color px-2 py-2 text-text-secondary" />
      </div>
      <div className="flex gap-2">
        <div className="flex items-center gap-1 flex-1 border border-border-color px-2 py-2">
          <input type="number" value={form.hours} onChange={e => setF('hours', e.target.value)} placeholder="0"
            className="w-8 text-xs bg-transparent text-text-primary text-right" />
          <span className="text-xs text-text-muted">h</span>
          <input type="number" value={form.minutes} onChange={e => setF('minutes', e.target.value)} placeholder="0"
            className="w-8 text-xs bg-transparent text-text-primary text-right" />
          <span className="text-xs text-text-muted">m</span>
        </div>
        <div className="flex items-center gap-1 flex-1 border border-border-color px-2 py-2">
          <span className="text-xs text-text-muted">¥</span>
          <input type="number" value={form.cost} onChange={e => setF('cost', e.target.value)} placeholder="0"
            className="flex-1 text-xs bg-transparent text-text-primary" />
        </div>
      </div>
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
