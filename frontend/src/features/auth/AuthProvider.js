import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from "react";
import api from "../../api/api";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async () => {
    await fetchUser();
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
