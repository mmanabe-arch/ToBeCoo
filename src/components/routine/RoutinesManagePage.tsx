import { useState } from 'react';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Routine } from '../../types';
import PageHeader from '../layout/PageHeader';

const PRESET_EMOJIS = ['🏃','📚','🧘','💪','✍️','🎵','🌅','💊','🥗','💧','🛌','🧹','📝','🎯','🤸'];

export default function RoutinesManagePage() {
  const { routines, addRoutine, updateRoutine, deleteRoutine } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏃');

  const sorted = [...routines].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    if (!name.trim()) return;
    addRoutine({ name: name.trim(), emoji, order: routines.length, active: true });
    setName('');
    setEmoji('🏃');
    setShowAdd(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="デイリールーティン"
        back
        right={
          <button onClick={() => setShowAdd(s => !s)} className="p-2">
            <Plus size={18} className="text-text-secondary" />
          </button>
        }
      />

      <div className="px-5 py-4 space-y-3 pb-24">
        <p className="text-xs text-text-muted leading-relaxed">
          毎日取り組むルーティンを管理します。ホーム画面で円をタップしてチェックを入れてください。
        </p>

        {showAdd && (
          <div className="border border-text-primary p-4 space-y-3">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">ルーティンを追加</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例: 朝のランニング"
              className="w-full text-sm bg-transparent border-b border-border-color pb-2 focus:border-text-primary text-text-primary placeholder:text-text-muted"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <div>
              <p className="text-[10px] text-text-muted mb-2">絵文字を選択</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border-2 transition-colors ${
                      emoji === e ? 'border-text-primary' : 'border-border-color'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!name.trim()}
                className="flex-1 py-2 bg-text-primary text-white text-xs disabled:opacity-40"
              >
                追加
              </button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 border border-border-color text-xs text-text-secondary">
                キャンセル
              </button>
            </div>
          </div>
        )}

        {sorted.map(routine => (
          <RoutineItem
            key={routine.id}
            routine={routine}
            onUpdate={(partial) => updateRoutine(routine.id, partial)}
            onDelete={() => deleteRoutine(routine.id)}
          />
        ))}

        {routines.length === 0 && !showAdd && (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">ルーティンがありません</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RoutineItem({
  routine,
  onUpdate,
  onDelete,
}: {
  routine: Routine;
  onUpdate: (p: Partial<Routine>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(routine.name);

  const handleSave = () => {
    if (name.trim()) onUpdate({ name: name.trim() });
    setEditing(false);
  };

  return (
    <div className={`flex items-center gap-3 p-3 border border-border-color ${!routine.active ? 'opacity-50' : ''}`}>
      <div className="w-10 h-10 rounded-full border-2 border-border-color flex items-center justify-center text-lg flex-shrink-0">
        {routine.emoji}
      </div>
      <div className="flex-1">
        {editing ? (
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className="w-full text-sm bg-transparent border-b border-text-primary text-text-primary"
            autoFocus
          />
        ) : (
          <button onClick={() => setEditing(true)} className="text-sm text-text-primary text-left">
            {routine.name}
          </button>
        )}
      </div>
      <button
        onClick={() => onUpdate({ active: !routine.active })}
        className={`text-[10px] px-2 py-1 border transition-colors ${
          routine.active ? 'border-text-primary text-text-primary' : 'border-border-color text-text-muted'
        }`}
      >
        {routine.active ? 'ON' : 'OFF'}
      </button>
      <button onClick={onDelete} className="p-1">
        <Trash2 size={14} className="text-text-muted" />
      </button>
    </div>
  );
}
