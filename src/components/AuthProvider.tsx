import { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "@/hooks/useAuth";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("lms_student_id");
    const r = localStorage.getItem("lms_role");
    if (id && r) {
      setStudentId(id);
      setRole(r);
    }
  }, []);

  const loginUser = (id: string, r: string) => {
    localStorage.setItem("lms_student_id", id);
    localStorage.setItem("lms_role", r);
    setStudentId(id);
    setRole(r);
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
