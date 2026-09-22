import { CalendarRange, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'

export default function MatchesPage(): React.JSX.Element {
  return (
    <div>
      <PageHeader
        title="Matches"
        subtitle="Set up and track your best-of series."
        actions={
          <Button variant="primary">
            <Plus size={14} />
            New Match
          </Button>
        }
      />
      <EmptyState
        icon={CalendarRange}
        title="No matches yet"
        description="Create a match, pick two teams and a format to start tracking it."
      />
    </div>
  )
}
