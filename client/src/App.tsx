import { useState, useCallback } from "react";
import { AuthContext, AuthUser } from "./hooks/useAuth";
import { client } from "./apollo";
import LoginPage from "./pages/LoginPage";
import MessagingPage from "./pages/MessagingPage";

function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );

  const login = useCallback((token: string, user: AuthUser) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    client.clearStore();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {user ? <MessagingPage /> : <LoginPage />}
    </AuthContext.Provider>
  );
}

export default App;
