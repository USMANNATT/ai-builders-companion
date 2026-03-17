import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getFeedbacks } from "@/services/teacher";
import SkeletonCard from "@/components/SkeletonCard";

export default function TeacherFeedback() {
  const { studentId: teacherId } = useAuth();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) return;
    getFeedbacks(teacherId)
      .then((res) => setFeedbacks(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teacherId]);

  if (loading) return <SkeletonCard count={2} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="bg-card rounded-xl p-6 shadow-card text-center">
        <h1 className="text-xl font-heading font-bold text-primary">📋 All Feedback</h1>
        <p className="text-sm text-muted-foreground mt-1">View all submitted feedback entries</p>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-card">
        <p className="text-sm mb-3">Total Feedbacks: <span className="text-primary font-bold">{feedbacks.length}</span></p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="gradient-primary text-primary-foreground text-xs">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Roll</th>
                <th className="p-3 text-left">Section</th>
                <th className="p-3 text-left">Rating</th>
                <th className="p-3 text-left">Feedback Message</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length === 0 ? (
                <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">No feedback found</td></tr>
              ) : feedbacks.map((f: any, i: number) => (
                <tr key={f.id || i} className="border-b border-border">
                  <td className="p-3">{f.id || i + 1}</td>
                  <td className="p-3">{f.name || f.student_name}</td>
                  <td className="p-3">{f.email}</td>
                  <td className="p-3 font-mono text-xs">{f.roll_no || f.roll}</td>
                  <td className="p-3">{f.section}</td>
                  <td className="p-3">{f.rating}</td>
                  <td className="p-3 max-w-[200px] truncate">{f.message || f.feedback}</td>
                  <td className="p-3 text-xs">{f.date || f.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
