import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string }}
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatId = params.id;

    const participantCheck = await pool.query(
      'SELECT 1 FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const result = await pool.query(
      `SELECT 
        c.id, 
        c.name, 
        c.is_group,
        (SELECT json_build_object('id', u.id, 'username', u.username, 'avatar_url', u.avatar_url)
        FROM chat_participants cp2
        JOIN users u ON cp2.user_id = u.id
        WHERE cp2.chat_id = c.id AND u.id != $1
        LIMIT 1) as other_user
      FROM chats c
      WHERE c.id = $1`,
      [userId, chatId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 });
  }
}