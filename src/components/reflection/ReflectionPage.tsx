import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDate, formatDateShort, getCurrentWeekKey, getWeekLabel } from '../../utils/dateUtils';
import PageHeader from '../layout/PageHeader';

export default function ReflectionPage() {
  const navigate = useNavigate();
  const { dailyLogs, weeklyReflections } = useStore();
  const [search, setSearch] = useState('');

  const weekKey = getCurrentWeekKey();

  // Filter logs with reflection content
  const logsWithReflection = dailyLogs
    .filter(l => l.eveningReflection || l.todayFocus)
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredLogs = logsWithReflection.filter(l =>
    !search || l.eveningReflection?.includes(search) || l.todayFocus?.includes(search)
  );

  const sortedWeekly = [...weeklyReflections].sort((a, b) => b.weekKey.localeCompare(a.weekKey));
  const filteredWeekly = sortedWeekly.filter(r =>
    !search || r.achievements?.includes(search) || r.learnings?.includes(search)
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="振り返り"
        right={
          <button
            onClick={() => navigate('/reflection/weekly')}
            className="text-xs text-text-secondary border border-border-color px-3 py-1.5"
          >
            週次振り返り
          </button>
        }
      />

      {/* Search */}
      <div className="px-5 py-3 border-b border-border-color">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="キーワードで検索..."
          className="w-full text-sm bg-background-secondary border border-border-color px-3 py-2 text-text-primary placeholder:text-text-muted"
        />
      </div>

      <div className="px-5 py-4 space-y-6 pb-24">
        {/* Weekly reflections */}
        {filteredWeekly.length > 0 && (
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide mb-3">週次振り返り</p>
            <div className="space-y-2">
              {filteredWeekly.map(r => (
                <button
                  key={r.id}
                  onClick={() => navigate(`/reflection/weekly/${r.weekKey}`)}
                  className="w-full flex items-center justify-between p-4 border border-border-color text-left hover:border-text-secondary transition-colors"
                >
                  <div>
                    <p className="text-xs text-text-muted mb-1">{getWeekLabel(r.weekKey)}</p>
                    <p className="text-sm text-text-primary line-clamp-1">
                      {r.achievements || 'なし'}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      達成率 {r.taskCompletionRate}%
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-text-muted flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Daily reflections */}
        {filteredLogs.length > 0 && (
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide mb-3">日次記録</p>
            <div className="space-y-2">
              {filteredLogs.map(log => (
                <div key={log.id} className="border border-border-color p-4">
                  <p className="text-xs text-text-muted mb-2">{formatDate(log.date)}</p>
                  {log.eveningReflection && (
                    <p className="text-sm text-text-primary leading-relaxed">{log.eveningReflection}</p>
                  )}
                  {log.todayFocus && (
                    <div className="mt-2 border-t border-border-color pt-2">
                      <p className="text-[10px] text-text-muted mb-1">翌日の意識</p>
                      <p className="text-xs text-text-secondary">{log.todayFocus}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredLogs.length === 0 && filteredWeekly.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">振り返り記録がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
