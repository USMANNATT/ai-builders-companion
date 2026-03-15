import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getStudentName, getStudentSubjects, fetchLeaves } from "@/services/dashboard";
import { getStudentAttendance } from "@/services/attendance";
import SkeletonCard from "@/components/SkeletonCard";
import { BookOpen, FileText, BarChart3, ClipboardList, Bell } from "lucide-react";

export default function Dashboard() {
  const { studentId } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [courseCount, setCourseCount] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    Promise.all([
      getStudentName(studentId),
      getStudentSubjects(studentId),
      fetchLeaves(studentId),
      getStudentAttendance(studentId),
    ]).then(([nameRes, coursesRes, leavesRes, attRes]) => {
      setName(nameRes?.name || "Student");
      setRollNo(nameRes?.roll_no || "");
      setCourseCount(Array.isArray(coursesRes) ? coursesRes.length : 0);
      const leaves = Array.isArray(leavesRes) ? leavesRes : [];
      setPendingLeaves(leaves.filter((l: any) => l.status?.toLowerCase() === "pending").length);
      setAttendance(Array.isArray(attRes) ? attRes : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [studentId]);

  const overallAttendance = useMemo(() => {
    if (attendance.length === 0) return 0;
    const totalC = attendance.reduce((s, c) => s + Number(c.total_classes || 0), 0);
    const attendedC = attendance.reduce((s, c) => s + Number(c.attended_classes || 0), 0);
    return totalC > 0 ? Math.round((attendedC / totalC) * 100) : 0;
  }, [attendance]);

  if (loading) return <div className="p-4 pt-12"><SkeletonCard count={4} /></div>;

  const quickLinks = [
    { label: "Courses", icon: BookOpen, path: "/courses", color: "gradient-primary" },
    { label: "Resources", icon: FileText, path: "/resources", color: "gradient-blue" },
    { label: "Results", icon: BarChart3, path: "/results", color: "gradient-primary" },
    { label: "Leave", icon: ClipboardList, path: "/leave", color: "gradient-blue" },
    { label: "Announcements", icon: Bell, path: "/announcements", color: "gradient-primary" },
  ];

  return (
    <div className="px-4 pt-12 pb-4 max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* Welcome */}
      <div className="gradient-hero rounded-lg p-5 text-primary-foreground">
        <p className="text-sm opacity-80">Welcome back,</p>
        <h1 className="text-xl font-heading font-bold">{name}</h1>
        {rollNo && <p className="text-xs mt-1 opacity-70">{rollNo}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-lg p-4 shadow-card text-center">
          <p className="text-2xl font-bold text-primary">{courseCount}</p>
          <p className="text-xs text-muted-foreground">Enrolled Courses</p>
        </div>
        <div className="bg-card rounded-lg p-4 shadow-card text-center">
          <p className="text-2xl font-bold text-warning">{pendingLeaves}</p>
          <p className="text-xs text-muted-foreground">Pending Leaves</p>
        </div>
      </div>

      {/* Attendance */}
      {attendance.length > 0 && (
        <button onClick={() => navigate("/attendance")} className="w-full text-left bg-card rounded-lg p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Attendance</p>
            <span className={`text-xs font-bold ${overallAttendance >= 75 ? "text-success" : overallAttendance >= 60 ? "text-warning" : "text-destructive"}`}>
              {overallAttendance}%
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${overallAttendance >= 75 ? "bg-success" : overallAttendance >= 60 ? "bg-warning" : "bg-destructive"}`}
              style={{ width: `${Math.min(overallAttendance, 100)}%` }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {attendance.slice(0, 4).map((c: any) => {
              const pct = parseFloat(c.attendance_percentage || "0");
              return (
                <div key={c.course_id || c.id} className="flex-shrink-0 bg-muted rounded-md px-2.5 py-1.5 text-center min-w-[4rem]">
                  <p className={`text-xs font-bold ${pct >= 75 ? "text-success" : pct >= 60 ? "text-warning" : "text-destructive"}`}>{pct.toFixed(0)}%</p>
                  <p className="text-[9px] text-muted-foreground truncate">{c.course_code}</p>
                </div>
              );
            })}
          </div>
        </button>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Quick Access</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickLinks.map((ql) => (
            <button
              key={ql.path}
              onClick={() => navigate(ql.path)}
              className={`${ql.color} rounded-lg p-3 flex flex-col items-center gap-1.5 text-primary-foreground transition-transform active:scale-95`}
            >
              <ql.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{ql.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
