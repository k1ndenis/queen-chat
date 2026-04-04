import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT 
        c.id, 
        c.name, 
        c.is_group,
        c.updated_at,
        (SELECT json_build_object('id', u.id, 'username', u.username, 'avatar_url', u.avatar_url)
        FROM chat_participants cp2
        JOIN users u ON cp2.user_id = u.id
        WHERE cp2.chat_id = c.id AND u.id != $1
        LIMIT 1) as other_user,
        (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM chats c
      JOIN chat_participants cp ON c.id = cp.chat_id
      WHERE cp.user_id = $1
      ORDER BY c.updated_at DESC`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { participantId } = await request.json();

    if (!participantId) {
      return NextResponse.json({ error: "Participant ID required" }, { status: 400 })
    }

    const existingChat = await pool.query(
      `SELECT c.id 
      FROM chats c
      JOIN chat_participants cp1 ON c.id = cp1.chat_id AND cp1.user_id = $1
      JOIN chat_participants cp2 ON c.id = cp2.chat_id AND cp2.user_id = $2
      WHERE c.is_group = false`,
      [userId, participantId]
    );

    if (existingChat.rows.length > 0) {
      return NextResponse.json({ id: existingChat.rows[0].id });
    }

    const chatResult = await pool.query(
      'INSERT INTO chats (name, is_group) VALUES ($1, $2) RETURNING id',
      ['', false]
    );
    const chatId = chatResult.rows[0].id;

    await pool.query(
      'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2), ($1, $3)',
      [chatId, userId, participantId]
    );

    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}