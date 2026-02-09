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

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "profmatch_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock validation - in real app this would be an API call
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Check if user exists in localStorage (mock database)
    const usersData = localStorage.getItem("profmatch_users");
    const users: Record<string, { user: User; password: string }> = usersData
      ? JSON.parse(usersData)
      : {};

    const userData = users[email];
    if (!userData || userData.password !== password) {
      throw new Error("Invalid email or password");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData.user));
    setState({ user: userData.user, isAuthenticated: true, isLoading: false });
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock validation
      if (!name || !email || !password) {
        throw new Error("All fields are required");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Check if user already exists
      const usersData = localStorage.getItem("profmatch_users");
      const users: Record<string, { user: User; password: string }> = usersData
        ? JSON.parse(usersData)
        : {};

      if (users[email]) {
        throw new Error("An account with this email already exists");
      }

      // Create new user
      const user: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        createdAt: new Date().toISOString(),
      };

      // Save to mock database
      users[email] = { user, password };
      localStorage.setItem("profmatch_users", JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

      setState({ user, isAuthenticated: true, isLoading: false });
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
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
