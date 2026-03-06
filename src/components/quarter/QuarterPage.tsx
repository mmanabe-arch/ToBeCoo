import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Quarter } from '../../types';
import { getCurrentQuarterInfo, getQuarterLabel } from '../../utils/dateUtils';
import PageHeader from '../layout/PageHeader';

export default function QuarterPage() {
  const navigate = useNavigate();
  const { quarters, addQuarter } = useStore();
  const { year, quarter } = getCurrentQuarterInfo();
  const [showAdd, setShowAdd] = useState(false);

  const sorted = [...quarters].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.quarter - a.quarter;
  });

  const currentQuarter = quarters.find(q => q.year === year && q.quarter === quarter);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="四半期決算"
        back
        right={
          <button onClick={() => setShowAdd(s => !s)} className="p-2">
            <Plus size={18} className="text-text-secondary" />
          </button>
        }
      />

      <div className="px-5 py-4 space-y-4 pb-24">
        {/* Current quarter highlight */}
        {currentQuarter && (
          <button
            onClick={() => navigate(`/quarter/${currentQuarter.id}`)}
            className="w-full border-2 border-text-primary p-5 text-left"
          >
            <p className="text-xs text-text-muted mb-2 uppercase tracking-wide">
              現在 · {getQuarterLabel(year, quarter)}
            </p>
            <p className="text-base font-semibold text-text-primary">
              {currentQuarter.theme || 'テーマ未設定'}
            </p>
            <p className="text-xs text-text-muted mt-2">タップして編集 →</p>
          </button>
        )}

        {showAdd && (
          <AddQuarterForm onClose={() => setShowAdd(false)} />
        )}

        {!currentQuarter && !showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full border border-dashed border-border-color p-5 text-center"
          >
            <p className="text-sm text-text-muted">今四半期の決算を作成</p>
            <p className="text-xs text-text-muted mt-1">{getQuarterLabel(year, quarter)}</p>
          </button>
        )}

        {/* Past quarters */}
        {sorted.filter(q => !(q.year === year && q.quarter === quarter)).map(q => (
          <button
            key={q.id}
            onClick={() => navigate(`/quarter/${q.id}`)}
            className="w-full flex items-center justify-between p-4 border border-border-color text-left hover:border-text-secondary transition-colors"
          >
            <div>
              <p className="text-xs text-text-muted mb-1">{getQuarterLabel(q.year, q.quarter)}</p>
              <p className="text-sm text-text-primary">{q.theme || 'テーマ未設定'}</p>
            </div>
            <ChevronRight size={16} className="text-text-muted" />
          </button>
        ))}

        {sorted.length === 0 && !showAdd && !currentQuarter && (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">四半期決算がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AddQuarterForm({ onClose }: { onClose: () => void }) {
  const { addQuarter } = useStore();
  const { year, quarter } = getCurrentQuarterInfo();
  const [form, setForm] = useState({
    year: String(year),
    quarter: String(quarter),
    theme: '',
  });

  const handleSubmit = () => {
    if (!form.theme.trim()) return;
    addQuarter({
      year: parseInt(form.year),
      quarter: parseInt(form.quarter) as 1 | 2 | 3 | 4,
      theme: form.theme.trim(),
      achievements: '',
      failures: '',
      nextTheme: '',
    });
    onClose();
  };

  return (
    <div className="border border-text-primary p-4 space-y-3">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">新規四半期決算</p>
      <div className="flex gap-2">
        <select
          value={form.year}
          onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
          className="flex-1 text-xs bg-transparent border border-border-color px-2 py-2 text-text-secondary"
        >
          {[year - 1, year, year + 1].map(y => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </select>
        <select
          value={form.quarter}
          onChange={e => setForm(f => ({ ...f, quarter: e.target.value }))}
          className="flex-1 text-xs bg-transparent border border-border-color px-2 py-2 text-text-secondary"
        >
          {[1, 2, 3, 4].map(q => (
            <option key={q} value={q}>Q{q}</option>
          ))}
        </select>
      </div>
      <input
        value={form.theme}
        onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}
        placeholder="今四半期の重点テーマ"
        className="w-full text-sm bg-transparent border-b border-border-color pb-2 focus:border-text-primary text-text-primary placeholder:text-text-muted"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!form.theme.trim()}
          className="flex-1 py-2 bg-text-primary text-white text-xs disabled:opacity-40"
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
