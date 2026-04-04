'use client';

import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const getInitialUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg cursor-pointer"
              onClick={() => router.push('/chat')}
            >
              <span className="text-xl">💬</span>
            </div>
            <h1 className="text-xl font-semibold text-white">QueenChat</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-purple-200">{user.username}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 cursor-pointer"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4">
            <span className="text-4xl">💬</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Добро пожаловать, {user.username}!
          </h2>
          <p className="text-purple-200 mb-6">
            Здесь скоро появятся ваши диалоги
          </p>
          <button
            className="px-6 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            + Новый чат
          </button>
        </div>
      </div>
    </div>
  );
}