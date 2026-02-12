import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { clearAdminToken, getAdminToken, getCurrentAdmin, loginAdmin, registerAdmin, setAdminToken } from "../api/mockApi";
import type { AdminUser } from "../types";

type AuthContextType = {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, registrationCode: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    getCurrentAdmin()
      .then((admin) => setUser(admin))
      .catch(() => {
        clearAdminToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    async login(email: string, password: string) {
      const res = await loginAdmin({ email, password });
      setAdminToken(res.access_token);
      setUser(res.user);
    },
    async register(email: string, password: string, registrationCode: string) {
      const res = await registerAdmin({ email, password, registration_code: registrationCode });
      setAdminToken(res.access_token);
      setUser(res.user);
    },
    logout() {
      clearAdminToken();
      setUser(null);
    },
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
