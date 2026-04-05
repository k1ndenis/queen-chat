'use client';

import { fetchWithAuth } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout, setUser } from "@/lib/redux/slices/userSlice";
import { Chat } from "@/types/chat";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const { user, loading: userLoading } = useAppSelector(state => state.user);
  const [chats, setChats] = useState<Chat[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const loadChats = async () => {
    try {
      const response = await fetchWithAuth('/api/chats');
      const data = await response.json();
      if (Array.isArray(data)) {
        setChats(data);
      } else {
        console.error('API вернул не массив:', data);
        setChats([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
      setChats([]);
    }
  };

  const loadUsers = async () => {
    const response = await fetchWithAuth('/api/users');
    const data = await response.json();
    setUsers(data);
  }

  const createChat = async (participantId: number) => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/chats', {
        method: 'POST',
        body: JSON.stringify({ participantId })
      })
      const data = await response.json();
      router.push(`/chat/${data.id}`);
    } catch (error) {
      console.error(error);
      alert("Не удалось создать чат");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    if (!user) {
      try {
        const parsedUser = JSON.parse(userData);
        dispatch(setUser(parsedUser));
      } catch (error) {
        console.error(error);
        router.push('./login');
      }
    }
    loadChats();
  }, [user, router, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
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
        {chats.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Добро пожаловать, {user.username}!
            </h2>
            <p className="text-purple-200 mb-6">
              У вас пока нет чатов. Создайте первый!
            </p>
            <button
              onClick={() => {
                loadUsers();
                setShowModal(true);
              }}
              className="px-6 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              + Новый чат
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => {
                  loadUsers();
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 cursor-pointer text-sm"
              >
                + Новый чат
              </button>
            </div>
            <div className="space-y-3">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => router.push(`/chat/${chat.id}`)}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">
                        {chat.name || chat.other_user?.username || 'Чат'}
                      </h3>
                      <p className="text-purple-300 text-sm mt-1">
                        {chat.last_message || 'Нет сообщений'}
                      </p>
                    </div>
                    {chat.last_message_time && (
                      <span className="text-purple-400 text-xs">
                        {new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Новый чат</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => createChat(u.id)}
                  disabled={loading}
                  className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="text-white">{u.username}</span>
                </button>
              ))}
              {users.length === 0 && (
                <p className="text-purple-200 text-center py-4">Нет пользователей для создания чата</p>
              )}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all cursor-pointer"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}