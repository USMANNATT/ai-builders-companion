import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getStudentSubjects } from "@/services/dashboard";
import SkeletonCard from "@/components/SkeletonCard";
import { BookOpen } from "lucide-react";

export default function Courses() {
  const { studentId } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    getStudentSubjects(studentId)
      .then((res) => setCourses(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div className="p-4 pt-12"><SkeletonCard /></div>;

  return (
    <div className="px-4 pt-12 pb-4 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-lg font-heading font-bold mb-4">My Courses</h1>
      {courses.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No courses enrolled.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((c: any) => (
            <button
              key={c.course_id || c.id}
              onClick={() => navigate(`/resources?course_id=${c.course_id || c.id}`)}
              className="w-full bg-card rounded-lg p-4 shadow-card text-left transition-all active:scale-[0.98] hover:shadow-card-hover flex items-start gap-3"
            >
              <div className="gradient-primary rounded-md p-2 shrink-0">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{c.course_title || c.course_name || c.name}</p>
                <p className="text-xs text-muted-foreground">{c.course_code || c.code || ""}</p>
                {c.teacher_name && <p className="text-xs text-muted-foreground mt-0.5">{c.teacher_name}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
