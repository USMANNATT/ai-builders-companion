import { apiPost } from "./api";

export async function getStudentInfo(studentId: string) {
  return apiPost("LeaveAjax.php", { action: "getStudentInfo", studentId });
}

export async function getLeaveSubjects(studentId: string) {
  return apiPost("LeaveAjax.php", { action: "getStudentSubjects", studentId });
}

export async function submitLeave(params: {
  roll_no: string;
  course_id: string;
  reason: string;
  from_date: string;
  to_date: string;
}) {
  return apiPost("LeaveAjax.php", { action: "submitLeave", ...params });
}

export async function fetchLeaveHistory(studentId: string) {
  return apiPost("LeaveAjax.php", { action: "fetchLeaves", studentId });
}
