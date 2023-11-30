import { newSubscriber, sendTo } from "@/server/sse.service";
import { NextRequest } from "next/server";
import { kv } from '@vercel/kv';
import supabase from "@/server/supabase.service";


const CHAT_ROOM = "ALL"

export function GET(request: NextRequest) {
  const username = request.cookies.get("username")?.value
  if (!username) {
    return new Response("not allowed", { status: 401 })
  }
  console.log("last event id", request.headers.get("Last-Event-ID"))
  const {
    stream,
    headers
  } = newSubscriber(CHAT_ROOM, username , {messages: []})

  // Create a function to handle inserts 
  const handleInserts = (payload: any) => {
    const { new: {
      message,
      username,
      time,
    } } = payload
    sendTo(CHAT_ROOM, { message, username, time })
  }

  // Listen to inserts
  supabase
    ?.channel('messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleInserts)
    .subscribe()


  return new Response(stream, {headers})
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const username = request.cookies.get("username")?.value
  if (!body?.message || !username) {
    return new Response("not allowed", { status: 400 })
  }

  const { message } = body

  await supabase?.from('messages').insert(
    { message, username },
  )

  return new Response(null, {
    status: 201,
    statusText: "Success",
  })
}