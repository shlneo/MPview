import { useEffect, useMemo, useState } from 'react'
import { CalendarRange, ChevronLeft, Plus, Swords, Trash2, Undo2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import MapCard from '../components/MapCard'
import { MAP_POOL } from '../mapPool'
import { buildVetoPattern, turnTeamId } from '../vetoLogic'
import type { Match, MapSide, MatchFormat, Team, VetoStep } from '../types'

const TEAM_A_COLOR = '#3b82f6'
const TEAM_B_COLOR = '#f97316'

type View = 'list' | 'setup' | 'veto'

const FORMAT_LABELS: Record<MatchFormat, string> = { bo1: 'BO1', bo3: 'BO3', bo5: 'BO5' }

// В драфте участвуют только активные карты — их ровно столько, сколько
// реально в текущем конкурентном пуле (см. mapPool.ts, поле active).
const ACTIVE_MAPS = MAP_POOL.filter((m) => m.active)

export default function MatchesPage(): React.JSX.Element {
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('list')

  // ---- Setup step ----
  const [teamAId, setTeamAId] = useState('')
  const [teamBId, setTeamBId] = useState('')
  const [format, setFormat] = useState<MatchFormat>('bo3')

  // ---- Veto step ----
  const [steps, setSteps] = useState<VetoStep[]>([])
  // Карта уже выбрана пиком, но противоположная команда ещё не выбрала
  // сторону — шаг не считается завершённым, пока сторона не выбрана.
  const [pendingPick, setPendingPick] = useState<{ teamId: string; map: string } | null>(null)

  async function reload(): Promise<void> {
    const [t, m] = await Promise.all([window.api.teams.list(), window.api.matches.list()])
    setTeams(t)
    setMatches(m)
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  function teamById(id: string): Team | undefined {
    return teams.find((t) => t.id === id)
  }

  function startSetup(): void {
    setTeamAId('')
    setTeamBId('')
    setFormat('bo3')
    setView('setup')
  }

  function startVeto(): void {
    setSteps([])
    setPendingPick(null)
    setView('veto')
  }

  const pattern = useMemo(() => buildVetoPattern(format, ACTIVE_MAPS.length), [format])
  const isVetoComplete = steps.length >= pattern.length
  const currentAction = !isVetoComplete ? pattern[steps.length] : null
  const currentTeamId = !isVetoComplete
    ? turnTeamId(steps.length, teamAId, teamBId)
    : null

  const takenMapIds = useMemo(() => {
    const ids = steps.map((s) => s.map)
    if (pendingPick) ids.push(pendingPick.map)
    return new Set(ids)
  }, [steps, pendingPick])

  function handleMapClick(mapId: string): void {
    if (pendingPick || isVetoComplete || !currentAction || !currentTeamId) return
    if (takenMapIds.has(mapId)) return
    const isDecidingMap = steps.length === pattern.length - 1
    if (currentAction === 'ban') {
      setSteps((prev) => [...prev, { teamId: currentTeamId, action: 'ban', map: mapId }])
    } else if (isDecidingMap) {
      // Решающую карту (последний пик серии) в реальности решает коинфлип/нож
      // прямо в игре — сторону здесь не выбирают, в отличие от остальных пиков.
      setSteps((prev) => [...prev, { teamId: currentTeamId, action: 'pick', map: mapId }])
    } else {
      // Пик не завершается сразу — сначала противоположная команда должна выбрать сторону.
      setPendingPick({ teamId: currentTeamId, map: mapId })
    }
  }

  function handleChooseSide(side: MapSide): void {
    if (!pendingPick) return
    const sideTeamId = pendingPick.teamId === teamAId ? teamBId : teamAId
    setSteps((prev) => [
      ...prev,
      { teamId: pendingPick.teamId, action: 'pick', map: pendingPick.map, side, sideTeamId }
    ])
    setPendingPick(null)
  }

  function handleUndo(): void {
    if (pendingPick) {
      setPendingPick(null)
      return
    }
    setSteps((prev) => prev.slice(0, -1))
  }

  async function confirmMatch(): Promise<void> {
    if (!isVetoComplete) return
    const maps = steps.filter((s) => s.action === 'pick').map((s) => s.map)
    await window.api.matches.create({ teamAId, teamBId, format, veto: steps, maps })
    setView('list')
    reload()
  }

  async function handleDelete(id: string): Promise<void> {
    await window.api.matches.remove(id)
    reload()
  }

  function mapState(mapId: string): 'available' | 'banned' | 'picked' | 'decider' | 'pending' {
    if (pendingPick?.map === mapId) return 'pending'
    const idx = steps.findIndex((s) => s.map === mapId)
    if (idx === -1) return 'available'
    if (steps[idx].action === 'ban') return 'banned'
    return idx === pattern.length - 1 ? 'decider' : 'picked'
  }

  function mapTeamLabel(mapId: string): string | undefined {
    const step = steps.find((s) => s.map === mapId)
    if (!step) return undefined
    const short = teamById(step.teamId)?.shortName ?? '?'
    if (step.action === 'ban') return `Banned by ${short}`
    const sideShort = step.sideTeamId ? teamById(step.sideTeamId)?.shortName : undefined
    return sideShort ? `Picked by ${short} · ${sideShort} start ${step.side}` : `Picked by ${short}`
  }

  const availableTeamsForB = useMemo(() => teams.filter((t) => t.id !== teamAId), [teams, teamAId])

  if (loading) return <div />

  // ---------------- Veto screen ----------------
  if (view === 'veto') {
    const teamA = teamById(teamAId)
    const teamB = teamById(teamBId)
    const activeTeam = currentTeamId ? teamById(currentTeamId) : null
    const activeColor = currentTeamId === teamAId ? TEAM_A_COLOR : TEAM_B_COLOR

    const pickingTeam = pendingPick ? teamById(pendingPick.teamId) : null
    const sideChoosingTeamId = pendingPick
      ? pendingPick.teamId === teamAId
        ? teamBId
        : teamAId
      : null
    const sideChoosingTeam = sideChoosingTeamId ? teamById(sideChoosingTeamId) : null
    const sideChoosingColor = sideChoosingTeamId === teamAId ? TEAM_A_COLOR : TEAM_B_COLOR

    return (
      <div>
        <PageHeader
          title={`${teamA?.name ?? '?'} vs ${teamB?.name ?? '?'}`}
          subtitle={`${FORMAT_LABELS[format]} · Map veto`}
          actions={
            <>
              <Button onClick={handleUndo} disabled={steps.length === 0 && !pendingPick}>
                <Undo2 size={14} />
                Undo
              </Button>
              <Button onClick={() => setView('setup')}>
                <ChevronLeft size={14} />
                Back
              </Button>
            </>
          }
        />

        {pendingPick ? (
          <div className="mb-5 rounded-lg border border-accent bg-accent/10 px-4 py-3">
            <p className="mb-2.5 text-sm font-medium text-white">
              <span style={{ color: activeColor }}>{pickingTeam?.name ?? '?'}</span> выбрал карту{' '}
              <span className="text-white">
                {MAP_POOL.find((m) => m.id === pendingPick.map)?.name}
              </span>
              . Сторону выбирает{' '}
              <span style={{ color: sideChoosingColor }}>{sideChoosingTeam?.name ?? '?'}</span>:
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleChooseSide('CT')}
                className="rounded-md border border-blue-400/40 bg-blue-500/15 px-4 py-1.5 text-sm font-semibold text-blue-300 hover:bg-blue-500/25"
              >
                CT
              </button>
              <button
                onClick={() => handleChooseSide('T')}
                className="rounded-md border border-amber-400/40 bg-amber-500/15 px-4 py-1.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/25"
              >
                T
              </button>
            </div>
          </div>
        ) : (
          <div
            className="mb-5 flex items-center justify-between rounded-lg border px-4 py-3 transition-colors"
            style={{
              borderColor: isVetoComplete ? '#34d399' : activeColor,
              backgroundColor: isVetoComplete ? 'rgba(52,211,153,0.1)' : `${activeColor}1a`
            }}
          >
            {isVetoComplete ? (
              <span className="text-sm font-medium text-emerald-400">
                Драфт завершён — проверьте порядок карт и подтвердите матч.
              </span>
            ) : (
              <span className="text-sm font-medium text-white">
                Ход:{' '}
                <span style={{ color: activeColor }}>{activeTeam?.name ?? '?'}</span> —{' '}
                {currentAction === 'ban' ? 'бан карты' : 'выбор карты'}
              </span>
            )}
            <span className="text-xs text-zinc-500">
              Шаг {Math.min(steps.length + 1, pattern.length)} / {pattern.length}
            </span>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-7">
          {ACTIVE_MAPS.map((map) => {
            const state = mapState(map.id)
            return (
              <MapCard
                key={map.id}
                map={map}
                state={state}
                clickable={!pendingPick && !isVetoComplete && state === 'available'}
                teamLabel={mapTeamLabel(map.id)}
                deciderText={format === 'bo1' ? 'Map' : 'Decider'}
                onClick={() => handleMapClick(map.id)}
              />
            )
          })}
        </div>

        {isVetoComplete && (
          <div className="mt-6 flex items-center justify-between rounded-lg border border-panel-border bg-panel px-4 py-3">
            <div className="text-sm text-zinc-300">
              <span className="text-zinc-500">Порядок карт: </span>
              {steps
                .filter((s) => s.action === 'pick')
                .map((s) => {
                  const name = MAP_POOL.find((m) => m.id === s.map)?.name
                  const sideShort = s.sideTeamId ? teamById(s.sideTeamId)?.shortName : undefined
                  return sideShort ? `${name} (${sideShort}: ${s.side})` : name
                })
                .join(' → ')}
            </div>
            <Button variant="primary" onClick={confirmMatch}>
              Confirm Match
            </Button>
          </div>
        )}
      </div>
    )
  }

  // ---------------- Setup screen ----------------
  if (view === 'setup') {
    const canStart = teamAId && teamBId && teamAId !== teamBId

    return (
      <div>
        <PageHeader
          title="New Match"
          subtitle="Выберите команды и формат — дальше начнётся драфт карт."
          actions={
            <Button onClick={() => setView('list')}>
              <ChevronLeft size={14} />
              Back
            </Button>
          }
        />

        <div className="max-w-lg rounded-lg border border-panel-border bg-panel p-5">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Team A
              </p>
              <select
                className="w-full rounded-md border border-panel-border bg-black/5 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent"
                value={teamAId}
                onChange={(e) => setTeamAId(e.target.value)}
              >
                <option value="">Выберите команду</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Team B
              </p>
              <select
                className="w-full rounded-md border border-panel-border bg-black/5 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent"
                value={teamBId}
                onChange={(e) => setTeamBId(e.target.value)}
              >
                <option value="">Выберите команду</option>
                {availableTeamsForB.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Format
          </p>
          <div className="mb-5 flex gap-2">
            {(['bo1', 'bo3', 'bo5'] as MatchFormat[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  format === f
                    ? 'border-accent bg-accent/15 text-white'
                    : 'border-panel-border bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {FORMAT_LABELS[f]}
              </button>
            ))}
          </div>

          <Button variant="primary" onClick={startVeto} disabled={!canStart}>
            <Swords size={14} />
            Start Veto
          </Button>
        </div>
      </div>
    )
  }

  // ---------------- List screen ----------------
  return (
    <div>
      <PageHeader
        title="Matches"
        subtitle="Set up and track your best-of series."
        actions={
          <Button variant="primary" onClick={startSetup} disabled={teams.length < 2}>
            <Plus size={14} />
            New Match
          </Button>
        }
      />

      {teams.length < 2 && (
        <p className="mb-4 text-sm text-zinc-500">
          Нужно как минимум 2 команды — добавьте их на странице Teams.
        </p>
      )}

      {matches.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No matches yet"
          description="Create a match, pick two teams and a format to start tracking it."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {matches.map((match) => {
            const teamA = teamById(match.teamAId)
            const teamB = teamById(match.teamBId)
            return (
              <div
                key={match.id}
                className="flex items-center gap-3 rounded-lg border border-panel-border bg-panel px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {teamA?.name ?? '?'} vs {teamB?.name ?? '?'}
                    </span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-zinc-300">
                      {FORMAT_LABELS[match.format]}
                    </span>
                  </div>
                  <p className="mt-1 flex flex-wrap gap-1.5 text-xs text-zinc-500">
                    {match.maps.map((id) => (
                      <span
                        key={id}
                        className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-400"
                      >
                        {MAP_POOL.find((m) => m.id === id)?.name ?? id}
                      </span>
                    ))}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(match.id)}
                  className="rounded-md p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
