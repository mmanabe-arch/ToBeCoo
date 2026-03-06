import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Tag, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { BrainDump } from '../../types';
import { formatDateShort } from '../../utils/dateUtils';
import PageHeader from '../layout/PageHeader';

export default function MemoPage() {
  const [searchParams] = useSearchParams();
  const { brainDumps, addBrainDump, updateBrainDump, deleteBrainDump } = useStore();
  const [showAdd, setShowAdd] = useState(searchParams.get('new') === '1');
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const allTags = Array.from(new Set(brainDumps.flatMap(b => b.tags)));
  const sorted = [...brainDumps].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const filtered = sorted.filter(b => {
    const matchSearch = !search || b.content.includes(search) || b.tags.some(t => t.includes(search));
    const matchTag = !filterTag || b.tags.includes(filterTag);
    return matchSearch && matchTag;
  });

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="ブレストメモ"
        right={
          <button onClick={() => setShowAdd(s => !s)} className="p-2">
            <Plus size={18} className="text-text-secondary" />
          </button>
        }
      />

      {/* Search */}
      <div className="px-5 py-3 border-b border-border-color space-y-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="キーワード検索..."
          className="w-full text-sm bg-background-secondary border border-border-color px-3 py-2 text-text-primary placeholder:text-text-muted"
        />
        {allTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(t => t === tag ? '' : tag)}
                className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs border transition-colors ${
                  filterTag === tag
                    ? 'border-text-primary bg-text-primary text-white'
                    : 'border-border-color text-text-muted'
                }`}
              >
                <Tag size={10} />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-4 space-y-3 pb-24">
        {showAdd && (
          <AddMemoForm onClose={() => setShowAdd(false)} />
        )}

        {filtered.map(memo => (
          <MemoCard
            key={memo.id}
            memo={memo}
            onUpdate={(partial) => updateBrainDump(memo.id, partial)}
            onDelete={() => deleteBrainDump(memo.id)}
          />
        ))}

        {filtered.length === 0 && !showAdd && (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">メモがありません</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 text-xs text-text-secondary border border-border-color px-4 py-2"
            >
              最初のメモを書く
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MemoCard({
  memo,
  onUpdate,
  onDelete,
}: {
  memo: BrainDump;
  onUpdate: (partial: Partial<BrainDump>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(memo.content);
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    if (content.trim()) onUpdate({ content: content.trim() });
    setEditing(false);
  };

  const addTag = () => {
    if (!newTag.trim() || memo.tags.includes(newTag.trim())) return;
    onUpdate({ tags: [...memo.tags, newTag.trim()] });
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    onUpdate({ tags: memo.tags.filter(t => t !== tag) });
  };

  const preview = memo.content.slice(0, 60) + (memo.content.length > 60 ? '...' : '');

  return (
    <div className="border border-border-color">
      {editing ? (
        <div className="p-4 space-y-3">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            className="w-full text-sm bg-transparent border border-border-color p-2 resize-none text-text-primary"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 py-2 bg-text-primary text-white text-xs">保存</button>
            <button onClick={() => setEditing(false)} className="flex-1 py-2 border border-border-color text-xs text-text-secondary">
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full p-4 text-left"
        >
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{preview}</p>
          <p className="text-[10px] text-text-muted mt-2">{formatDateShort(memo.createdAt)}</p>
        </button>
      )}

      {/* Tags */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5 items-center border-t border-border-color pt-2">
        {memo.tags.map(tag => (
          <span
            key={tag}
            className="flex items-center gap-1 text-[10px] text-text-muted border border-border-color px-2 py-0.5"
          >
            {tag}
            <button onClick={() => removeTag(tag)} className="ml-0.5">
              <X size={10} />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1">
          <input
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            placeholder="タグ"
            className="text-[10px] bg-transparent border border-dashed border-border-color px-2 py-0.5 w-16 text-text-muted"
          />
        </div>
        <button onClick={onDelete} className="ml-auto">
          <Trash2 size={12} className="text-text-muted" />
        </button>
      </div>
    </div>
  );
}

function AddMemoForm({ onClose }: { onClose: () => void }) {
  const addBrainDump = useStore(s => s.addBrainDump);
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag || tags.includes(tag)) return;
    setTags(t => [...t, tag]);
    setTagInput('');
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    addBrainDump({ content: content.trim(), tags });
    onClose();
  };

  return (
    <div className="border border-text-primary p-4 space-y-3">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="アイデアを書き出す..."
        rows={4}
        className="w-full text-sm bg-transparent border border-border-color p-3 resize-none text-text-primary placeholder:text-text-muted"
        autoFocus
      />
      <div className="flex gap-2">
        <div className="flex-1 flex gap-1 flex-wrap items-center border border-border-color px-2 py-1 min-h-[34px]">
          {tags.map(tag => (
            <span
              key={tag}
              className="flex items-center gap-0.5 text-[10px] bg-background-secondary px-2 py-0.5"
            >
              {tag}
              <button onClick={() => setTags(t => t.filter(t2 => t2 !== tag))}>
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            placeholder="タグを追加"
            className="text-xs bg-transparent text-text-muted flex-1 min-w-[60px]"
          />
        </div>
        <button onClick={addTag} className="py-1 px-2 border border-border-color text-xs text-text-muted">
          <Tag size={12} />
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="flex-1 py-2 bg-text-primary text-white text-xs font-medium disabled:opacity-40"
        >
          保存
        </button>
        <button onClick={onClose} className="flex-1 py-2 border border-border-color text-xs text-text-secondary">
          キャンセル
        </button>
      </div>
    </div>
  );
}
