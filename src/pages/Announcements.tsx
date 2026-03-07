import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUpdates } from "@/services/announcements";
import SkeletonCard from "@/components/SkeletonCard";
import { Bell } from "lucide-react";

export default function Announcements() {
  const { studentId } = useAuth();
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    getUpdates(studentId)
      .then((res) => setUpdates(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div className="p-4 pt-12"><SkeletonCard /></div>;

  return (
    <div className="px-4 pt-12 pb-4 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-lg font-heading font-bold mb-4">Announcements</h1>
      {updates.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No announcements yet.</p>
      ) : (
        <div className="space-y-3">
          {updates.map((u: any, i: number) => (
            <div key={i} className="bg-card rounded-lg p-4 shadow-card">
              <div className="flex items-start gap-3">
                <div className="gradient-primary rounded-md p-2 shrink-0">
                  <Bell className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{u.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{u.message || u.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{u.date || u.created_at} • {u.course_name || u.course || ""}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
