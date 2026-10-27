import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "../api/fetch.helper";



const AuthContext = createContext(null);

function readToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

function saveToken(token) {
  try {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  } catch {
    // storage unavailable — ignore, app still renders
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function restore() {
      try {
        const data = await apiClient("/users/me");
        if (!cancelled) setUser(data.data ?? data);
      } catch {
        if (!cancelled) {
          saveToken(null);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function login(email, password) {
    const data = await apiClient("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const newToken = data.data.token;
    const newUser = data.data.user;

    saveToken(newToken);
    setToken(newToken);

    if (newUser) {
      setUser(newUser);
    } else {
      const me = await apiClient("/users/me");
      setUser(me.data ?? me);
    }
  }

  async function signup(name, email, password) {
    await apiClient("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    await login(email, password);
  }

  function logout() {
    saveToken(null);
    setToken(null);
    setUser(null);
  }

  const value = { token, user, loading, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}