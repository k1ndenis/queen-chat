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

    // Проверяем токен только один раз при загрузке
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
        return <div>Загрузка...</div>;
    }

    return (
        <div>
            <h1>Добро пожаловать, {user.username}</h1>
            <button onClick={handleLogout}>Выйти</button>
            <p>Страница чатов - скоро здесь будут диалоги</p>
        </div>
    );
}