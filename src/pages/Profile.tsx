import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/services/auth";
import { getStudentName } from "@/services/dashboard";
import { Button } from "@/components/ui/button";
import { LogOut, ClipboardList, Bell, User } from "lucide-react";

export default function Profile() {
  const { studentId, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");

  useEffect(() => {
    if (!studentId) return;
    getStudentName(studentId).then((res) => {
      setName(res?.name || "Student");
      setRollNo(res?.roll_no || "");
    });
  }, [studentId]);

  const handleLogout = async () => {
    try { await logout(); } catch {}
    logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <div className="px-4 pt-12 pb-4 max-w-lg mx-auto animate-fade-in space-y-5">
      <div className="bg-card rounded-lg p-5 shadow-card text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-3">
          <User className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-lg font-heading font-bold">{name}</h1>
        <p className="text-sm text-muted-foreground">{rollNo}</p>
      </div>

      <div className="space-y-2">
        <button onClick={() => navigate("/leave")} className="w-full bg-card rounded-lg p-4 shadow-card flex items-center gap-3 active:scale-[0.98] transition-transform">
          <ClipboardList className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">Leave Application</span>
        </button>
        <button onClick={() => navigate("/announcements")} className="w-full bg-card rounded-lg p-4 shadow-card flex items-center gap-3 active:scale-[0.98] transition-transform">
          <Bell className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">Announcements</span>
        </button>
        <button onClick={() => navigate("/attendance")} className="w-full bg-card rounded-lg p-4 shadow-card flex items-center gap-3 active:scale-[0.98] transition-transform">
          <User className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">Attendance</span>
        </button>
      </div>

      <Button onClick={handleLogout} variant="destructive" className="w-full">
        <LogOut className="h-4 w-4 mr-2" /> Sign Out
      </Button>
    </div>
  );
}
