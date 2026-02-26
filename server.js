const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomString(length = Math.floor(Math.random() * 8) + 4) {
  return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

function scheduleNext(ws) {
  const delay = Math.random() * 2000 + 1000; // 1000–3000 ms
  const timer = setTimeout(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(randomString());
      scheduleNext(ws);
    }
  }, delay);
  ws.on('close', () => clearTimeout(timer));
}

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  scheduleNext(ws);
  ws.on('close', () => console.log('WebSocket client disconnected'));
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// app.use(limiter);

app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
})


app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
