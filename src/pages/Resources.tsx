import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getStudentSubjects } from "@/services/dashboard";
import { getSubjectResources } from "@/services/resources";
import { UPLOADS_URL } from "@/constants/urls";
import SkeletonCard from "@/components/SkeletonCard";
import { Download, ExternalLink, FileText, Video, Link as LinkIcon } from "lucide-react";

export default function Resources() {
  const { studentId } = useAuth();
  const [params] = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState(params.get("course_id") || "");
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    getStudentSubjects(studentId).then((res) => {
      const list = Array.isArray(res) ? res : [];
      setCourses(list);
      if (!selectedCourse && list.length > 0) setSelectedCourse(String(list[0].course_id || list[0].id));
    });
  }, [studentId]);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    getSubjectResources(selectedCourse)
      .then((res) => setResources(Array.isArray(res) ? res : []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  const iconFor = (type: string) => {
    const t = type?.toUpperCase();
    if (t === "VIDEO") return Video;
    if (t === "LINK") return LinkIcon;
    return FileText;
  };

  return (
    <div className="px-4 pt-12 pb-4 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-lg font-heading font-bold mb-3">Resources</h1>

      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="w-full bg-card border border-border rounded-md p-2.5 text-sm mb-4"
      >
        <option value="">Select course</option>
        {courses.map((c: any) => (
          <option key={c.course_id || c.id} value={c.course_id || c.id}>
            {c.course_name || c.name} ({c.course_code || c.code})
          </option>
        ))}
      </select>

      {loading ? <SkeletonCard /> : resources.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No resources available.</p>
      ) : (
        <div className="space-y-3">
          {resources.map((r: any) => {
            const Icon = iconFor(r.resource_type);
            const isFile = ["PDF", "DOCX"].includes(r.resource_type?.toUpperCase());
            const url = isFile ? `${UPLOADS_URL}${r.file_path}` : r.external_link;
            return (
              <div key={r.resource_id} className="bg-card rounded-lg p-4 shadow-card flex items-start gap-3">
                <div className="gradient-blue rounded-md p-2 shrink-0">
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{r.title}</p>
                  {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{r.uploaded_at}</p>
                </div>
                <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 gradient-primary rounded-md p-2 text-primary-foreground">
                  {isFile ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
