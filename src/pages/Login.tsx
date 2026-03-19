import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth, normalizeRole } from "@/hooks/useAuth";
import { login } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { isAuthenticated, isLoading, role, loginUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) {
    return <Navigate to={role === "teacher" ? "/teacher/dashboard" : "/dashboard"} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    try {
      const res = await login(username.trim(), password);
      if (res.status === "ALLOK") {
        const normalizedRole = normalizeRole(res.role) ?? "student";
        const authId = normalizedRole === "teacher"
          ? String(res.facid ?? res.facultyid ?? res.faculty_id ?? res.id ?? "")
          : String(res.id ?? "");

        if (!authId) {
          toast({
            title: "Login Failed",
            description: "Missing account id from server response.",
            variant: "destructive",
          });
          return;
        }

        loginUser(authId, normalizedRole);
        navigate(normalizedRole === "teacher" ? "/teacher/dashboard" : "/dashboard", { replace: true });
      } else {
        toast({
          title: "Login Failed",
          description: res.status === "WRONG PASSWORD" ? "Incorrect password." : res.message || res.status,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Could not connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gradient-hero">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <LogIn className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-primary-foreground">AI Builders LMS</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-lg p-6 shadow-card space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Username</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" autoComplete="username" />
          </div>
          <div className="relative">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
            <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" autoComplete="current-password" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-[calc(50%+4px)] text-muted-foreground">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
