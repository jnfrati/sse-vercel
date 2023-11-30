import { newSubscriber, sendTo } from "@/server/sse.service";
import { NextRequest } from "next/server";
import { kv } from '@vercel/kv';



const CHAT_ROOM = "ALL"

export function GET(request: NextRequest) {
  

  const {
    stream,
    headers
  } = newSubscriber(CHAT_ROOM, {messages: []})

  return new Response(stream, {headers})
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body?.message || !body?.username) {
    return new Response("not allowed", { status: 400 })
  }



  await sendTo(CHAT_ROOM, {
    username: body.username,
    time: new Date().toISOString(),
    message: body.message 
  })

  return new Response(null, {
    status: 201,
    statusText: "Success",

  })
}