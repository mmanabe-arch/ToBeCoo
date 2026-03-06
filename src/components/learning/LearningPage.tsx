import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Clock, DollarSign } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { LearningLog, LearningCategory } from '../../types';
import { getTodayString, formatDateShort } from '../../utils/dateUtils';
import PageHeader from '../layout/PageHeader';

const CATEGORY_LABELS: Record<LearningCategory, string> = {
  book: '読書',
  video: '動画',
  podcast: 'Podcast',
  seminar: 'セミナー',
  other: 'その他',
};

export default function LearningPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { learningLogs, skills } = useStore();
  const [showAdd, setShowAdd] = useState(searchParams.get('new') === '1');
  const [filterCategory, setFilterCategory] = useState<LearningCategory | 'all'>('all');

  const sorted = [...learningLogs].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = sorted.filter(l => filterCategory === 'all' || l.category === filterCategory);

  // Monthly stats
  const thisMonth = getTodayString().slice(0, 7);
  const monthLogs = learningLogs.filter(l => l.date.startsWith(thisMonth));
  const monthMinutes = monthLogs.reduce((sum, l) => sum + l.durationMinutes, 0);
  const monthCost = monthLogs.reduce((sum, l) => sum + l.cost, 0);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="学習記録"
        back
        right={
          <button onClick={() => setShowAdd(s => !s)} className="p-2">
            <Plus size={18} className="text-text-secondary" />
          </button>
        }
      />

      {/* Monthly summary */}
      <div className="flex border-b border-border-color">
        <div className="flex-1 px-5 py-4 border-r border-border-color">
          <div className="flex items-center gap-1 mb-1">
            <Clock size={12} className="text-text-muted" />
            <p className="text-[10px] text-text-muted uppercase tracking-wide">今月の時間</p>
          </div>
          <p className="text-xl font-light text-text-primary">
            {Math.floor(monthMinutes / 60)}<span className="text-sm">h</span>
            {monthMinutes % 60 > 0 && <span>{monthMinutes % 60}<span className="text-sm">m</span></span>}
          </p>
        </div>
        <div className="flex-1 px-5 py-4">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign size={12} className="text-text-muted" />
            <p className="text-[10px] text-text-muted uppercase tracking-wide">今月の投資</p>
          </div>
          <p className="text-xl font-light text-text-primary">¥{monthCost.toLocaleString()}</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="px-5 py-3 border-b border-border-color">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', ...Object.keys(CATEGORY_LABELS)] as const).map(c => (
            <button
              key={c}
              onClick={() => setFilterCategory(c as LearningCategory | 'all')}
              className={`flex-shrink-0 px-3 py-1 text-xs border transition-colors ${
                filterCategory === c
                  ? 'border-text-primary bg-text-primary text-white'
                  : 'border-border-color text-text-secondary'
              }`}
            >
              {c === 'all' ? 'すべて' : CATEGORY_LABELS[c as LearningCategory]}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-3 pb-24">
        {showAdd && (
          <AddLearningForm onClose={() => setShowAdd(false)} />
        )}

        {filtered.map(log => (
          <LearningCard key={log.id} log={log} />
        ))}

        {filtered.length === 0 && !showAdd && (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">学習記録がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LearningCard({ log }: { log: LearningLog }) {
  const [expanded, setExpanded] = useState(false);
  const deleteLearningLog = useStore(s => s.deleteLearningLog);

  return (
    <div className="border border-border-color">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-text-primary flex-1">{log.title}</p>
          <span className="text-[10px] text-text-muted border border-border-color px-1.5 py-0.5 flex-shrink-0">
            {CATEGORY_LABELS[log.category]}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span>{formatDateShort(log.date)}</span>
          <span>{Math.floor(log.durationMinutes / 60)}h{log.durationMinutes % 60 > 0 ? `${log.durationMinutes % 60}m` : ''}</span>
          {log.cost > 0 && <span>¥{log.cost.toLocaleString()}</span>}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border-color">
          <div className="space-y-3 pt-3">
            <div>
              <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wide">3つの学び</p>
              {log.learnings.map((l, i) => (
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
            <button
              onClick={() => deleteLearningLog(log.id)}
              className="flex items-center gap-1 text-xs text-text-muted"
            >
              <Trash2 size={12} />削除
            </button>
          </div>
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
    hours: '',
    minutes: '',
    cost: '',
    date: getTodayString(),
    learning1: '',
    learning2: '',
    learning3: '',
    action: '',
    relatedSkillId: '',
  });

  const learningSkills = skills.filter(s => s.status === 'learning');

  const handleSubmit = () => {
    if (!form.title.trim() || !form.learning1.trim()) return;
    const durationMinutes = (parseInt(form.hours) || 0) * 60 + (parseInt(form.minutes) || 0);
    addLearningLog({
      title: form.title.trim(),
      category: form.category,
      durationMinutes,
      cost: parseInt(form.cost) || 0,
      date: form.date,
      learnings: [form.learning1, form.learning2, form.learning3],
      action: form.action,
      relatedSkillId: form.relatedSkillId || undefined,
    });
    onClose();
  };

  const setF = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="border border-text-primary p-4 space-y-4">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">学習を記録</p>

      <input
        value={form.title}
        onChange={e => setF('title', e.target.value)}
        placeholder="タイトル（書籍名、講座名など）"
        className="w-full text-sm bg-transparent border-b border-border-color pb-2 focus:border-text-primary transition-colors text-text-primary placeholder:text-text-muted"
        autoFocus
      />

      <div className="flex gap-3">
        <select
          value={form.category}
          onChange={e => setF('category', e.target.value)}
          className="flex-1 text-xs bg-transparent border border-border-color px-2 py-2 text-text-secondary"
        >
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <input
          type="date"
          value={form.date}
          onChange={e => setF('date', e.target.value)}
          className="flex-1 text-xs bg-transparent border border-border-color px-2 py-2 text-text-secondary"
        />
      </div>

      <div className="flex gap-2">
        <div className="flex items-center gap-1 flex-1 border border-border-color px-2 py-2">
          <input
            type="number"
            value={form.hours}
            onChange={e => setF('hours', e.target.value)}
            placeholder="0"
            className="w-10 text-xs bg-transparent text-text-primary text-right"
          />
          <span className="text-xs text-text-muted">時間</span>
          <input
            type="number"
            value={form.minutes}
            onChange={e => setF('minutes', e.target.value)}
            placeholder="0"
            className="w-10 text-xs bg-transparent text-text-primary text-right"
          />
          <span className="text-xs text-text-muted">分</span>
        </div>
        <div className="flex items-center gap-1 flex-1 border border-border-color px-2 py-2">
          <span className="text-xs text-text-muted">¥</span>
          <input
            type="number"
            value={form.cost}
            onChange={e => setF('cost', e.target.value)}
            placeholder="0"
            className="flex-1 text-xs bg-transparent text-text-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] text-text-muted uppercase tracking-wide">3つの学び</p>
        {['learning1', 'learning2', 'learning3'].map((key, i) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-text-muted w-3">{i + 1}.</span>
            <input
              value={form[key as keyof typeof form]}
              onChange={e => setF(key, e.target.value)}
              placeholder={`学び${i + 1}${i === 0 ? '（必須）' : '（任意）'}`}
              className="flex-1 text-xs bg-transparent border-b border-border-color pb-1.5 text-text-primary placeholder:text-text-muted"
            />
          </div>
        ))}
      </div>

      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wide mb-2">実践すること</p>
        <input
          value={form.action}
          onChange={e => setF('action', e.target.value)}
          placeholder="具体的なアクション..."
          className="w-full text-xs bg-transparent border-b border-border-color pb-1.5 text-text-primary placeholder:text-text-muted"
        />
      </div>

      {learningSkills.length > 0 && (
        <select
          value={form.relatedSkillId}
          onChange={e => setF('relatedSkillId', e.target.value)}
          className="w-full text-xs bg-transparent border border-border-color px-2 py-2 text-text-secondary"
        >
          <option value="">関連スキル（任意）</option>
          {learningSkills.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!form.title.trim() || !form.learning1.trim()}
          className="flex-1 py-2 bg-text-primary text-white text-xs font-medium disabled:opacity-40"
        >
          記録
        </button>
        <button onClick={onClose} className="flex-1 py-2 border border-border-color text-xs text-text-secondary">
          キャンセル
        </button>
      </div>
    </div>
  );
}
