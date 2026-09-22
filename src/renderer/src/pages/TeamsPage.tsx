import { Users, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'

export default function TeamsPage(): React.JSX.Element {
  return (
    <div>
      <PageHeader
        title="Teams"
        subtitle="Group players into teams for your matches."
        actions={
          <Button variant="primary">
            <Plus size={14} />
            Add Team
          </Button>
        }
      />
      <EmptyState
        icon={Users}
        title="No teams yet"
        description="Create a team and assign players to display it on the HUD."
      />
    </div>
  )
}
