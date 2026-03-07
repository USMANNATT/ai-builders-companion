import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getStudentSubjects } from "@/services/dashboard";
import { getStudentResults } from "@/services/exams";
import SkeletonCard from "@/components/SkeletonCard";
import StatusBadge from "@/components/StatusBadge";

const gradeColor = (g: string): "success" | "info" | "warning" | "danger" => {
  if (g?.startsWith("A")) return "success";
  if (g?.startsWith("B")) return "info";
  if (g?.startsWith("C")) return "warning";
  return "danger";
};

export default function Results() {
  const { studentId } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    getStudentSubjects(studentId).then((res) => setCourses(Array.isArray(res) ? res : []));
  }, [studentId]);

  useEffect(() => {
    if (!selectedCourse || !studentId) return;
    setLoading(true);
    getStudentResults(studentId, selectedCourse)
      .then((res) => setData(res?.status === "ALLOK" ? res : null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selectedCourse, studentId]);

  return (
    <div className="px-4 pt-12 pb-4 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-lg font-heading font-bold mb-3">Results</h1>

      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="w-full bg-card border border-border rounded-md p-2.5 text-sm mb-4"
      >
        <option value="">Select course</option>
        {courses.map((c: any) => (
          <option key={c.course_id || c.id} value={c.course_id || c.id}>
            {c.course_title || c.course_name || c.name}
          </option>
        ))}
      </select>

      {loading ? <SkeletonCard /> : !data ? (
        <p className="text-center text-muted-foreground py-12">{selectedCourse ? "No results found." : "Select a course to view results."}</p>
      ) : (
        <div className="space-y-3">
          {data.results?.map((r: any, i: number) => (
            <div key={i} className="bg-card rounded-lg p-4 shadow-card flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">{r.exam_type}</p>
                <p className="text-xs text-muted-foreground">{r.date}</p>
              </div>
              <p className="font-bold text-primary">{r.marks_obtained}/{r.total_marks}</p>
            </div>
          ))}
          {data.overall && (
            <div className="bg-card rounded-lg p-4 shadow-card border-2 border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Overall</p>
              <div className="flex justify-between items-center">
                <p className="font-bold text-lg">{data.overall.percentage}%</p>
                <StatusBadge variant={gradeColor(data.overall.grade)} label={data.overall.grade} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{data.overall.total_obtained}/{data.overall.total_marks}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
