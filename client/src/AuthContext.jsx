import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

const read = () => {
  try {
    return localStorage.getItem("tt-token");
  } catch {
    return null;
  }
};
const write = value => {
  try {
    if (value) localStorage.setItem("tt-token", value);
    else localStorage.removeItem("tt-token");
  } catch {
    /* storage unavailable */
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(read);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!read());

  const logout = () => {
    write(null);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }
    api("/auth/me", { token })
      .then(setUser)
      .catch(logout)
      .finally(() => setReady(true));
  }, [token]);

  const finish = data => {
    write(data.token);
    setUser(data.user);
    setToken(data.token);
  };

  const login = async (email, password) =>
    finish(await api("/auth/login", { method: "POST", body: { email, password } }));
  const signup = async (name, email, password) =>
    finish(await api("/auth/signup", { method: "POST", body: { name, email, password } }));

  return (
    <Ctx.Provider value={{ user, token, ready, login, signup, logout }}>
      {children}
    </Ctx.Provider>
  );
}