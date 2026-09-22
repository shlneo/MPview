import { Navigate, Route, Routes } from 'react-router-dom'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import HudsPage from './pages/HudsPage'
import PlayersPage from './pages/PlayersPage'
import TeamsPage from './pages/TeamsPage'
import MatchesPage from './pages/MatchesPage'
import LiveGameDataPage from './pages/LiveGameDataPage'
import SpectatorBindsPage from './pages/SpectatorBindsPage'

export default function App(): React.JSX.Element {
  return (
    <div className="flex h-screen w-screen flex-col bg-bg text-zinc-200">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/huds" replace />} />
            <Route path="/huds" element={<HudsPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/live-game-data" element={<LiveGameDataPage />} />
            <Route path="/spectator-binds" element={<SpectatorBindsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
