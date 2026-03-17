import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getTeacherCourses, uploadResource } from "@/services/teacher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SkeletonCard from "@/components/SkeletonCard";

const RESOURCE_TYPES = ["Notes", "Assignment", "Lab Manual", "Slides", "Other"];
const VISIBILITY_OPTIONS = ["Published", "Draft"];

export default function TeacherUploadResources() {
  const { studentId: teacherId } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [resourceType, setResourceType] = useState("Notes");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [externalLink, setExternalLink] = useState("");
  const [visibility, setVisibility] = useState("Published");

  useEffect(() => {
    if (!teacherId) return;
    getTeacherCourses(teacherId)
      .then((res) => setCourses(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teacherId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !title.trim()) {
      toast({ title: "Error", description: "Please fill required fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("action", "uploadResource");
      formData.append("teacher_id", teacherId || "");
      formData.append("course_id", selectedCourse);
      formData.append("resource_type", resourceType);
      formData.append("title", title);
      formData.append("description", description || " ");
      formData.append("visibility", visibility.toLowerCase());
      formData.append("external_link", externalLink || "");
      if (file) formData.append("file", file);

      await uploadResource(formData);
      toast({ title: "Success", description: "Resource uploaded successfully." });
      setTitle(""); setDescription(""); setFile(null); setExternalLink("");
    } catch {
      toast({ title: "Error", description: "Failed to upload resource.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SkeletonCard count={2} />;

  return (
    <div className="space-y-5 animate-fade-in max-w-xl">
      <h1 className="text-xl font-heading font-bold text-primary">📦 Upload Course Resource</h1>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 shadow-card space-y-4">
        <div>
          <label className="text-sm font-semibold block mb-1">Course</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background">
            <option value="">Select Course</option>
            {courses.map((c: any) => (
              <option key={c.course_id || c.id} value={c.course_id || c.id}>
                {c.course_code || ""} - {c.course_title || c.course_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">Resource Type</label>
          <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-primary border-primary">
            {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resource title" />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Resource description" />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">Upload File</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">OR External Link</label>
          <Input value={externalLink} onChange={(e) => setExternalLink(e.target.value)} placeholder="https://" />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">Visibility</label>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background">
            {VISIBILITY_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <Button type="submit" disabled={submitting} className="w-full gradient-primary text-primary-foreground">
          {submitting ? "Uploading..." : "Upload Resource"}
        </Button>
      </form>
    </div>
  );
}
