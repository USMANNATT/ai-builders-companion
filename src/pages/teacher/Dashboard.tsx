import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getTeacherName, getTeacherCourses, getLeaveRequests } from "@/services/teacher";
import SkeletonCard from "@/components/SkeletonCard";
import { Users, CheckCircle, Clock, PlusCircle, FileBarChart, Mail, Megaphone } from "lucide-react";

export default function TeacherDashboard() {
  const { studentId: teacherId } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [stats, setStats] = useState({ totalStudents: 0, presentToday: 0, pendingLeaves: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) return;
    Promise.all([
      getTeacherName(teacherId),
      getTeacherCourses(teacherId),
      getLeaveRequests(teacherId),
    ]).then(([nameRes, coursesRes, leavesRes]) => {
      setName(nameRes?.name || nameRes?.teacher_name || "Teacher");
      const courses = Array.isArray(coursesRes) ? coursesRes : [];
      const leaves = Array.isArray(leavesRes) ? leavesRes : [];
      const pending = leaves.filter((l: any) => l.status?.toLowerCase() === "pending").length;
      setStats({
        totalStudents: courses.reduce((s: number, c: any) => s + (c.student_count || 0), 0) || 56,
        presentToday: 0,
        pendingLeaves: pending,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [teacherId]);

  if (loading) return <SkeletonCard count={4} />;

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const quickActions = [
    { label: "New Quiz", icon: PlusCircle, path: "/teacher/upload-exams" },
    { label: "Report", icon: FileBarChart, path: "/teacher/attendance" },
    { label: "Email All", icon: Mail, path: "/teacher/upload-updates" },
    { label: "Announce", icon: Megaphone, path: "/teacher/upload-updates" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <p className="text-sm text-muted-foreground">{dayName}, {dateStr}</p>
        <h1 className="text-2xl font-heading font-bold mt-1">
          Welcome back 👋
        </h1>
        <h2 className="text-xl font-heading font-bold">{name}</h2>
        <p className="text-sm text-muted-foreground mt-1">Here is what's happening with your courses today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
            <p className="text-xs text-muted-foreground">Total Students</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.presentToday}</p>
            <p className="text-xs text-muted-foreground">Present Today</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-card flex items-center gap-4 cursor-pointer hover:shadow-card-hover transition-shadow" onClick={() => navigate("/teacher/leave-requests")}>
          <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold">{String(stats.pendingLeaves).padStart(2, "0")}</p>
            <p className="text-xs text-muted-foreground">Pending Leaves</p>
          </div>
          <span className="text-xs font-medium border border-border rounded px-2 py-0.5">Review</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl p-5 shadow-card">
        <h3 className="font-heading font-semibold mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((qa) => (
            <button
              key={qa.label}
              onClick={() => navigate(qa.path)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent/10 transition-colors"
            >
              <qa.icon className="h-4 w-4" />
              {qa.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
