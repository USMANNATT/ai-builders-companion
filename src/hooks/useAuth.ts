import { createContext, useContext } from "react";

export interface AuthState {
  isAuthenticated: boolean;
  studentId: string | null;
  role: string | null;
  loginUser: (id: string, role: string) => void;
  logoutUser: () => void;
}

export const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  studentId: null,
  role: null,
  loginUser: () => {},
  logoutUser: () => {},
});

export const useAuth = () => useContext(AuthContext);
