import { WebSocketServer, WebSocket } from 'ws'
import type { CameraRotation } from './db'

// Локальный WebSocket-сервер, к которому подключается открытая HUD-страница
// (huds/*/script.js). Через него мы толкаем события в реальном времени —
// сейчас только переключение камеры игрока, дальше сюда же ляжут live-данные
// матча из CS2 GSI.
export const REALTIME_PORT = 47990

let wss: WebSocketServer | null = null
let lastCameraUrl = ''
let lastCameraRotation: CameraRotation = 0

export function startRealtimeServer(): void {
  if (wss) return
  wss = new WebSocketServer({ port: REALTIME_PORT })

  wss.on('connection', (socket) => {
    // Свежеподключившейся странице сразу присылаем текущее состояние,
    // чтобы открытый позже оверлей не ждал следующего переключения.
    socket.send(
      JSON.stringify({ type: 'camera', url: lastCameraUrl, rotation: lastCameraRotation })
    )
  })

  wss.on('error', (err) => {
    console.error('Realtime server error:', err)
  })
}

export function broadcastCamera(url: string, rotation: CameraRotation = 0): void {
  lastCameraUrl = url
  lastCameraRotation = rotation
  if (!wss) return
  const payload = JSON.stringify({ type: 'camera', url, rotation })
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(payload)
  })
}
