import { useEffect, useMemo, useState } from 'react'
import { Users, Plus, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import ImagePicker from '../components/ImagePicker'
import FormField, { inputClass } from '../components/FormField'
import type { Player, Team } from '../types'

interface TeamFormState {
  name: string
  shortName: string
  country: string
  logo: string
  playerIds: string[]
}

const emptyForm: TeamFormState = { name: '', shortName: '', country: '', logo: '', playerIds: [] }

export default function TeamsPage(): React.JSX.Element {
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Team | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<TeamFormState>(emptyForm)

  async function reload(): Promise<void> {
    const [t, p] = await Promise.all([window.api.teams.list(), window.api.players.list()])
    setTeams(t)
    setPlayers(p)
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  // Доступны для выбора: свободные игроки + уже состоящие в редактируемой команде.
  const selectablePlayers = useMemo(
    () => players.filter((p) => p.teamId === null || p.teamId === editing?.id),
    [players, editing]
  )

  function rosterOf(teamId: string): Player[] {
    return players.filter((p) => p.teamId === teamId)
  }

  function openCreate(): void {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(team: Team): void {
    setEditing(team)
    setForm({
      name: team.name,
      shortName: team.shortName,
      country: team.country,
      logo: team.logo,
      playerIds: rosterOf(team.id).map((p) => p.id)
    })
    setModalOpen(true)
  }

  function togglePlayer(id: string): void {
    setForm((f) => ({
      ...f,
      playerIds: f.playerIds.includes(id)
        ? f.playerIds.filter((pid) => pid !== id)
        : [...f.playerIds, id]
    }))
  }

  async function handleSubmit(): Promise<void> {
    if (!form.name.trim()) return
    const { playerIds, ...teamInput } = form
    if (editing) {
      await window.api.teams.update(editing.id, teamInput, playerIds)
    } else {
      await window.api.teams.create(teamInput, playerIds)
    }
    setModalOpen(false)
    reload()
  }

  async function handleDelete(id: string): Promise<void> {
    await window.api.teams.remove(id)
    reload()
  }

  if (loading) return <div />

  return (
    <div>
      <PageHeader
        title="Teams"
        subtitle="Group players into teams for your matches."
        actions={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={14} />
            Add Team
          </Button>
        }
      />

      {teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams yet"
          description="Create a team and assign players to display it on the HUD."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {teams.map((team) => (
            <div
              key={team.id}
              className="flex items-center gap-3 rounded-lg border border-panel-border bg-panel px-4 py-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-panel-border bg-white/5">
                {team.logo ? (
                  <img src={team.logo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Users size={16} className="text-zinc-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{team.name}</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-zinc-300">
                    {team.shortName}
                  </span>
                  {team.country && (
                    <span className="text-xs text-zinc-500">{team.country}</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  {rosterOf(team.id).length === 0
                    ? 'Нет игроков в составе'
                    : rosterOf(team.id)
                        .map((p) => p.nickname)
                        .join(', ')}
                </p>
              </div>
              <button
                onClick={() => openEdit(team)}
                className="rounded-md p-1.5 text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => handleDelete(team.id)}
                className="rounded-md p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal
          title={editing ? 'Edit Team' : 'Add Team'}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmit}>
                Save
              </Button>
            </>
          }
        >
          <FormField label="Logo">
            <ImagePicker
              value={form.logo}
              onChange={(logo) => setForm((f) => ({ ...f, logo }))}
              label="Upload logo"
              rounded={false}
            />
          </FormField>
          <FormField label="Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Phantom Academy"
              autoFocus
            />
          </FormField>
          <FormField label="Short name">
            <input
              className={inputClass}
              value={form.shortName}
              onChange={(e) =>
                setForm((f) => ({ ...f, shortName: e.target.value.toUpperCase().slice(0, 5) }))
              }
              placeholder="PA"
            />
          </FormField>
          <FormField label="Country">
            <input
              className={inputClass}
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              placeholder="Poland"
            />
          </FormField>
          <FormField label="Players">
            {selectablePlayers.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Нет свободных игроков — сначала добавьте их на странице Players.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5 rounded-md border border-panel-border p-2">
                {selectablePlayers.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={form.playerIds.includes(p.id)}
                      onChange={() => togglePlayer(p.id)}
                    />
                    {p.nickname}
                  </label>
                ))}
              </div>
            )}
          </FormField>
        </Modal>
      )}
    </div>
  )
}
