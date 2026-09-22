import { ElectronAPI } from '@electron-toolkit/preload'

export type CameraRotation = 0 | 90 | 180 | 270

export interface Player {
  id: string
  nickname: string
  steamId: string
  avatar: string
  teamId: string | null
  cameraUrl: string
  cameraRotation: CameraRotation
}

export interface Team {
  id: string
  name: string
  shortName: string
  country: string
  logo: string
}

export interface HudStatus {
  hudId: string
  open: boolean
}

export type MatchFormat = 'bo1' | 'bo3' | 'bo5'

export interface VetoStep {
  teamId: string
  action: 'ban' | 'pick'
  map: string
  side?: 'CT' | 'T'
  sideTeamId?: string
}

export interface Match {
  id: string
  teamAId: string
  teamBId: string
  format: MatchFormat
  veto: VetoStep[]
  maps: string[]
  createdAt: number
}

interface Api {
  launchHud: (hudId: string) => Promise<void>
  closeHud: (hudId: string) => Promise<void>
  isHudOpen: (hudId: string) => Promise<boolean>
  onHudStatusChanged: (callback: (status: HudStatus) => void) => () => void
  pickImage: () => Promise<string | null>
  setActiveCamera: (playerId: string | null) => Promise<void>
  players: {
    list: () => Promise<Player[]>
    create: (input: Omit<Player, 'id'>) => Promise<Player>
    update: (id: string, patch: Partial<Omit<Player, 'id'>>) => Promise<Player | null>
    remove: (id: string) => Promise<void>
  }
  teams: {
    list: () => Promise<Team[]>
    create: (input: Omit<Team, 'id'>, playerIds: string[]) => Promise<Team>
    update: (
      id: string,
      patch: Partial<Omit<Team, 'id'>>,
      playerIds: string[]
    ) => Promise<Team | null>
    remove: (id: string) => Promise<void>
  }
  matches: {
    list: () => Promise<Match[]>
    create: (input: Omit<Match, 'id' | 'createdAt'>) => Promise<Match>
    remove: (id: string) => Promise<void>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
