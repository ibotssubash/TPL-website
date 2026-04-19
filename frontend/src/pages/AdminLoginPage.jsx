import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginAdmin } from "../services/api";
import getErrorMessage from "../utils/errorMessage";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await loginAdmin({ username, password });
      login(response.access_token);
      navigate("/admin");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg rounded-3xl border border-slate-700 bg-panel p-7">
      <h1 className="text-4xl font-bold text-white">Admin Login</h1>
      <p className="mt-2 text-slate-400">Manage teams, players, and scores.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
          className="w-full rounded-xl border border-slate-700 bg-panelSoft px-4 py-2 text-white focus:border-accent focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-slate-700 bg-panelSoft px-4 py-2 text-white focus:border-accent focus:outline-none"
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </section>
  );
}
