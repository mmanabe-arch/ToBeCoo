import { useState } from 'react';
import { useStore } from '../../store/useStore';
import PageHeader from '../layout/PageHeader';

export default function VisionPage() {
  const { vision, setVision } = useStore();
  const [tenYears, setTenYears] = useState(vision.tenYears);
  const [threeYears, setThreeYears] = useState(vision.threeYears);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setVision({ threeYears, tenYears, updatedAt: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Vision" back />
      <div className="px-5 py-8 space-y-8 pb-24">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Philosophy</p>
          <p className="font-serif text-text-secondary text-sm leading-relaxed italic">
            「あなた自身を一つの会社として経営する。<br />
            ビジョンは北極星。常にそこへ向かう。」
          </p>
        </div>

        {/* 10年後 first */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-3">
            10年後の理想状態
          </label>
          <textarea
            value={tenYears}
            onChange={e => setTenYears(e.target.value)}
            placeholder="10年後の理想の姿は？&#10;どんな価値を生み出していますか？"
            rows={5}
            className="w-full font-serif text-base bg-transparent border-b-2 border-border-color focus:border-text-primary transition-colors resize-none text-text-primary placeholder:text-text-muted py-2 leading-relaxed"
          />
        </div>

        {/* 3年後 second */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wide mb-3">
            3年後の理想状態
          </label>
          <textarea
            value={threeYears}
            onChange={e => setThreeYears(e.target.value)}
            placeholder="3年後、あなたはどんな状態にいますか？&#10;仕事、生活、関係、スキル..."
            rows={5}
            className="w-full font-serif text-base bg-transparent border-b-2 border-border-color focus:border-text-primary transition-colors resize-none text-text-primary placeholder:text-text-muted py-2 leading-relaxed"
          />
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-4 text-sm font-semibold tracking-wide transition-all ${
            saved ? 'bg-background-secondary text-text-primary border border-border-color' : 'bg-text-primary text-white'
          }`}
        >
          {saved ? '保存しました' : '保存する'}
        </button>
      </div>
    </div>
  );
}
