import { createContext, useContext } from "react";

export type AppRole = "student" | "teacher";

export function normalizeRole(role: string | null | undefined): AppRole | null {
  const value = role?.trim().toLowerCase();

  if (!value) return null;
  if (["teacher", "faculty", "faulty"].includes(value)) return "teacher";
  if (["student", "learner"].includes(value)) return "student";

  return value === "teacher" ? "teacher" : "student";
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  studentId: string | null;
  role: AppRole | null;
  loginUser: (id: string, role: string) => void;
  logoutUser: () => void;
}

export const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  isLoading: true,
  studentId: null,
  role: null,
  loginUser: () => {},
  logoutUser: () => {},
});

export const useAuth = () => useContext(AuthContext);
