"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { AuthState } from "@/types";
import {
  login as apiLogin,
  signup as apiSignup,
  getMe,
  refreshSession,
  updateProfile,
} from "@/lib/api";
import {
  getAccessToken,
  setTokens,
  clearTokens,
  getTokenExpiry,
} from "@/lib/tokens";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Renew this many ms before the access token's expiry.
const REFRESH_LEEWAY_MS = 60_000;
const DEFAULT_REFRESH_MS = 13 * 60_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mutable ref to logout so scheduleRefresh can call it without a dep cycle.
  const logoutRef = useRef<() => void>(() => {});

  // Schedules a silent token renewal shortly before the access token expires.
  const scheduleRefresh = useCallback((accessToken: string) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    const exp = getTokenExpiry(accessToken);
    const delay = exp
      ? Math.max(exp - Date.now() - REFRESH_LEEWAY_MS, 0)
      : DEFAULT_REFRESH_MS;
    refreshTimer.current = setTimeout(async () => {
      const newToken = await refreshSession();
      if (newToken) {
        setState((s) => ({ ...s, token: newToken }));
        scheduleRefresh(newToken);
      } else {
        logoutRef.current();
      }
    }, delay);
  }, []);

  const logout = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    clearTokens();
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);
  logoutRef.current = logout;

  // Restore session on mount (getMe transparently refreshes an expired token).
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    getMe(token)
      .then((user) => {
        const current = getAccessToken() ?? token;
        setState({ user, token: current, isAuthenticated: true, isLoading: false });
        scheduleRefresh(current);
      })
      .catch(() => {
        clearTokens();
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      });

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [scheduleRefresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      setTokens(res.access_token, res.refresh_token);
      const user = await getMe(res.access_token);
      setState({
        user,
        token: res.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
      scheduleRefresh(res.access_token);
    },
    [scheduleRefresh]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      // The confirm field is validated for equality in the form before submit.
      const res = await apiSignup(name, email, password, password);
      setTokens(res.access_token, res.refresh_token);
      const user = await getMe(res.access_token);
      setState({
        user,
        token: res.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
      scheduleRefresh(res.access_token);
    },
    [scheduleRefresh]
  );

  const updateName = useCallback(async (name: string) => {
    const token = getAccessToken();
    if (!token) return;
    const user = await updateProfile(token, name);
    setState((s) => ({ ...s, user }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        updateName,
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
