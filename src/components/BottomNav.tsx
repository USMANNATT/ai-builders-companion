import { useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, FolderOpen, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/courses", icon: BookOpen, label: "Courses" },
  { path: "/resources", icon: FolderOpen, label: "Resources" },
  { path: "/results", icon: BarChart3, label: "Results" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-2 left-2 right-2 z-50 bg-card border border-border rounded-2xl shadow-card">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
