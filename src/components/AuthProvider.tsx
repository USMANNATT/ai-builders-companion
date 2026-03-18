import { useState, useEffect, ReactNode } from "react";
import { AuthContext, normalizeRole, type AppRole } from "@/hooks/useAuth";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("lms_student_id");
    const savedRole = normalizeRole(localStorage.getItem("lms_role"));

    if (id && savedRole) {
      setStudentId(id);
      setRole(savedRole);
    }

    setIsLoading(false);
  }, []);

  const loginUser = (id: string, rawRole: string) => {
    const normalizedRole = normalizeRole(rawRole) ?? "student";

    localStorage.setItem("lms_student_id", id);
    localStorage.setItem("lms_role", normalizedRole);
    setStudentId(id);
    setRole(normalizedRole);
  };

  const logoutUser = () => {
    localStorage.removeItem("lms_student_id");
    localStorage.removeItem("lms_role");
    setStudentId(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!studentId,
        isLoading,
        studentId,
        role,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
