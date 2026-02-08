import Dexie, { type Table } from 'dexie';

export interface LocalNote {
  id: string;
  content: string;
  created_at: number;
  updated_at: number;
  is_synced: number; // 0 or 1 (Dexie prefers numbers for boolean indexing)
  is_deleted: number; // 0 or 1
  server_updated_at: number;
  last_synced_at: number;
  user_id: string;
}

export class SimpleNoteDatabase extends Dexie {
  notes!: Table<LocalNote>;

  constructor() {
    super('SimpleNoteDB');
    this.version(2).stores({
      notes: 'id, updated_at, is_synced, is_deleted, user_id, last_synced_at'
    });
  }
}

export const db = new SimpleNoteDatabase();
