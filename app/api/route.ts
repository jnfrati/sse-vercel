import { newSubscriber, sendTo } from "@/server/sse.service";
import { NextRequest } from "next/server";
import { kv } from '@vercel/kv';



const CHAT_ROOM = "ALL"

export function GET(request: NextRequest) {
  const username = request.cookies.get("username")?.value
  if (!username) {
    return new Response("not allowed", { status: 401 })
  }
  
  const {
    stream,
    headers
  } = newSubscriber(CHAT_ROOM, username , {messages: []})

  return new Response(stream, {headers})
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const username = request.cookies.get("username")?.value
  if (!body?.message || !username) {
    return new Response("not allowed", { status: 400 })
  }



  await sendTo(CHAT_ROOM, {
    username: username,
    time: new Date().toISOString(),
    message: body.message 
  })

  return new Response(null, {
    status: 201,
    statusText: "Success",
  })
}