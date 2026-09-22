import { User, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'

export default function PlayersPage(): React.JSX.Element {
  return (
    <div>
      <PageHeader
        title="Players"
        subtitle="Manage player profiles used across your matches."
        actions={
          <Button variant="primary">
            <Plus size={14} />
            Add Player
          </Button>
        }
      />
      <EmptyState
        icon={User}
        title="No players yet"
        description="Add a player profile to use it in your matches and teams."
      />
    </div>
  )
}
