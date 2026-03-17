"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { User, AuthState } from "@/types";
import {
  login as apiLogin,
  signup as apiSignup,
  getMe,
} from "@/lib/api";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "profmatch_token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Restore session from stored token on mount
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    getMe(token)
      .then((user) => {
        setState({ user, token, isAuthenticated: true, isLoading: false });
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const sessionId = (() => {
      try {
        const data = sessionStorage.getItem("matchData");
        return data ? JSON.parse(data).sessionId : undefined;
      } catch {
        return undefined;
      }
    })();

    const res = await apiLogin(email, password, sessionId);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    setState({
      user: res.user,
      token: res.access_token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const sessionId = (() => {
        try {
          const data = sessionStorage.getItem("matchData");
          return data ? JSON.parse(data).sessionId : undefined;
        } catch {
          return undefined;
        }
      })();

      const res = await apiSignup(email, password, name, sessionId);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      setState({
        user: res.user,
        token: res.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
