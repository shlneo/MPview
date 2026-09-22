import { ipcMain, dialog } from 'electron'
import { readFileSync } from 'fs'
import { extname } from 'path'
import * as db from './db'
import { broadcastCamera } from './realtime'

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
}

async function pickImage(): Promise<string | null> {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }]
  })
  if (result.canceled || result.filePaths.length === 0) return null

  const filePath = result.filePaths[0]
  const mime = MIME_BY_EXT[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
  const base64 = readFileSync(filePath).toString('base64')
  return `data:${mime};base64,${base64}`
}

export function registerIpcHandlers(): void {
  ipcMain.handle('dialog:pickImage', () => pickImage())

  ipcMain.handle('db:players:list', () => db.listPlayers())
  ipcMain.handle('db:players:create', (_e, input: Omit<db.Player, 'id'>) =>
    db.createPlayer(input)
  )
  ipcMain.handle(
    'db:players:update',
    (_e, id: string, patch: Partial<Omit<db.Player, 'id'>>) => db.updatePlayer(id, patch)
  )
  ipcMain.handle('db:players:delete', (_e, id: string) => db.deletePlayer(id))

  ipcMain.handle('db:teams:list', () => db.listTeams())
  ipcMain.handle(
    'db:teams:create',
    (_e, input: Omit<db.Team, 'id'>, playerIds: string[]) => db.createTeam(input, playerIds)
  )
  ipcMain.handle(
    'db:teams:update',
    (_e, id: string, patch: Partial<Omit<db.Team, 'id'>>, playerIds: string[]) =>
      db.updateTeam(id, patch, playerIds)
  )
  ipcMain.handle('db:teams:delete', (_e, id: string) => db.deleteTeam(id))

  ipcMain.handle('db:matches:list', () => db.listMatches())
  ipcMain.handle('db:matches:create', (_e, input: Omit<db.Match, 'id' | 'createdAt'>) =>
    db.createMatch(input)
  )
  ipcMain.handle('db:matches:delete', (_e, id: string) => db.deleteMatch(id))

  ipcMain.handle('camera:setActive', (_e, playerId: string | null) => {
    const player = playerId ? db.listPlayers().find((p) => p.id === playerId) : null
    broadcastCamera(player?.cameraUrl ?? '', player?.cameraRotation ?? 0)
  })
}
