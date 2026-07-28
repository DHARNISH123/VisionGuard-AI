class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectTimeout = null;
    this.url = '';
    this.onMessageCallback = null;
    this.reconnectAttempts = 0;
  }

  connect(onMessage) {
    this.onMessageCallback = onMessage;
    
    // Resolve protocol and host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // For local dev where vite proxies, we can connect directly to local ws or proxy
    // Vite proxy handles '/ws' -> localhost:8000
    this.url = `${protocol}//${host}/ws`;

    console.log(`Connecting to WebSocket at ${this.url}`);
    
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connection established.');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        } catch (err) {
          console.warn('Received non-JSON websocket frame:', event.data);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.reason}. Reconnecting...`);
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        this.ws.close();
      };
    } catch (e) {
      console.error('Failed to create WebSocket instance:', e);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    // Cap backoff at 10 seconds
    const backoff = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect(this.onMessageCallback);
    }, backoff);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      // Remove closing event listener to prevent reconnection loop
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    console.log('WebSocket explicitly disconnected.');
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('Cannot send websocket message: Socket is not open.');
    }
  }
}

export const wsService = new WebSocketService();
