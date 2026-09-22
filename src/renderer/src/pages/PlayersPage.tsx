import { useEffect, useState } from 'react'
import { User, Plus, Pencil, Trash2, Video } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import ImagePicker from '../components/ImagePicker'
import FormField, { inputClass } from '../components/FormField'
import RotationPicker from '../components/RotationPicker'
import type { CameraRotation, Player, Team } from '../types'

interface PlayerFormState {
  nickname: string
  steamId: string
  avatar: string
  teamId: string | null
  cameraUrl: string
  cameraRotation: CameraRotation
}

const emptyForm: PlayerFormState = {
  nickname: '',
  steamId: '',
  avatar: '',
  teamId: null,
  cameraUrl: '',
  cameraRotation: 0
}

export default function PlayersPage(): React.JSX.Element {
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Player | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<PlayerFormState>(emptyForm)

  async function reload(): Promise<void> {
    const [p, t] = await Promise.all([window.api.players.list(), window.api.teams.list()])
    setPlayers(p)
    setTeams(t)
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  function openCreate(): void {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(player: Player): void {
    setEditing(player)
    setForm({
      nickname: player.nickname,
      steamId: player.steamId,
      avatar: player.avatar,
      teamId: player.teamId,
      cameraUrl: player.cameraUrl,
      cameraRotation: player.cameraRotation
    })
    setModalOpen(true)
  }

  async function handleSubmit(): Promise<void> {
    if (!form.nickname.trim()) return
    if (editing) {
      await window.api.players.update(editing.id, form)
    } else {
      await window.api.players.create(form)
    }
    setModalOpen(false)
    reload()
  }

  async function handleDelete(id: string): Promise<void> {
    await window.api.players.remove(id)
    reload()
  }

  function teamName(teamId: string | null): string | null {
    return teams.find((t) => t.id === teamId)?.name ?? null
  }

  if (loading) return <div />

  return (
    <div>
      <PageHeader
        title="Players"
        subtitle="Manage player profiles used across your matches."
        actions={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={14} />
            Add Player
          </Button>
        }
      />

      {players.length === 0 ? (
        <EmptyState
          icon={User}
          title="No players yet"
          description="Add a player profile to use it in your matches and teams."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 rounded-lg border border-panel-border bg-panel px-4 py-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-panel-border bg-white/5">
                {player.avatar ? (
                  <img src={player.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User size={16} className="text-zinc-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{player.nickname}</span>
                  {teamName(player.teamId) && (
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-zinc-300">
                      {teamName(player.teamId)}
                    </span>
                  )}
                  {player.cameraUrl && (
                    <span
                      title={player.cameraUrl}
                      className="flex items-center gap-1 rounded bg-accent/15 px-1.5 py-0.5 text-[11px] text-accent"
                    >
                      <Video size={11} />
                      Camera
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">{player.steamId || 'Steam ID не указан'}</p>
              </div>
              <button
                onClick={() => openEdit(player)}
                className="rounded-md p-1.5 text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => handleDelete(player.id)}
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
          title={editing ? 'Edit Player' : 'Add Player'}
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
          <FormField label="Avatar">
            <ImagePicker
              value={form.avatar}
              onChange={(avatar) => setForm((f) => ({ ...f, avatar }))}
              label="Upload avatar"
            />
          </FormField>
          <FormField label="Nickname">
            <input
              className={inputClass}
              value={form.nickname}
              onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
              placeholder="chessz0r"
              autoFocus
            />
          </FormField>
          <FormField label="Steam ID">
            <input
              className={inputClass}
              value={form.steamId}
              onChange={(e) => setForm((f) => ({ ...f, steamId: e.target.value }))}
              placeholder="76561198012345678"
            />
          </FormField>
          <FormField label="Team">
            <select
              className={inputClass}
              value={form.teamId ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value || null }))}
            >
              <option value="">Без команды</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Camera (VDO.Ninja / OBS.Ninja URL)">
            <input
              className={inputClass}
              value={form.cameraUrl}
              onChange={(e) => setForm((f) => ({ ...f, cameraUrl: e.target.value }))}
              placeholder="https://vdo.ninja/?view=xxxxxxx"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Ссылка на просмотр камеры игрока — появится в HUD, когда его переключат на
              странице Spectator Binds.
            </p>
          </FormField>
          <FormField label="Camera rotation">
            <RotationPicker
              value={form.cameraRotation}
              onChange={(cameraRotation) => setForm((f) => ({ ...f, cameraRotation }))}
            />
          </FormField>
        </Modal>
      )}
    </div>
  )
}
