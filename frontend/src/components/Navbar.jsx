import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import pic1 from "../../pics/pic6.png";

const links = [
  { label: "Home", to: "/" },
  { label: "Teams", to: "/teams" },
  { label: "Matches", to: "/matches" },
  { label: "Points Table", to: "/points-table" },
  { label: "Live Match", to: "/live-match" },
  { label: "Gallery", to: "/gallery" }
];

function navClass({ isActive }) {
  return [
    "rounded-full px-4 py-2 text-sm font-semibold transition",
    isActive
      ? "bg-accent text-white shadow-glow"
      : "text-slate-300 hover:bg-panelSoft hover:text-white"
  ].join(" ");
}

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-bg/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-3 text-white">
          <img src={pic1} alt="TPL" className="h-10 w-10 rounded-full border border-slate-600 object-cover" />
          <span className="text-xl font-bold uppercase tracking-[0.16em]">TPL</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}

          <NavLink to={isAuthenticated ? "/admin" : "/admin/login"} className={navClass}>
            Admin
          </NavLink>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-accent/60 px-4 py-2 text-sm font-semibold text-accentMuted transition hover:bg-accent/20"
            >
              Logout
            </button>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
