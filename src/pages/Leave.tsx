import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getStudentInfo, getLeaveSubjects, submitLeave, fetchLeaveHistory } from "@/services/leave";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/StatusBadge";
import SkeletonCard from "@/components/SkeletonCard";
import { Building2, FileText, Printer, Send } from "lucide-react";

const LEAVE_REASONS = [
  "Medical Leave",
  "Family Emergency",
  "Official Duty",
  "Personal Reason",
  "Other",
];

export default function Leave() {
  const { studentId } = useAuth();
  const { toast } = useToast();
  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [reasonType, setReasonType] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [description, setDescription] = useState("");

  const totalDays = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [fromDate, toDate]);

  useEffect(() => {
    if (!studentId) return;
    Promise.all([
      getStudentInfo(studentId),
      getLeaveSubjects(studentId),
      fetchLeaveHistory(studentId),
    ]).then(([info, subs, hist]) => {
      setStudentName(info?.name || info?.student_name || "Student");
      setRollNo(info?.roll_no || info?.rollNumber || "");
      // subs may be array directly or nested
      const subList = Array.isArray(subs) ? subs : [];
      setSubjects(Array.isArray(subs) ? subs : []);
      setHistory(Array.isArray(hist) ? hist : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [studentId]);

  const toggleSubject = (cid: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(cid) ? prev.filter((id) => id !== cid) : [...prev, cid]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjects.length === 0 || !reasonType || !fromDate || !toDate) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // Build selectedCourses array with faculty_id for each
      const selectedCourses = selectedSubjects.map((cid) => {
        const sub = subjects.find((s: any) => String(s.course_id ?? s.id) === cid);
        return {
          course_id: Number(cid),
          faculty_id: Number(sub?.teacher_id || sub?.faculty_id || 0),
        };
      });

      const res = await submitLeave({
        roll_no: rollNo,
        selectedCourses,
        reason: reasonType,
        description: description.trim() || reasonType,
        hospital_name: hospitalName.trim() || " ",
        from_date: fromDate,
        to_date: toDate,
      });
      if (res?.status === "ALLOK") {
        toast({ title: "Leave submitted successfully!" });
        setSelectedSubjects([]);
        setReasonType("");
        setHospitalName("");
        setDescription("");
        setFromDate("");
        setToDate("");
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
    <div className="px-4 pt-12 pb-24 max-w-lg mx-auto animate-fade-in space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="mx-auto w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-2">
          <Building2 className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-lg font-heading font-bold">UET Leave Application</h1>
        <p className="text-xs text-muted-foreground">Submit your leave request below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Student Information */}
        <section className="space-y-2">
          <h2 className="text-sm font-heading font-bold flex items-center gap-2">
            <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">1</span>
            Student Information
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium">Full Name</label>
              <Input value={studentName} readOnly className="mt-1 bg-muted/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Roll Number</label>
              <Input value={rollNo} readOnly className="mt-1 bg-muted/50" />
            </div>
          </div>
        </section>

        {/* 2. Select Subjects */}
        <section className="space-y-2">
          <h2 className="text-sm font-heading font-bold flex items-center gap-2">
            <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">2</span>
            Select Subject(s)
          </h2>
          <p className="text-[11px] text-muted-foreground">Click on one or more subjects to apply leave for them.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {subjects.map((s: any) => {
              const cid = String(s.course_id ?? s.id);
              const selected = selectedSubjects.includes(cid);
              return (
                <button
                  key={cid}
                  type="button"
                  onClick={() => toggleSubject(cid)}
                  className={`rounded-lg border p-2.5 text-left transition-all ${
                    selected
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <p className="text-[10px] font-semibold text-primary">{s.course_code || ""}</p>
                  <p className="text-xs font-medium leading-tight">{s.course_title || s.course_name || s.name}</p>
                </button>
              );
            })}
          </div>
          <span className="inline-block text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
            {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? "s" : ""} selected
          </span>
        </section>

        {/* 3. Leave Details */}
        <section className="space-y-2">
          <h2 className="text-sm font-heading font-bold flex items-center gap-2">
            <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">3</span>
            Leave Details
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium">Reason for Leave</label>
              <select
                value={reasonType}
                onChange={(e) => setReasonType(e.target.value)}
                className="mt-1 w-full border border-border rounded-md p-2.5 text-sm bg-card"
              >
                <option value="">Select reason</option>
                {LEAVE_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Hospital Name <span className="text-muted-foreground">(if Medical)</span></label>
              <Input
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g. Shifa International"
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium">Start Date</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">End Date</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="mt-1" />
            </div>
          </div>
          <span className="inline-block text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
            Total Days: {totalDays}
          </span>
        </section>

        {/* 4. Documentation */}
        <section className="space-y-2">
          <h2 className="text-sm font-heading font-bold flex items-center gap-2">
            <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">4</span>
            Documentation
          </h2>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Attach Evidence <span className="text-muted-foreground">(Optional)</span></label>
            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1" />
            <ul className="text-[10px] text-muted-foreground mt-1 space-y-0.5 list-disc list-inside">
              <li>Medical leave: Upload hospital slip or report</li>
              <li>Official leave: Upload approval document</li>
              <li>Allowed formats: PDF, JPG, PNG (Max 2MB)</li>
            </ul>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Detailed Reason</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the reason for your leave..."
              rows={3}
              className="mt-1"
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print Draft
          </Button>
          <Button type="submit" className="flex-1 gradient-primary text-primary-foreground gap-2" disabled={submitting}>
            <Send className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>

      {/* Leave History */}
      <div>
        <h2 className="text-sm font-heading font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" /> Leave History
        </h2>
        {history.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No leave applications.</p>
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
