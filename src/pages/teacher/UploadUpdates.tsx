import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getTeacherCourses, publishUpdate } from "@/services/teacher";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SkeletonCard from "@/components/SkeletonCard";

const UPDATE_TYPES = ["Announcement", "Assignment", "Quiz", "Exam", "Other"];

export default function TeacherUploadUpdates() {
  const { studentId: teacherId } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [updateType, setUpdateType] = useState("Announcement");
  const [message, setMessage] = useState("");

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });

  useEffect(() => {
    if (!teacherId) return;
    getTeacherCourses(teacherId)
      .then((res) => setCourses(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teacherId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !message.trim()) {
      toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await publishUpdate({
        teacher_id: teacherId || "",
        course_id: selectedCourse,
        update_type: updateType,
        message,
      });
      toast({ title: "Success", description: "Update published." });
      setMessage("");
    } catch {
      toast({ title: "Error", description: "Failed to publish update.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SkeletonCard count={2} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-xl font-heading font-bold text-primary">Upload Updates</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 shadow-card space-y-4">
          <h2 className="font-heading font-bold text-lg">Create Update</h2>

          <div>
            <label className="text-sm font-semibold block mb-1">Select Subject</label>
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
            <label className="text-sm font-semibold block mb-1">Update Type</label>
            <select value={updateType} onChange={(e) => setUpdateType(e.target.value)} className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background">
              {UPDATE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1">Date</label>
            <div className="border border-input rounded-lg px-3 py-2 text-sm bg-muted">{dateStr}</div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1">Current Time</label>
            <div className="border border-input rounded-lg px-3 py-2 text-sm bg-muted">{timeStr}</div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1">Update Message</label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write update details here..." rows={5} />
          </div>

          <Button type="submit" disabled={submitting} className="w-full gradient-primary text-primary-foreground">
            {submitting ? "Publishing..." : "Publish Update"}
          </Button>
        </form>

        {/* Preview */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h2 className="font-heading font-bold text-lg mb-4">Preview</h2>
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                {updateType.toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground">
                {now.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {message || "Your update preview will appear here..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
