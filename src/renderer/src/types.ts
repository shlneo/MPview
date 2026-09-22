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

export type MatchFormat = 'bo1' | 'bo3' | 'bo5'

export type MapSide = 'CT' | 'T'

export interface VetoStep {
  teamId: string
  action: 'ban' | 'pick'
  map: string
  side?: MapSide
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
