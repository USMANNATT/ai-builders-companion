import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getStudentInfo, getLeaveSubjects, submitLeave, fetchLeaveHistory } from "@/services/leave";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/StatusBadge";
import SkeletonCard from "@/components/SkeletonCard";

export default function Leave() {
  const { studentId } = useAuth();
  const { toast } = useToast();
  const [rollNo, setRollNo] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [courseId, setCourseId] = useState("");
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (!studentId) return;
    Promise.all([
      getStudentInfo(studentId),
      getLeaveSubjects(studentId),
      fetchLeaveHistory(studentId),
    ]).then(([info, subs, hist]) => {
      setRollNo(info?.roll_no || "");
      setSubjects(Array.isArray(subs) ? subs : []);
      setHistory(Array.isArray(hist) ? hist : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !reason.trim() || !fromDate || !toDate) {
      toast({ title: "Missing fields", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitLeave({ roll_no: rollNo, course_id: courseId, reason: reason.trim(), from_date: fromDate, to_date: toDate });
      if (res?.status === "ALLOK") {
        toast({ title: "Leave submitted successfully!" });
        setReason(""); setCourseId(""); setFromDate(""); setToDate("");
        fetchLeaveHistory(studentId!).then((h) => setHistory(Array.isArray(h) ? h : []));
      } else {
        toast({ title: "Error", description: res?.message || "Failed to submit.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network Error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const badgeVariant = (s: string) => {
    const lower = s?.toLowerCase();
    if (lower === "approved") return "success" as const;
    if (lower === "rejected") return "danger" as const;
    return "pending" as const;
  };

  if (loading) return <div className="p-4 pt-12"><SkeletonCard /></div>;

  return (
    <div className="px-4 pt-12 pb-4 max-w-lg mx-auto animate-fade-in space-y-6">
      <h1 className="text-lg font-heading font-bold">Leave Application</h1>

      <form onSubmit={handleSubmit} className="bg-card rounded-lg p-4 shadow-card space-y-3">
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full border border-border rounded-md p-2.5 text-sm bg-card">
          <option value="">Select Subject</option>
          {subjects.map((s: any) => (
            <option key={s.course_id || s.id} value={s.course_id || s.id}>{s.course_title || s.course_name || s.name}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <Textarea placeholder="Reason for leave..." value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Leave"}
        </Button>
      </form>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Leave History</h2>
        {history.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No leave applications.</p>
        ) : (
          <div className="space-y-3">
            {history.map((h: any, i: number) => (
              <div key={i} className="bg-card rounded-lg p-4 shadow-card flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{h.course_name || h.subject}</p>
                  <p className="text-xs text-muted-foreground">{h.from_date} — {h.to_date}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{h.reason}</p>
                </div>
                <StatusBadge variant={badgeVariant(h.status)} label={h.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
