import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  // Set a cookie to expire in 1 hour with the username we got from the request body
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const body = await request.json()
  const username = body.username

  if (!username) {
    return new Response("not allowed", { status: 400 })
  }

  
  const cookie = `username=${username}; Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=Strict`
  const headers = {
    "Set-Cookie": cookie
  }
  
  return new Response(null, {
    status: 201,
    statusText: "Success",
    headers
  })
}