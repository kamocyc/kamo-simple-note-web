import { v4 as uuidv4 } from 'uuid';
import { db, type LocalNote } from '../lib/db';
import { supabase } from '../lib/supabaseClient';

export class NoteRepository {
  private userId: string | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    const { data: { session } } = await supabase.auth.getSession();
    this.userId = session?.user?.id || null;

    supabase.auth.onAuthStateChange((_event, session) => {
      this.userId = session?.user?.id || null;
      if (this.userId) {
        this.sync();
        this.setupRealtimeSubscription();
      } else {
        supabase.channel('public:notes').unsubscribe();
      }
    });

    if (this.userId) {
      this.setupRealtimeSubscription();
    }
  }

  private setupRealtimeSubscription() {
    if (!this.userId) return;

    supabase
      .channel('public:notes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload) => {
          this.handleRemoteChange(payload);
        }
      )
      .subscribe();
  }

  private async handleRemoteChange(payload: any) {
    const remoteNote = payload.new || payload.old;
    if (!remoteNote) return;

    const localNote = await db.notes.get(remoteNote.id);

    if (payload.eventType === 'DELETE' || remoteNote.is_deleted) {
      if (localNote) {
        await db.notes.delete(remoteNote.id);
      }
      return;
    }

    if (!localNote || remoteNote.updated_at > localNote.updated_at) {
      await db.notes.put({
        ...remoteNote,
        is_synced: 1,
        is_deleted: remoteNote.is_deleted ? 1 : 0,
      });
    }
  }

  async getAllNotes() {
    return db.notes.where('is_deleted').equals(0).reverse().sortBy('updated_at');
  }

  async createNote(content: string) {
    if (!this.userId) return null;

    const now = Date.now();
    const note: LocalNote = {
      id: uuidv4(),
      content,
      created_at: now,
      updated_at: now,
      is_synced: 0,
      is_deleted: 0,
      server_updated_at: 0,
      last_synced_at: 0,
      user_id: this.userId,
    };

    await db.notes.add(note);
    this.sync();
    return note;
  }

  async updateNote(id: string, content: string) {
    const localNote = await db.notes.get(id);
    if (!localNote) return;

    const now = Date.now();
    await db.notes.update(id, {
      content,
      updated_at: now,
      is_synced: 0,
    });
    this.sync();
  }

  async deleteNote(id: string) {
    await db.notes.update(id, {
      is_deleted: 1,
      is_synced: 0,
      updated_at: Date.now(),
    });
    this.sync();
  }

  async sync() {
    if (!this.userId) return;

    // 1. Upload local changes
    const unsyncedNotes = await db.notes.where('is_synced').equals(0).toArray();
    for (const note of unsyncedNotes) {
      const { data, error } = await supabase
        .from('notes')
        .upsert({
          id: note.id,
          content: note.content,
          created_at: note.created_at,
          updated_at: note.updated_at,
          is_deleted: note.is_deleted === 1,
          user_id: this.userId,
        })
        .select()
        .single();

      if (!error && data) {
        await db.notes.update(note.id, {
          is_synced: 1,
          server_updated_at: data.server_updated_at || Date.now(),
          last_synced_at: Date.now(),
        });
      }
    }

    // 2. Download remote changes
    const lastSyncedAt = (await db.notes.orderBy('last_synced_at').last())?.last_synced_at || 0;
    const { data: remoteNotes, error } = await supabase
      .from('notes')
      .select('*')
      .gt('updated_at', lastSyncedAt);

    if (!error && remoteNotes) {
      for (const remoteNote of remoteNotes) {
        const localNote = await db.notes.get(remoteNote.id);

        if (remoteNote.is_deleted) {
          await db.notes.delete(remoteNote.id);
          continue;
        }

        if (!localNote || remoteNote.updated_at > localNote.updated_at) {
          await db.notes.put({
            ...remoteNote,
            is_synced: 1,
            is_deleted: 0,
            last_synced_at: Date.now(),
          });
        }
      }
    }
  }
}

export const noteRepository = new NoteRepository();
