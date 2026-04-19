import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("tpl_admin_token"));

  const login = (newToken) => {
    localStorage.setItem("tpl_admin_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("tpl_admin_token");
    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      login,
      logout,
      isAuthenticated: Boolean(token)
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
