import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getStudentAttendance } from "@/services/attendance";
import SkeletonCard from "@/components/SkeletonCard";

const statusLabel = (p: number) => {
  if (p >= 75) return "On Track";
  if (p >= 60) return "Below 75% — attend more";
  return "Critical — Attend More Classes";
};

const ringColor = (p: number) => {
  if (p >= 75) return "stroke-success";
  if (p >= 60) return "stroke-warning";
  return "stroke-destructive";
};

const textColor = (p: number) => {
  if (p >= 75) return "text-success";
  if (p >= 60) return "text-warning";
  return "text-destructive";
};

function CircularProgress({ percentage, size = 56 }: { percentage: number; size?: number }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-muted" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className={ringColor(percentage)}
      />
    </svg>
  );
}

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

  const overall = useMemo(() => {
    if (courses.length === 0) return 0;
    const totalC = courses.reduce((s, c) => s + Number(c.total_classes || 0), 0);
    const attendedC = courses.reduce((s, c) => s + Number(c.attended_classes || 0), 0);
    return totalC > 0 ? Math.round((attendedC / totalC) * 100) : 0;
  }, [courses]);

  if (loading) return <div className="p-4 pt-12"><SkeletonCard /></div>;

  return (
    <div className="px-4 pt-12 pb-4 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-heading font-bold">My Attendance</h1>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${textColor(overall)} border-current`}>
          Avg {overall}%
        </span>
      </div>

      {/* Overall card */}
      {courses.length > 0 && (
        <div className="bg-card rounded-lg p-4 shadow-card mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Overall Attendance</p>
            <p className={`text-xl font-bold ${textColor(overall)}`}>{overall}%</p>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full ${overall >= 75 ? "bg-success" : overall >= 60 ? "bg-warning" : "bg-destructive"}`}
              style={{ width: `${Math.min(overall, 100)}%` }}
            />
          </div>
          <p className={`text-xs ${textColor(overall)}`}>{statusLabel(overall)}</p>
        </div>
      )}

      {courses.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No attendance data found.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((c: any) => {
            const pct = parseFloat(c.attendance_percentage || "0");
            return (
              <div key={c.course_id || c.id} className="bg-card rounded-lg p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${textColor(pct)} bg-muted`}>
                      {c.course_code}
                    </span>
                    <p className="font-semibold text-sm mt-1">{c.course_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.attended_classes} / {c.total_classes} classes attended
                    </p>
                    <p className={`text-xs mt-1 ${textColor(pct)}`}>{statusLabel(pct)}</p>
                    {pct < 75 && (() => {
                      const attended = Number(c.attended_classes || 0);
                      const total = Number(c.total_classes || 0);
                      // Fixed semester total: need 75% of total_classes
                      const needed = Math.ceil(0.75 * total) - attended;
                      return needed > 0 ? (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Need {needed} more classes for 75%
                        </p>
                      ) : null;
                    })()}
                  </div>
                  <div className="relative shrink-0 flex items-center justify-center">
                    <CircularProgress percentage={pct} />
                    <span className={`absolute text-xs font-bold ${textColor(pct)}`}>{pct.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}