import { useEffect, useRef, useState } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('connecting');
  const wsRef = useRef(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${window.location.host}`);
    wsRef.current = ws;

    ws.onopen = () => setStatus('connected');
    ws.onclose = () => setStatus('disconnected');
    ws.onerror = () => setStatus('error');
    ws.onmessage = (event) => {
      setMessages((prev) => [
        { id: Date.now() + Math.random(), text: event.data, time: new Date().toLocaleTimeString() },
        ...prev,
      ]);
    };

    return () => ws.close();
  }, []);

  return (
    <div>
      <h1>WebSocket Feed</h1>
      <p className={`status status--${status}`}>{status}</p>
      <ul className="message-list">
        {messages.map((msg) => (
          <li key={msg.id} className="message-item">
            <span className="message-time">{msg.time}</span>
            <span className="message-text">{msg.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
