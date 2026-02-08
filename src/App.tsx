import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Auth } from './components/Auth';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import type { LocalNote } from './lib/db';
import { noteRepository } from './repositories/NoteRepository';
import { LogOut, Loader2 } from 'lucide-react';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<LocalNote | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNewNote = async () => {
    const newNote = await noteRepository.createNote('');
    if (newNote) {
      setSelectedNote(newNote);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--bg-main)]">
        <Loader2 className="animate-spin text-[var(--primary)]" size={48} />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex w-full h-full bg-[var(--bg-main)] text-[var(--text-main)]">
      <NoteList
        selectedNoteId={selectedNote?.id || null}
        onSelectNote={setSelectedNote}
        onNewNote={handleNewNote}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[var(--border)] flex items-center justify-end px-4 gap-2 bg-[var(--bg-sidebar)]/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-2">
            <span className="text-xs text-[var(--text-muted)] hidden md:block">{session.user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-muted)] hover:text-red-500 rounded-lg transition-all"
              title="ログアウト"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <NoteEditor note={selectedNote} />
      </main>
    </div>
  );
}

export default App;
