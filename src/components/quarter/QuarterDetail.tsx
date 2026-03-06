import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getQuarterLabel } from '../../utils/dateUtils';
import PageHeader from '../layout/PageHeader';

export default function QuarterDetail() {
  const { id } = useParams<{ id: string }>();
  const { quarters, updateQuarter } = useStore();
  const quarter = quarters.find(q => q.id === id);

  const [form, setForm] = useState({
    theme: quarter?.theme || '',
    achievements: quarter?.achievements || '',
    failures: quarter?.failures || '',
    nextTheme: quarter?.nextTheme || '',
    slideUrl: quarter?.slideUrl || '',
  });
  const [saved, setSaved] = useState(false);

  if (!quarter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">見つかりません</p>
      </div>
    );
  }

  const handleSave = () => {
    updateQuarter(quarter.id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setF = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={getQuarterLabel(quarter.year, quarter.quarter)} back />

      <div className="px-5 py-4 space-y-5 pb-24">
        {/* Theme */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">今四半期の重点テーマ</label>
          <input
            value={form.theme}
            onChange={e => setF('theme', e.target.value)}
            placeholder="3ヶ月で集中すること..."
            className="w-full text-base bg-transparent border-b-2 border-border-color focus:border-text-primary transition-colors py-2 text-text-primary placeholder:text-text-muted font-light"
          />
        </div>

        {/* Achievements */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">達成したこと</label>
          <textarea
            value={form.achievements}
            onChange={e => setF('achievements', e.target.value)}
            placeholder="今四半期に達成できたこと..."
            rows={4}
            className="w-full text-sm bg-transparent border border-border-color p-3 resize-none text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Failures */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">できなかったこと</label>
          <textarea
            value={form.failures}
            onChange={e => setF('failures', e.target.value)}
            placeholder="達成できなかったこと、課題..."
            rows={4}
            className="w-full text-sm bg-transparent border border-border-color p-3 resize-none text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Next theme */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">次四半期の重点テーマ</label>
          <textarea
            value={form.nextTheme}
            onChange={e => setF('nextTheme', e.target.value)}
            placeholder="次の3ヶ月で集中すること..."
            rows={3}
            className="w-full text-sm bg-transparent border border-border-color p-3 resize-none text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Google Slides URL */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">Google Slides リンク</label>
          <div className="flex items-center gap-2">
            <input
              value={form.slideUrl}
              onChange={e => setF('slideUrl', e.target.value)}
              placeholder="https://docs.google.com/presentation/..."
              type="url"
              className="flex-1 text-sm bg-transparent border border-border-color px-3 py-2 text-text-primary placeholder:text-text-muted"
            />
            {form.slideUrl && (
              <a
                href={form.slideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-border-color flex items-center justify-center"
              >
                <ExternalLink size={16} className="text-text-secondary" />
              </a>
            )}
          </div>
          {quarter.slideUrl && !form.slideUrl && (
            <a
              href={quarter.slideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 mt-2 text-xs text-text-secondary"
            >
              <ExternalLink size={12} />
              スライドを開く
            </a>
          )}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`w-full py-4 text-sm font-semibold tracking-wide transition-all ${
            saved ? 'bg-background-secondary text-text-primary border border-border-color' : 'bg-text-primary text-white'
          }`}
        >
          {saved ? '保存しました' : '保存する'}
        </button>

        {quarter.aiSummary && (
          <div className="border border-border-color p-4">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">AI Summary</p>
            <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{quarter.aiSummary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
