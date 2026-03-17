import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getTeacherCourses, publishResult } from "@/services/teacher";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import SkeletonCard from "@/components/SkeletonCard";

const ASSESSMENT_TYPES = ["Quiz 1", "Quiz 2", "Quiz 3", "Quiz 4", "Assignment 1", "Assignment 2", "Assignment 3", "Assignment 4", "Midterm", "Final", "Lab", "Project", "Other"];

export default function TeacherUploadExams() {
  const { studentId: teacherId } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [assessmentType, setAssessmentType] = useState("Quiz 1");
  const [totalMarks, setTotalMarks] = useState("100");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!teacherId) return;
    getTeacherCourses(teacherId)
      .then((res) => setCourses(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teacherId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !file) {
      toast({ title: "Error", description: "Please select a course and upload a file.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("action", "publishResult");
      formData.append("teacher_id", teacherId || "");
      formData.append("course_id", selectedCourse);
      formData.append("assessment_type", assessmentType);
      formData.append("total_marks", totalMarks);
      formData.append("message", message || " ");
      formData.append("file", file);

      await publishResult(formData);
      toast({ title: "Success", description: "Result published." });
      setFile(null); setMessage("");
    } catch {
      toast({ title: "Error", description: "Failed to publish result.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SkeletonCard count={2} />;

  return (
    <div className="space-y-5 animate-fade-in max-w-xl">
      <h1 className="text-xl font-heading font-bold text-primary">Upload Exam Results</h1>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 shadow-card space-y-4">
        <h2 className="font-heading font-bold text-lg">Create Result</h2>

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
          <label className="text-sm font-semibold block mb-1">Assessment Type</label>
          <select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)} className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background">
            {ASSESSMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">Total Marks</label>
          <Input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">Upload Results</label>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
          <p className="text-xs text-muted-foreground mt-1">Upload an Excel file</p>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">Exams Message</label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write exam details here..." rows={4} />
        </div>

        <Button type="submit" disabled={submitting} className="w-full gradient-primary text-primary-foreground">
          {submitting ? "Publishing..." : "Publish Result"}
        </Button>
      </form>
    </div>
  );
}
