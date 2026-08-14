import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authAPI } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("docmind_token");
    if (token) {
      authAPI
        .getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("docmind_token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem("docmind_token", res.data.access_token);
    const userRes = await authAPI.getMe();
    setUser(userRes.data);
    return userRes.data;
  }, []);

  const register = useCallback(async (email, password) => {
    const res = await authAPI.register(email, password);
    localStorage.setItem("docmind_token", res.data.access_token);
    const userRes = await authAPI.getMe();
    setUser(userRes.data);
    return userRes.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("docmind_token");
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
