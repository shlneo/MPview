import { Eye } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

export default function SpectatorBindsPage(): React.JSX.Element {
  return (
    <div>
      <PageHeader
        title="Spectator Binds"
        subtitle="Hotkeys for switching cameras and controlling the observer view."
      />
      <EmptyState
        icon={Eye}
        title="No binds configured"
        description="Configure spectator hotkeys to control camera switching during a match."
      />
    </div>
  )
}
