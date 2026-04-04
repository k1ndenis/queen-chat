'use client';

import { fetchWithAuth } from "@/lib/api";
import { ChatInfo } from "@/types/chatInfo";
import { Message } from "@/types/message";
import { User } from "@/types/user";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ChatRoom() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [chat, setChat] = useState<ChatInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    try {
      setUser(JSON.parse(userData));
    } catch {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const loadChatData = async () => {
      try {
        const chatResponse = await fetchWithAuth(`/api/chats/${id}`);
        const chatData = await chatResponse.json();
        setChat(chatData);

        const messagesResponse = await fetchWithAuth(`/api/messages?chatId=${id}`);
        const messagesData = await messagesResponse.json();
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadChatData();
  }, [id, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetchWithAuth('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          chatId: Number(id),
          content: newMessage
        })
      });
      const data = await response.json();
      setMessages([...messages, data]);
      setNewMessage("");
    } catch (error) {
      console.error(error);
      alert("Не удалось отправить сообщение");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Чат не найден</div>
      </div>
    )
  }

  const chatName = chat.name || chat.other_user?.username || "Чвт";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/chat')}
              className="text-white hover:text-purple-300 transition-colors"
            >
              ← Назад
            </button>
            <div className="w-10 h-10 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">💬</span>
            </div>
            <h1 className="text-xl font-semibold text-white">{chatName}</h1>
          </div>
          {user && (
            <span className="text-purple-200">{user.username}</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-purple-300 py-8">
              Нет сообщений. Напишите первое!
            </div>
          ) : (
            messages.map((msg) => {
              let formattedDate = "";
              try {
                const date = new Date(msg.created_at);
                if (!isNaN(date.getTime())) {
                  formattedDate = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
                }
              } catch (error) {
                console.error(error);
                formattedDate = "";
              }
              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                      msg.sender_id === user?.id
                      ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white/10 text-white'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formattedDate}
                    </p>
                  </div>
                </div>
              )}
            )
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 cursor-pointer"
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
}