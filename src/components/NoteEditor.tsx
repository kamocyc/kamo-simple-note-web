import React, { useEffect, useState, useRef } from 'react';
import { noteRepository } from '../repositories/NoteRepository';
import { Trash2, CloudCheck, CloudOff, Loader2 } from 'lucide-react';
import type { LocalNote } from '../lib/db';

interface NoteEditorProps {
  note: LocalNote | null;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note }) => {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (note) {
      setContent(note.content);
    } else {
      setContent('');
    }
  }, [note?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    if (note) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setSaving(true);
      timerRef.current = window.setTimeout(async () => {
        await noteRepository.updateNote(note.id, newContent);
        setSaving(false);
      }, 1000);
    }
  };

  const handleDelete = async () => {
    if (note && window.confirm('このノートを削除しますか？')) {
      await noteRepository.deleteNote(note.id);
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-[var(--text-muted)] animate-fade-in text-center">
        <StickyNote size={64} className="mb-4 opacity-20" />
        <h2 className="text-xl font-medium mb-2">ノートが選択されていません</h2>
        <p>左側のリストからノートを選択するか、新しいノートを作成してください。</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)] animate-fade-in relative">
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--bg-main)]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          {saving ? (
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Loader2 size={14} className="animate-spin" />
              保存中...
            </div>
          ) : note.is_synced ? (
            <div className="flex items-center gap-1 text-xs text-green-500">
              <CloudCheck size={14} />
              同期済み
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <CloudOff size={14} />
              未同期
            </div>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <textarea
        className="flex-1 p-8 text-xl bg-transparent border-none outline-none resize-none leading-relaxed text-[var(--text-main)]"
        placeholder="ここに入力してください..."
        value={content}
        onChange={handleChange}
        spellCheck={false}
      />
    </div>
  );
};

import { StickyNote } from 'lucide-react';
