import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

type CameraRotation = 0 | 90 | 180 | 270

interface Player {
  id: string
  nickname: string
  steamId: string
  avatar: string
  teamId: string | null
  cameraUrl: string
  cameraRotation: CameraRotation
}

interface Team {
  id: string
  name: string
  shortName: string
  country: string
  logo: string
}

interface HudStatus {
  hudId: string
  open: boolean
}

type MatchFormat = 'bo1' | 'bo3' | 'bo5'

interface VetoStep {
  teamId: string
  action: 'ban' | 'pick'
  map: string
  side?: 'CT' | 'T'
  sideTeamId?: string
}

interface Match {
  id: string
  teamAId: string
  teamBId: string
  format: MatchFormat
  veto: VetoStep[]
  maps: string[]
  createdAt: number
}

const api = {
  launchHud: (hudId: string): Promise<void> => ipcRenderer.invoke('hud:launch', hudId),
  closeHud: (hudId: string): Promise<void> => ipcRenderer.invoke('hud:close', hudId),
  isHudOpen: (hudId: string): Promise<boolean> => ipcRenderer.invoke('hud:isOpen', hudId),
  onHudStatusChanged: (callback: (status: HudStatus) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, status: HudStatus): void =>
      callback(status)
    ipcRenderer.on('hud:status-changed', listener)
    return () => ipcRenderer.removeListener('hud:status-changed', listener)
  },
  pickImage: (): Promise<string | null> => ipcRenderer.invoke('dialog:pickImage'),
  setActiveCamera: (playerId: string | null): Promise<void> =>
    ipcRenderer.invoke('camera:setActive', playerId),
  players: {
    list: (): Promise<Player[]> => ipcRenderer.invoke('db:players:list'),
    create: (input: Omit<Player, 'id'>): Promise<Player> =>
      ipcRenderer.invoke('db:players:create', input),
    update: (id: string, patch: Partial<Omit<Player, 'id'>>): Promise<Player | null> =>
      ipcRenderer.invoke('db:players:update', id, patch),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('db:players:delete', id)
  },
  teams: {
    list: (): Promise<Team[]> => ipcRenderer.invoke('db:teams:list'),
    create: (input: Omit<Team, 'id'>, playerIds: string[]): Promise<Team> =>
      ipcRenderer.invoke('db:teams:create', input, playerIds),
    update: (
      id: string,
      patch: Partial<Omit<Team, 'id'>>,
      playerIds: string[]
    ): Promise<Team | null> => ipcRenderer.invoke('db:teams:update', id, patch, playerIds),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('db:teams:delete', id)
  },
  matches: {
    list: (): Promise<Match[]> => ipcRenderer.invoke('db:matches:list'),
    create: (input: Omit<Match, 'id' | 'createdAt'>): Promise<Match> =>
      ipcRenderer.invoke('db:matches:create', input),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('db:matches:delete', id)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
