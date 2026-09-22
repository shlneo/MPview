import type { LucideIcon } from 'lucide-react'
import { MonitorPlay, User, Users, CalendarRange, Gamepad2, Eye } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    title: 'Application Data',
    items: [
      { to: '/huds', label: 'HUDs', icon: MonitorPlay },
      { to: '/players', label: 'Players', icon: User },
      { to: '/teams', label: 'Teams', icon: Users },
      { to: '/matches', label: 'Matches', icon: CalendarRange }
    ]
  },
  {
    title: 'Game Data',
    items: [
      { to: '/live-game-data', label: 'Live Game Data', icon: Gamepad2 },
      { to: '/spectator-binds', label: 'Spectator Binds', icon: Eye }
    ]
  }
]
