import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import AdminLiveScorePage from "./pages/admin/AdminLiveScorePage";
import AdminMatchesPage from "./pages/admin/AdminMatchesPage";
import AdminMediaPage from "./pages/admin/AdminMediaPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminPlayersPage from "./pages/admin/AdminPlayersPage";
import AdminStreamPage from "./pages/admin/AdminStreamPage";
import AdminTeamsPage from "./pages/admin/AdminTeamsPage";
import GalleryPage from "./pages/GalleryPage";
import HomePage from "./pages/HomePage";
import LiveMatchPage from "./pages/LiveMatchPage";
import MatchesPage from "./pages/MatchesPage";
import PlayersPage from "./pages/PlayersPage";
import PointsTablePage from "./pages/PointsTablePage";
import TeamsPage from "./pages/TeamsPage";

function ProtectedAdmin({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function AppShell() {
  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/points-table" element={<PointsTablePage />} />
          <Route path="/live-match" element={<LiveMatchPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdmin>
                <AdminPanelPage />
              </ProtectedAdmin>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="teams" element={<AdminTeamsPage />} />
            <Route path="players" element={<AdminPlayersPage />} />
            <Route path="matches" element={<AdminMatchesPage />} />
            <Route path="live-score" element={<AdminLiveScorePage />} />
            <Route path="uploads" element={<AdminMediaPage />} />
            <Route path="stream" element={<AdminStreamPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
