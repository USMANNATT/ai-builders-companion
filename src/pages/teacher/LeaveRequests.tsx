import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getLeaveRequests, approveLeave, rejectLeave } from "@/services/teacher";
import SkeletonCard from "@/components/SkeletonCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UPLOADS_URL } from "@/constants/urls";

export default function TeacherLeaveRequests() {
  const { studentId: teacherId } = useAuth();
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    if (!teacherId) return;
    setLoading(true);
    getLeaveRequests(teacherId)
      .then((res) => setLeaves(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [teacherId]);

  const handleAction = async (leaveId: string, action: "approve" | "reject") => {
    try {
      if (action === "approve") await approveLeave(leaveId);
      else await rejectLeave(leaveId);
      toast({ title: "Success", description: `Leave ${action}d successfully.` });
      fetchData();
    } catch {
      toast({ title: "Error", description: `Failed to ${action} leave.`, variant: "destructive" });
    }
  };

  if (loading) return <SkeletonCard count={3} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-xl font-heading font-bold">Leave Applications</h1>

      {leaves.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No leave applications found.</p>
      ) : (
        <div className="bg-card rounded-lg shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="gradient-hero text-primary-foreground text-xs font-semibold">
                <th className="p-3 text-left">Student Name</th>
                <th className="p-3 text-left">Roll No</th>
                <th className="p-3 text-left">Course</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Start</th>
                <th className="p-3 text-left">End</th>
                <th className="p-3 text-center">Days</th>
                <th className="p-3 text-left">Hospital</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-center">Attachment</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-left">Applied At</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l: any) => (
                <tr key={l.id || l.leave_id} className="border-b border-border hover:bg-muted/40">
                  <td className="p-3">{l.student_name || l.name}</td>
                  <td className="p-3 font-mono text-xs">{l.roll_no || l.roll_number}</td>
                  <td className="p-3">{l.course_title || l.course_name || l.course}</td>
                  <td className="p-3">{l.leave_reason || l.reason}</td>
                  <td className="p-3">{l.start_date || l.from_date}</td>
                  <td className="p-3">{l.end_date || l.to_date}</td>
                  <td className="p-3 text-center">{l.total_days || l.days}</td>
                  <td className="p-3">{l.hospital_name || l.hospital || "-"}</td>
                  <td className="p-3 max-w-[200px] truncate">{l.description || "-"}</td>
                  <td className="p-3 text-center">
                    {l.attachment || l.file ? (
                      <a href={`${UPLOADS_URL}${l.attachment || l.file}`} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs">
                        View
                      </a>
                    ) : "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1 items-center">
                      {l.status?.toLowerCase() === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-success text-success-foreground hover:bg-success/80 text-xs h-7 px-2"
                            onClick={() => handleAction(l.id || l.leave_id, "approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs h-7 px-2"
                            onClick={() => handleAction(l.id || l.leave_id, "reject")}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          l.status?.toLowerCase() === "approved" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                        }`}>
                          {l.status}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{l.created_at || l.applied_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
