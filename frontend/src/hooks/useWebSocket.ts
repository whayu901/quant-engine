import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  data: string;
  timestamp: number;
}

interface UseWebSocketReturn {
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  connectionStatus: 'connecting' | 'open' | 'closed' | 'error';
  reconnect: () => void;
}

export function useWebSocket(url: string | null): UseWebSocketReturn {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<UseWebSocketReturn['connectionStatus']>('connecting');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000; // Start with 1 second

  const connect = useCallback(() => {
    if (!url) return;

    try {
      // Build WebSocket URL
      const wsUrl = url.startsWith('/')
        ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${url}`
        : url;

      // Add auth token to WebSocket URL
      const token = localStorage.getItem('access_token');
      const finalUrl = token ? `${wsUrl}?token=${token}` : wsUrl;

      const socket = new WebSocket(finalUrl);
      socketRef.current = socket;
      setConnectionStatus('connecting');

      socket.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('open');
        reconnectAttemptsRef.current = 0;
      };

      socket.onmessage = (event) => {
        setLastMessage({
          data: event.data,
          timestamp: Date.now(),
        });
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed', event);
        setConnectionStatus('closed');
        socketRef.current = null;

        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current); // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error', error);
        setConnectionStatus('error');
      };
    } catch (error) {
      console.error('Failed to create WebSocket', error);
      setConnectionStatus('error');
    }
  }, [url]);

  const sendMessage = useCallback((message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      socketRef.current.send(messageStr);
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [connect]);

  return {
    lastMessage,
    sendMessage,
    connectionStatus,
    reconnect,
  };
}