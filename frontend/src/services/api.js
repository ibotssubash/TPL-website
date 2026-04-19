import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
});

const apiRoot = api.defaults.baseURL || "http://127.0.0.1:8000/api";
const apiOrigin = apiRoot.replace(/\/api\/?$/, "");

function normalizeMediaUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${apiOrigin}${normalized}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tpl_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginAdmin(payload) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function getHomeData() {
  const { data } = await api.get("/dashboard/home");
  return data;
}

export async function getPointsTable() {
  const { data } = await api.get("/dashboard/points-table");
  return data;
}

export async function getLiveMatch() {
  const { data } = await api.get("/dashboard/live-match");
  return data;
}

export async function listTeams(params = {}) {
  const { data } = await api.get("/teams", { params });
  return data;
}

export async function createTeam(payload) {
  const { data } = await api.post("/teams", payload);
  return data;
}

export async function updateTeam(teamId, payload) {
  const { data } = await api.put(`/teams/${teamId}`, payload);
  return data;
}

export async function deleteTeam(teamId) {
  await api.delete(`/teams/${teamId}`);
}

export async function listPlayers(params = {}) {
  const { data } = await api.get("/players", { params });
  return data;
}

export async function getTopPerformers() {
  const { data } = await api.get("/players/top-performers");
  return data;
}

export async function getLeaderboard(limit = 10) {
  const { data } = await api.get("/players/leaderboard", { params: { limit } });
  return data;
}

export async function createPlayer(payload) {
  const { data } = await api.post("/players", payload);
  return data;
}

export async function updatePlayer(playerId, payload) {
  const { data } = await api.put(`/players/${playerId}`, payload);
  return data;
}

export async function deletePlayer(playerId) {
  await api.delete(`/players/${playerId}`);
}

export async function listMatches(params = {}) {
  const { data } = await api.get("/matches", { params });
  return data;
}

export async function createMatch(payload) {
  const { data } = await api.post("/matches", payload);
  return data;
}

export async function updateMatch(matchId, payload) {
  const { data } = await api.put(`/matches/${matchId}`, payload);
  return data;
}

export async function updateMatchScore(matchId, payload) {
  const { data } = await api.patch(`/matches/${matchId}/score`, payload);
  return data;
}

export async function deleteMatch(matchId) {
  await api.delete(`/matches/${matchId}`);
}

export async function listMediaImages() {
  const { data } = await api.get("/media/images");
  return data.map((item) => ({
    ...item,
    full_url: normalizeMediaUrl(item.file_url)
  }));
}

export async function uploadMediaImages(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const { data } = await api.post("/media/images/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function deleteMediaImage(imageId) {
  await api.delete(`/media/images/${imageId}`);
}

export async function getLiveStreamConfig() {
  const { data } = await api.get("/media/live-stream");
  return data;
}

export async function updateLiveStreamConfig(payload) {
  const { data } = await api.put("/media/live-stream", payload);
  return data;
}

export default api;
