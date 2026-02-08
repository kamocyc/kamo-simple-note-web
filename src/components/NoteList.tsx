import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { noteRepository } from '../repositories/NoteRepository';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Plus, Search, StickyNote } from 'lucide-react';
import type { LocalNote } from '../lib/db';

interface NoteListProps {
  selectedNoteId: string | null;
  onSelectNote: (note: LocalNote) => void;
  onNewNote: () => void;
}

export const NoteList: React.FC<NoteListProps> = ({ selectedNoteId, onSelectNote, onNewNote }) => {
  const notes = useLiveQuery(() => noteRepository.getAllNotes());

  if (!notes) return null;

  return (
    <div className="flex flex-col h-full w-80 bg-[var(--bg-sidebar)] border-r border-[var(--border)]">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <StickyNote className="text-[var(--primary)]" />
            My Notes
          </h2>
          <button
            onClick={onNewNote}
            className="p-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* 未実装 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full bg-[var(--bg-main)] border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 ring-[var(--primary)] outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)] text-sm">
            ノートがありません
          </div>
        ) : (
          notes.map((note) => (
            <button
              key={note.id}
              onClick={() => onSelectNote(note)}
              className={`w-full text-left p-3 rounded-xl transition-all ${selectedNoteId === note.id
                ? 'bg-[var(--bg-main)] border-l-4 border-[var(--primary)]'
                : 'hover:bg-[var(--bg-main)]/50'
                }`}
            >
              <h3 className="font-semibold text-sm truncate mb-1">
                {note.content.split('\n')[0] || '無題のメモ'}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--text-muted)] truncate flex-1 pr-2">
                  {note.content.split('\n')[1] || '本文なし'}
                </p>
                <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                  {format(note.updated_at, 'MM/dd HH:mm', { locale: ja })}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
