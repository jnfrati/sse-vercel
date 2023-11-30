
type Listener = {
  
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  broadcast: (data: any) => void
    close: () => void
  }
  
  const listeners: Map<string, Listener> = new Map()
  
  const encoder = new TextEncoder();
  
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const encode = (message: any, event: 'broadcast' | 'connection') => {
    const data = `id: ${Date.now()}\nevent: ${event}\ndata: ${JSON.stringify(message)}\n\n`
    return encoder.encode(data)
  }
  
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const broadcast = async (data: any) => {
    const listenersArray = Array.from(listeners.values())
    for (const listener of listenersArray) {
      console.log("broadcasting to listener")
      listener.broadcast(data)
    }
  }
  
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  export const sendTo = async (key: string, data: any) => {
    if (key === 'all') {
      await broadcast(data)
      return
    }
  
    const listener = listeners.get(key)
    if (!listener) {
      return
    }
    listener.broadcast(data)
    return;
  }
  
  const addListener = async (key: string, listener: Listener) => {
    const l = listeners.get(key)
  
    if (l) {
      await removeListener(key)
    }
  
    listeners.set(key, listener)
  }
  
  const removeListener = async (key: string) => {
    const listener = listeners.get(key)
    if (!listener) {
      return
    }
    listener.close()
    listeners.delete(key)
    return
  }
  
  export const newSubscriber = (salaId: string, intialData: unknown) => {
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
          broadcast: listener,
          close: () => {
            controller.close()
          }
        })
  
        controller.enqueue(encode({ message: 'connected' }, 'connection'))
        controller.enqueue(encode(intialData, 'broadcast'))
      },
      cancel() {
        sendTo(salaId, { message: 'disconnected' })
        removeListener(salaId)
      }
    })
    
    
    return {
      stream, 
      headers
    }
  }
  
  
  