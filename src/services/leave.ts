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
  return apiPost("LeaveAjax.php", {
    action: "submitLeave",
    roll_no: params.roll_no,
    course_id: String(params.course_id),
    reason: params.reason,
    from_date: params.from_date,
    to_date: params.to_date,
  });
}

export async function fetchLeaveHistory(studentId: string) {
  return apiPost("dashboardAjax.php", { action: "fetchLeaves", studentId });
}
