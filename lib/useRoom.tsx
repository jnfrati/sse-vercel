import React, { useState, useEffect, useMemo, useCallback } from 'react';

let eventSource: EventSource | null = null

type Message = {
  username: string,
  time: string,
  message: string
}

type BroadcastEvent = {
  message: Message
} | {
  messages: Message[]
}
const useEventSourceHook = () => {
  const [events, setEvents] = useState<Message[]>([]);

  useEffect(() => {

    const onBroadcast = (event: MessageEvent) => {

      const data: Message = JSON.parse(event.data);

      if ("message" in data) {
        setEvents(prev => [
          ...prev,

          data,

        ])
        return;
      }
    }

    if (!eventSource) {
      eventSource = new EventSource("/api");
    }


    eventSource.addEventListener('broadcast', onBroadcast);




    // Clean up
    return () => {
      eventSource.removeEventListener('broadcast', onBroadcast);
    };
  }, []);

  // Memoize the events array to prevent unnecessary re-renders
  return events;
};

export default useEventSourceHook;
