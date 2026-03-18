import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getSessions, getSessionCourses, getStudentList, markAttendance } from "@/services/teacher";
import SkeletonCard from "@/components/SkeletonCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

export default function TeacherAttendance() {
  const { studentId: teacherId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSection, setSelectedSection] = useState("A");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!teacherId) return;

    getSessions(teacherId)
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setSessions(list);

        if (!selectedSession && list.length > 0) {
          const first = list[0];
          setSelectedSession(String(first.id || first.session_id || first.value || first.name || first.session_name || ""));
        }
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [teacherId, selectedSession]);

  useEffect(() => {
    if (!teacherId || !selectedSession) return;

    getSessionCourses(teacherId, selectedSession)
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setCourses(list);

        if (list.length === 1) {
          setSelectedCourse(String(list[0].course_id || list[0].id));
        }
      })
      .catch(() => setCourses([]));
  }, [selectedSession, teacherId]);

  useEffect(() => {
    if (!selectedCourse || !selectedSection) return;

    getStudentList(selectedCourse, selectedSection, date)
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setStudents(list);
        const init: Record<string, boolean> = {};
        list.forEach((s: any) => {
          init[s.id || s.student_id || s.roll_no] = false;
        });
        setChecked(init);
      })
      .catch(() => setStudents([]));
  }, [selectedCourse, selectedSection, date]);

  const courseName = useMemo(() => {
    const c = courses.find((course: any) => String(course.course_id || course.id) === selectedCourse);
    return c ? `${c.course_code || ""} ${c.course_title || c.course_name || ""}`.trim() : "";
  }, [courses, selectedCourse]);

  const toggleStudent = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const attendance = students.map((s: any) => ({
        student_id: s.id || s.student_id,
        status: checked[s.id || s.student_id || s.roll_no] ? "present" : "absent",
      }));
      await markAttendance(selectedCourse, selectedSection, date, JSON.stringify(attendance));
      toast({ title: "Success", description: "Attendance marked successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to submit attendance.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SkeletonCard count={3} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-xl font-heading font-bold">Attendance</h1>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold">SESSION</label>
        <select
          value={selectedSession}
          onChange={(e) => {
            setSelectedSession(e.target.value);
            setSelectedCourse("");
            setStudents([]);
          }}
          className="border border-input rounded-lg px-3 py-2 text-sm bg-background"
        >
          <option value="">Select One</option>
          {sessions.map((s: any) => {
            const value = s.id || s.session_id || s.value || s.name || s.session_name;
            const label = s.name || s.session_name || s.title || s.label || value;

            return (
              <option key={value} value={value}>
                {label}
              </option>
            );
          })}
        </select>
      </div>

      {courses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {courses.map((c: any) => {
            const cid = String(c.course_id || c.id);
            return (
              <button
                key={cid}
                onClick={() => setSelectedCourse(cid)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  selectedCourse === cid ? "gradient-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                {c.course_code || c.course_title || c.course_name}
              </button>
            );
          })}
        </div>
      )}

      {selectedCourse && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-primary">SELECT SECTION</span>
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSection(s)}
              className={cn(
                "w-9 h-9 rounded-full border-2 text-sm font-semibold transition-all flex items-center justify-center",
                selectedSection === s ? "border-primary bg-primary text-primary-foreground" : "border-primary/40 text-primary/60 hover:border-primary"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {selectedCourse && courseName && (
        <div className="flex items-center justify-between bg-card rounded-lg p-4 shadow-card">
          <div>
            <p className="text-lg font-bold">{courses.find((c: any) => String(c.course_id || c.id) === selectedCourse)?.course_code}</p>
            <span className="text-sm text-muted-foreground">{courseName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="gradient-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              SECTION {selectedSection}
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background"
            />
          </div>
        </div>
      )}

      {students.length > 0 && (
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="gradient-hero p-3">
            <h3 className="text-center font-heading font-bold text-primary-foreground">STUDENT LIST</h3>
          </div>
          <div className="bg-primary/90 grid grid-cols-[60px_1fr_1fr_60px] text-primary-foreground text-xs font-semibold p-3">
            <span>Serial No</span>
            <span>Roll number</span>
            <span>Student Name</span>
            <span className="text-center">Status</span>
          </div>
          {students.map((s: any, i: number) => {
            const key = s.id || s.student_id || s.roll_no;
            return (
              <div
                key={key}
                className={cn(
                  "grid grid-cols-[60px_1fr_1fr_60px] items-center p-3 text-sm border-b border-border",
                  !checked[key] && "bg-destructive/10"
                )}
              >
                <span className="text-muted-foreground">{i + 1}</span>
                <span className="bg-primary/80 text-primary-foreground px-2 py-0.5 rounded text-xs font-mono w-fit">{s.roll_no || s.roll_number}</span>
                <span>{s.name || s.student_name}</span>
                <div className="flex justify-center">
                  <Checkbox checked={checked[key] || false} onCheckedChange={() => toggleStudent(key)} />
                </div>
              </div>
            );
          })}

          <div className="p-4 flex flex-wrap gap-3 justify-center border-t border-border">
            <Button onClick={handleSubmit} disabled={submitting} className="gradient-primary text-primary-foreground">
              {submitting ? "Submitting..." : "Submit Attendance"}
            </Button>
            <Button variant="outline" onClick={() => navigate?.("/teacher/attendance")}>
              Report
            </Button>
            <Button variant="outline" className="text-warning border-warning">
              Report for LMS
            </Button>
            <Button variant="outline" className="text-success border-success">
              Today's Report
            </Button>
          </div>
        </div>
      )}

      {selectedCourse && students.length === 0 && <p className="text-center text-muted-foreground py-8">No students found for this selection.</p>}
      {selectedSession && courses.length === 0 && <p className="text-center text-muted-foreground py-8">No courses found for this faculty account.</p>}
    </div>
  );
}
