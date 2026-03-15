import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUpdates } from "@/services/announcements";
import SkeletonCard from "@/components/SkeletonCard";
import { Bell } from "lucide-react";

export default function Announcements() {
  const { studentId } = useAuth();
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    if (!studentId) return;
    getUpdates(studentId)
      .then((res) => setUpdates(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  const courses = useMemo(() => {
    const map = new Map<string, string>();
    updates.forEach((u) => {
      const key = u.course_code || u.course_title;
      if (key) map.set(key, `${u.course_title} (${u.course_code})`);
    });
    return Array.from(map, ([key, label]) => ({ key, label }));
  }, [updates]);

  const filtered = selectedCourse
    ? updates.filter((u) => (u.course_code || u.course_title) === selectedCourse)
    : updates;

  if (loading) return <div className="p-4 pt-12"><SkeletonCard /></div>;

  return (
    <div className="px-4 pt-12 pb-4 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-lg font-heading font-bold mb-3">Announcements</h1>

      {courses.length > 0 && (
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full bg-card border border-border rounded-md p-2.5 text-sm mb-4"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No announcements yet.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((u: any, i: number) => (
            <div key={i} className="bg-card rounded-lg p-4 shadow-card">
              <div className="flex items-start gap-3">
                <div className="gradient-primary rounded-md p-2 shrink-0">
                  <Bell className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{u.update_type}</p>
                  <p className="text-xs text-muted-foreground mt-1">{u.update_message}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{u.update_date} {u.update_time} • {u.course_title} ({u.course_code})</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}