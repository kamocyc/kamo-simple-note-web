# KamoSimpleNote Web

Supabase と Dexie.js を活用した、モダンで高速なノート管理 Web アプリケーションです。オフラインでも動作し、クラウドとリアルタイムに同期します。

## 主な機能

- **ハイブリッド保存**: ブラウザの IndexedDB (Dexie.js) とクラウド (Supabase) の両方にデータを保持。
- **リアルタイム同期**: 複数のデバイス間でノートを瞬時に同期。
- **オフライン対応**: インターネット接続がない状態でも編集可能。再接続時に自動同期。
- **認証システム**: Supabase Auth による安全なサインアップ・ログイン。
- **モダンな UI**:
  - レスポンシブデザイン（モバイル・デスクトップ対応）。
  - 自動保存機能。

## 技術スタック

- **Frontend**: React 19, TypeScript, Vite
- **Database (Local)**: Dexie.js (IndexedDB)
- **Backend (Cloud)**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Utilities**: date-fns, uuid

## セットアップ手順

### 1. リポジトリのクローンとインストール

```bash
git clone <repository-url>
cd kamo-simple-note-web
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成し、Supabase のプロジェクト情報を入力します。

```bash
cp .env.example .env
```

`.env` 内の設定項目:
- `VITE_SUPABASE_URL`: Supabase プロジェクトの URL
- `VITE_SUPABASE_ANON_KEY`: Supabase プロジェクトの Anon Key

### 3. Supabase の設定

Supabase の SQL Editor で以下のコマンドを実行し、テーブル作成と RLS (Row Level Security) の設定を行います。

#### テーブルの作成

```sql
create table public.notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null default auth.uid(),
  content text default '',
  created_at bigint not null,
  updated_at bigint not null,
  is_deleted boolean default false,
  server_updated_at timestamp with time zone default now()
);

-- server_updated_at を自動更新するトリガー（オプション）
create or replace function update_server_updated_at()
returns trigger as $$
begin
  new.server_updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_update_server_updated_at
before update on public.notes
for each row execute function update_server_updated_at();
```

#### RLS ポリシーの設定

```sql
alter table public.notes enable row level security;

-- 自分のノートのみ表示可能
create policy "Users can view their own notes"
on public.notes for select
using ( auth.uid() = user_id );

-- 自分のノートのみ挿入可能
create policy "Users can insert their own notes"
on public.notes for insert
with check ( auth.uid() = user_id );

-- 自分のノートのみ更新可能
create policy "Users can update their own notes"
on public.notes for update
using ( auth.uid() = user_id );

-- 自分のノートのみ削除可能
create policy "Users can delete their own notes"
on public.notes for delete
using ( auth.uid() = user_id );
```

### 4. アプリケーションの起動

```bash
npm run dev
```

ブラウザで表示された URL（デフォルトは `http://localhost:5173`）にアクセスしてください。

## ライセンス

MIT License
