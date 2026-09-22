import { useEffect, useState } from 'react'
import { Eye, RotateCw, Video, VideoOff } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import type { CameraRotation, Player } from '../types'

const NEXT_ROTATION: Record<CameraRotation, CameraRotation> = {
  0: 90,
  90: 180,
  180: 270,
  270: 0
}

export default function SpectatorBindsPage(): React.JSX.Element {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    window.api.players.list().then((p) => {
      setPlayers(p)
      setLoading(false)
    })
  }, [])

  const withCamera = players.filter((p) => p.cameraUrl)

  async function handleShow(playerId: string): Promise<void> {
    await window.api.setActiveCamera(playerId)
    setActiveId(playerId)
  }

  async function handleHide(): Promise<void> {
    await window.api.setActiveCamera(null)
    setActiveId(null)
  }

  async function handleRotate(player: Player): Promise<void> {
    const cameraRotation = NEXT_ROTATION[player.cameraRotation]
    setPlayers((prev) => prev.map((p) => (p.id === player.id ? { ...p, cameraRotation } : p)))
    await window.api.players.update(player.id, { cameraRotation })
    // Если камера этого игрока сейчас в эфире — сразу обновляем поворот в HUD,
    // не дожидаясь следующего переключения.
    if (player.id === activeId) {
      await window.api.setActiveCamera(player.id)
    }
  }

  if (loading) return <div />

  return (
    <div>
      <PageHeader
        title="Spectator Binds"
        subtitle="Переключайте, чья камера сейчас показывается по центру внизу HUD."
        actions={
          activeId && (
            <Button onClick={handleHide}>
              <VideoOff size={14} />
              Hide camera
            </Button>
          )
        }
      />

      {withCamera.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="Нет игроков с камерой"
          description="Добавьте ссылку на VDO.Ninja/OBS.Ninja игроку на странице Players, чтобы она появилась здесь."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {withCamera.map((player) => {
            const isActive = player.id === activeId
            return (
              <div
                key={player.id}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                  isActive
                    ? 'border-accent bg-accent/10'
                    : 'border-panel-border bg-panel'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-panel-border bg-white/5">
                  {player.avatar ? (
                    <img src={player.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Video size={16} className="text-zinc-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-white">{player.nickname}</span>
                  <p className="truncate text-xs text-zinc-500">{player.cameraUrl}</p>
                </div>
                <button
                  onClick={() => handleRotate(player)}
                  title={`Поворот: ${player.cameraRotation}°`}
                  className="flex items-center gap-1 rounded-md border border-panel-border bg-white/5 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10"
                >
                  <RotateCw size={13} />
                  {player.cameraRotation}°
                </button>
                {isActive ? (
                  <span className="flex items-center gap-1 rounded bg-accent px-2.5 py-1 text-xs font-medium text-white">
                    <Video size={12} />
                    On air
                  </span>
                ) : (
                  <Button onClick={() => handleShow(player.id)}>Show on HUD</Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
