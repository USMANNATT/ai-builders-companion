import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/services/auth";
import { getTeacherName } from "@/services/teacher";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function TeacherSettings() {
  const { studentId: teacherId, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");

  useEffect(() => {
    if (!teacherId) return;
    getTeacherName(teacherId).then((res) => {
      setName(res?.name || res?.teacher_name || "Teacher");
    }).catch(() => {});
  }, [teacherId]);

  const handleLogout = async () => {
    try { await logout(); } catch {}
    logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-md">
      <h1 className="text-xl font-heading font-bold">Settings</h1>

      <div className="bg-card rounded-xl p-6 shadow-card text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-3">
          <User className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-lg font-heading font-bold">{name}</h2>
        <p className="text-sm text-muted-foreground">Teacher</p>
      </div>

      <Button onClick={handleLogout} variant="destructive" className="w-full">
        <LogOut className="h-4 w-4 mr-2" /> Sign Out
      </Button>
    </div>
  );
}
