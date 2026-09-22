import { Gamepad2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

export default function LiveGameDataPage(): React.JSX.Element {
  return (
    <div>
      <PageHeader
        title="Live Game Data"
        subtitle="Raw data received from CS2 Game State Integration."
      />
      <EmptyState
        icon={Gamepad2}
        title="Waiting for CS2..."
        description="Start CS2 with Game State Integration configured to see live match data here."
      />
    </div>
  )
}
