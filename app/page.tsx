import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>QueenChat</h1>
      <p>Простой мессенджер в реальном времени</p>
      <Link href="/login">Войти</Link>
      <br />
      <Link href="/register">Зарегистрироваться</Link>
    </div>
  );
}
