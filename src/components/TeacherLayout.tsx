import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  Send,
  Upload,
  Megaphone,
  GraduationCap,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { logout } from "@/services/auth";

const sidebarLinks = [
  { path: "/teacher/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/teacher/attendance", icon: CalendarCheck, label: "Attendance" },
  { path: "/teacher/leave-requests", icon: Send, label: "Leave Requests" },
  { path: "/teacher/upload-resources", icon: Upload, label: "Upload Resources" },
  { path: "/teacher/upload-updates", icon: Megaphone, label: "Upload Updates" },
  { path: "/teacher/upload-exams", icon: GraduationCap, label: "Upload Exams" },
  { path: "/teacher/feedback", icon: MessageSquare, label: "Feedback" },
  { path: "/teacher/settings", icon: Settings, label: "Settings" },
];

export default function TeacherLayout() {
  const { isAuthenticated, isLoading, role, logoutUser } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== "teacher") return <Navigate to="/dashboard" replace />;

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    logoutUser();
    navigate("/login", { replace: true });
  };

  const NavContent = () => (
    <>
      <div className="p-5 border-b border-primary/20">
        <h1 className="text-lg font-heading font-bold text-primary-foreground">
          ✦ AI Builders
        </h1>
        <p className="text-xs text-primary-foreground/60 mt-0.5">Teacher Portal</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {sidebarLinks.map((link) => {
          const active = pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setMobileOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-primary-foreground/15 text-primary-foreground"
                  : "text-primary-foreground/60 hover:bg-primary-foreground/10 hover:text-primary-foreground/80"
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {link.label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-primary/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive-foreground/80 hover:bg-destructive/20 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-60 flex-col gradient-hero fixed inset-y-0 left-0 z-40">
        <NavContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col gradient-hero animate-slide-up">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-primary-foreground/60"
            >
              <X className="h-5 w-5" />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      <main className="flex-1 md:ml-60">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-sm font-heading font-bold">AI Builders</h1>
          <div className="w-5" />
        </div>
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
