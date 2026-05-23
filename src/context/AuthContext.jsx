import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const res = await api.get("/auth/me");
    const freshUser = res.data?.user || res.data;

    setUser(freshUser);
    sessionStorage.setItem("user", JSON.stringify(freshUser));

    return freshUser;
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetchMe()
      .catch(() => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [fetchMe]);

  const login = useCallback(
    async (email, password) => {
      const res = await api.post("/auth/login", { email, password });

      const token =
        res.data?.token ||
        res.data?.accessToken ||
        res.data?.access_token;

      if (!token) {
        throw new Error("Login successful but no token was returned from backend.");
      }

      sessionStorage.setItem("token", token);

      // Always fetch /auth/me after login so we get the signed profileImageUrl
      const freshUser = await fetchMe();

      return freshUser;
    },
    [fetchMe]
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        setUser,
        fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return ctx;
}