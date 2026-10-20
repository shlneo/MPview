import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// CS2 Game State Integration: игра сама шлёт POST-запросы с состоянием матча
// на адрес из cfg-файла gamestate_integration_*.cfg в папке game/csgo/cfg.
// Здесь мы только кладём этот файл; HTTP-приёмник на GSI_PORT — следующий шаг.
export const GSI_PORT = 47991
export const GSI_AUTH_TOKEN = 'MPView'
const CFG_FILE_NAME = 'gamestate_integration_mpview.cfg'
const CS2_RELATIVE_CFG_DIR = join(
  'steamapps',
  'common',
  'Counter-Strike Global Offensive',
  'game',
  'csgo',
  'cfg'
)

export type InstallGsiResult = { ok: true; path: string } | { ok: false; error: string }

const GSI_CONFIG = `"MPView"
{
  "uri"       "http://127.0.0.1:${GSI_PORT}/"
  "timeout"   "1.1"
  "buffer"    "0.1"
  "throttle"  "0.1"
  "heartbeat" "10.0"
  "auth"
  {
    "token" "${GSI_AUTH_TOKEN}"
  }
  "data"
  {
    "provider"               "1"
    "map"                    "1"
    "round"                  "1"
    "player_id"              "1"
    "player_state"           "1"
    "player_weapons"         "1"
    "player_match_stats"     "1"
    "player_position"        "1"
    "allplayers_id"          "1"
    "allplayers_state"       "1"
    "allplayers_match_stats" "1"
    "allplayers_weapons"     "1"
    "allplayers_position"    "1"
    "phase_countdowns"       "1"
    "allgrenades"            "1"
    "bomb"                   "1"
    "map_round_wins"         "1"
  }
}
`

// Все библиотеки Steam (игра может стоять не в корневой папке Steam, а например на D:).
function steamLibraries(steamPath: string): string[] {
  const libraries = [steamPath]
  const vdfPath = join(steamPath, 'steamapps', 'libraryfolders.vdf')
  if (!existsSync(vdfPath)) return libraries
  const vdf = readFileSync(vdfPath, 'utf-8')
  for (const match of vdf.matchAll(/"path"\s+"([^"]+)"/g)) {
    libraries.push(match[1].replace(/\\\\/g, '\\'))
  }
  return libraries
}

function findCs2CfgDir(steamPath: string): string | null {
  for (const library of steamLibraries(steamPath)) {
    const cfgDir = join(library, CS2_RELATIVE_CFG_DIR)
    if (existsSync(cfgDir)) return cfgDir
  }
  return null
}

export function installGsiConfig(steamPath: string): InstallGsiResult {
  if (!steamPath || !existsSync(join(steamPath, 'steamapps'))) {
    return { ok: false, error: 'Steam folder not found: there is no "steamapps" inside it.' }
  }
  const cfgDir = findCs2CfgDir(steamPath)
  if (!cfgDir) {
    return { ok: false, error: 'CS2 is not installed in any Steam library of this folder.' }
  }
  const path = join(cfgDir, CFG_FILE_NAME)
  try {
    writeFileSync(path, GSI_CONFIG, 'utf-8')
  } catch (err) {
    return { ok: false, error: `Could not write ${path}: ${(err as Error).message}` }
  }
  return { ok: true, path }
}
