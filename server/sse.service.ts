
type Listener = {
  name: string
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
  broadcast: (data: any) => void
  close: () => void
}
  
type RoomName = string
const rooms: Map<RoomName, Listener[]> = new Map()

const encoder = new TextEncoder();

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const encode = (message: any, event: 'broadcast' | 'connection') => {
  const data = `id: ${Date.now()}\nevent: ${event}\ndata: ${JSON.stringify(message)}\n\n`
  return encoder.encode(data)
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const broadcast = async (data: any) => {
  const listeners = rooms.get("all")
  if (!listeners || listeners.length === 0) {
    console.error("NO GLOBAL LISTENERS")
    return
  } 

  for (const listener of listeners) {
    console.log("broadcasting to listener")
    listener.broadcast(data)
  }
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const sendTo = async (key: RoomName, data: any) => {
  if (key === 'all') {
    await broadcast(data)
    return
  }

  const listeners = rooms.get(key)

  if (!listeners || listeners.length === 0) {
    return
  }

  listeners.forEach(l => l.broadcast(data))
  return;
}

const addListener = async (key: string, listener: Listener) => {
  
  const l = rooms.get(key)
  const exists = l?.find(l => l.name === listener.name)
  if (exists) {
    await removeListener(key, listener.name)
  }

  rooms.set(key, l ? [...l, listener] : [listener])
}

const removeListener = async (room: RoomName, userId: string) => {
  const listeners = rooms.get(room)
  if (!listeners) {
    return
  }
  
  const newListeners = listeners.filter(l => l.name !== userId)
  if (newListeners.length === 0) {
    rooms.delete(room)
    return
  }

  rooms.set(room, newListeners)
  return
}

export const newSubscriber = (salaId: string, userId: string, intialData: unknown) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  }

  const stream = new ReadableStream({
    start(controller) {
      const listener = async (data: Record<string, unknown>) => {
        controller.enqueue(encode(data, 'broadcast'))
      }
      
      addListener(salaId, {
        name: userId,
        broadcast: listener,
        close: () => {
          controller.close()
        }
      })

      controller.enqueue(encode({ message: 'connected' }, 'connection'))
      controller.enqueue(encode(intialData, 'broadcast'))
    },
    cancel() {
      removeListener(salaId, userId)
    }
  })
  
  return {
    stream, 
    headers
  }
}
  
  
  