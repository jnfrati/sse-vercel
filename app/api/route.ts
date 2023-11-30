import { newSubscriber, sendTo } from "@/server/sse.service";
import { NextRequest } from "next/server";
import { kv } from '@vercel/kv';


const CHAT_ROOM = "ALL"

export function GET(request: NextRequest) {
  const messages = kv.hgetall("message")

  const {
    stream,
    headers
  } = newSubscriber(CHAT_ROOM, {messages})

  return new Response(stream, {headers})
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body?.message) {
    return new Response("not allowed", { status: 400 })
  }

  await kv.hset("message", { message: body.message})

  await sendTo(CHAT_ROOM, { message: body.message})

  return new Response("success", { status: 201 })
}