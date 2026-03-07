import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getStudentAttendance } from "@/services/attendance";
import SkeletonCard from "@/components/SkeletonCard";

const percentColor = (p: number) => {
  if (p >= 75) return "text-success";
  if (p >= 60) return "text-warning";
  return "text-destructive";
};

const barColor = (p: number) => {
  if (p >= 75) return "bg-success";
  if (p >= 60) return "bg-warning";
  return "bg-destructive";
};

export default function Attendance() {
  const { studentId } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    getStudentAttendance(studentId)
      .then((res) => setCourses(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div className="p-4 pt-12"><SkeletonCard /></div>;

  return (
    <div className="px-4 pt-12 pb-4 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-lg font-heading font-bold mb-4">Attendance</h1>
      {courses.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No attendance data found.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((c: any) => {
            const pct = parseFloat(c.attendance_percentage || "0");
            return (
              <div key={c.course_id || c.id} className="bg-card rounded-lg p-4 shadow-card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">{c.course_name}</p>
                    <p className="text-xs text-muted-foreground">{c.course_code}</p>
                  </div>
                  <p className={`text-lg font-bold ${percentColor(pct)}`}>{pct.toFixed(0)}%</p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {c.attended_classes} / {c.total_classes} classes attended
                </p>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
