import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("access_token"),
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (activeToken) => {
    try {
      const userData = await getCurrentUser(activeToken);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Failed to restore user:", error);
      localStorage.removeItem("access_token");
      setToken(null);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    async function restoreUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      await fetchUser(token);
      setLoading(false);
    }

    restoreUser();
  }, [token, fetchUser]);

  function loginUser(accessToken, userData) {
    localStorage.setItem("access_token", accessToken);
    setToken(accessToken);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    if (token) {
      return await fetchUser(token);
    }
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        loginUser,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
