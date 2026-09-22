import { app } from 'electron'
import { randomUUID } from 'crypto'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

export type CameraRotation = 0 | 90 | 180 | 270

export interface Player {
  id: string
  nickname: string
  steamId: string
  avatar: string // data URL или пусто
  teamId: string | null
  cameraUrl: string // ссылка на VDO.Ninja/OBS.Ninja вид камеры игрока
  cameraRotation: CameraRotation // индивидуальный поворот камеры для HUD
}

export interface Team {
  id: string
  name: string
  shortName: string
  country: string
  logo: string // data URL или пусто
}

export type MatchFormat = 'bo1' | 'bo3' | 'bo5'

export type MapSide = 'CT' | 'T'

export interface VetoStep {
  teamId: string
  action: 'ban' | 'pick'
  map: string
  side?: MapSide // сторона, выбранная противоположной командой (только для pick)
  sideTeamId?: string // кто выбрал сторону
}

export interface Match {
  id: string
  teamAId: string
  teamBId: string
  format: MatchFormat
  veto: VetoStep[] // полный лог драфта карт (баны + пики + решающая карта)
  maps: string[] // итоговый порядок карт матча (без банов)
  createdAt: number
}

interface Db {
  players: Player[]
  teams: Team[]
  matches: Match[]
}

function getDbPath(): string {
  return join(app.getPath('userData'), 'data', 'db.json')
}

function readDb(): Db {
  const path = getDbPath()
  if (!existsSync(path)) {
    return { players: [], teams: [], matches: [] }
  }
  try {
    const raw = readFileSync(path, 'utf-8')
    const parsed = JSON.parse(raw)
    const players: Player[] = (parsed.players ?? []).map((p: Partial<Player>) => ({
      cameraUrl: '',
      cameraRotation: 0,
      ...p
    }))
    return { players, teams: parsed.teams ?? [], matches: parsed.matches ?? [] }
  } catch {
    return { players: [], teams: [], matches: [] }
  }
}

function writeDb(db: Db): void {
  const path = getDbPath()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(db, null, 2), 'utf-8')
}

// ---------- Players ----------

export function listPlayers(): Player[] {
  return readDb().players
}

export function createPlayer(input: Omit<Player, 'id'>): Player {
  const db = readDb()
  const player: Player = { id: randomUUID(), ...input }
  db.players.push(player)
  writeDb(db)
  return player
}

export function updatePlayer(id: string, patch: Partial<Omit<Player, 'id'>>): Player | null {
  const db = readDb()
  const player = db.players.find((p) => p.id === id)
  if (!player) return null
  Object.assign(player, patch)
  writeDb(db)
  return player
}

export function deletePlayer(id: string): void {
  const db = readDb()
  db.players = db.players.filter((p) => p.id !== id)
  writeDb(db)
}

// ---------- Teams ----------

export function listTeams(): Team[] {
  return readDb().teams
}

export function createTeam(input: Omit<Team, 'id'>, playerIds: string[]): Team {
  const db = readDb()
  const team: Team = { id: randomUUID(), ...input }
  db.teams.push(team)
  db.players.forEach((p) => {
    if (playerIds.includes(p.id)) p.teamId = team.id
  })
  writeDb(db)
  return team
}

export function updateTeam(
  id: string,
  patch: Partial<Omit<Team, 'id'>>,
  playerIds: string[]
): Team | null {
  const db = readDb()
  const team = db.teams.find((t) => t.id === id)
  if (!team) return null
  Object.assign(team, patch)
  db.players.forEach((p) => {
    if (playerIds.includes(p.id)) {
      p.teamId = team.id
    } else if (p.teamId === team.id) {
      p.teamId = null
    }
  })
  writeDb(db)
  return team
}

export function deleteTeam(id: string): void {
  const db = readDb()
  db.teams = db.teams.filter((t) => t.id !== id)
  db.players.forEach((p) => {
    if (p.teamId === id) p.teamId = null
  })
  writeDb(db)
}

// ---------- Matches ----------

export function listMatches(): Match[] {
  return readDb().matches
}

export function createMatch(input: Omit<Match, 'id' | 'createdAt'>): Match {
  const db = readDb()
  const match: Match = { id: randomUUID(), createdAt: Date.now(), ...input }
  db.matches.push(match)
  writeDb(db)
  return match
}

export function deleteMatch(id: string): void {
  const db = readDb()
  db.matches = db.matches.filter((m) => m.id !== id)
  writeDb(db)
}
