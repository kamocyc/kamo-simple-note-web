import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md p-8 glass rounded-2xl shadow-xl animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {isSignUp ? 'アカウント作成' : 'おかえりなさい'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isSignUp ? 'Simple Noteを使い始めましょう' : 'ノートを同期するにはログインしてください'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">メールアドレス</label>
            <input
              type="email"
              className="input text-lg"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">パスワード</label>
            <input
              type="password"
              className="input text-lg"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-100/50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full h-12 text-lg justify-center mt-6"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : isSignUp ? (
              <>
                <UserPlus size={24} />
                登録
              </>
            ) : (
              <>
                <LogIn size={24} />
                ログイン
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            {isSignUp ? 'すでにアカウントをお持ちですか？ ログイン' : '新しくアカウントを作成する'}
          </button>
        </div>
      </div>
    </div>
  );
};
